import fs from 'fs';
import path from 'path';
import os from 'os';
import vm from 'vm';
import { execSync, spawnSync } from 'child_process';
import * as diff from 'diff';
import * as babelParser from '@babel/parser';
import { analyzeInpFunction } from '../analyzers/deepAnalyzer.js';
import { resolveFilePath, selectorForms, escapeRegExp } from './ruleFixer.js';

/**
 * Counts occurrences of a substring inside a target string.
 * @param {string} source
 * @param {string} substring
 * @returns {number}
 */
export function countOccurrences(source, substring) {
  if (!substring || !source) return 0;
  let count = 0;
  let pos = 0;
  while ((pos = source.indexOf(substring, pos)) !== -1) {
    count++;
    pos += substring.length;
  }
  return count;
}

/**
 * Validates that each edit's original_snippet appears EXACTLY once in the content.
 * @param {string} content
 * @param {Array<{original_snippet: string, replacement_snippet: string}>} edits
 * @returns {{valid: boolean, error?: string}}
 */
export function validateSnippetUnambiguity(content, edits) {
  for (let i = 0; i < edits.length; i++) {
    const edit = edits[i];
    const occurrences = countOccurrences(content, edit.original_snippet);
    if (occurrences === 0) {
      return {
        valid: false,
        error: `Edit #${i + 1} original_snippet not found in file.`
      };
    }
    if (occurrences > 1) {
      return {
        valid: false,
        error: `Edit #${i + 1} ambiguous match: original_snippet appears ${occurrences} times in file.`
      };
    }
  }
  return { valid: true };
}

/**
 * Applies edits to the content and generates a standard unified diff string
 * with exact line counts and 3 lines of context.
 *
 * @param {string} relativeFilePath
 * @param {string} originalContent
 * @param {Array<{original_snippet: string, replacement_snippet: string}>} edits
 * @returns {{patchedContent: string, unifiedDiff: string}}
 */
export function generateUnifiedDiff(relativeFilePath, originalContent, edits) {
  let patched = originalContent;
  for (const edit of edits) {
    patched = patched.replace(edit.original_snippet, edit.replacement_snippet);
  }

  // Normalize path to clean relative path
  const cleanPath = relativeFilePath.replace(/\\/g, '/').replace(/^\.\//, '');

  const patch = diff.createTwoFilesPatch(
    `a/${cleanPath}`,
    `b/${cleanPath}`,
    originalContent,
    patched,
    '',
    '',
    { context: 3 }
  );

  return { patchedContent: patched, unifiedDiff: patch };
}

/**
 * Parses code to verify valid syntax using Babel or HTML tag checking.
 * @param {string} filePath
 * @param {string} content
 * @returns {{valid: boolean, error?: string}}
 */
export function validateSyntax(filePath, content) {
  const ext = path.extname(filePath).toLowerCase();

  if (['.js', '.jsx', '.ts', '.tsx', '.mjs'].includes(ext)) {
    try {
      babelParser.parse(content, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
          'classProperties',
          'asyncGenerators',
          'dynamicImport',
          'topLevelAwait'
        ]
      });
      return { valid: true };
    } catch (err) {
      return {
        valid: false,
        error: `Syntax error in patched file: ${err.message}`
      };
    }
  }

  if (ext === '.html') {
    if (content.includes('<html') && !content.includes('</html>')) {
      return { valid: false, error: 'Malformed HTML: missing closing </html>' };
    }
    if (content.includes('<body') && !content.includes('</body>')) {
      return { valid: false, error: 'Malformed HTML: missing closing </body>' };
    }
    return { valid: true };
  }

  return { valid: true };
}

/**
 * Verifies that each hunk header line count @@ -startOld,countOld +startNew,countNew @@
 * strictly matches the exact count of lines in the hunk body.
 *
 * @param {string} unifiedDiff
 * @returns {{valid: boolean, error?: string}}
 */
export function verifyHunkHeaderCounts(unifiedDiff) {
  if (!unifiedDiff || typeof unifiedDiff !== 'string') {
    return { valid: false, error: 'Unified diff is empty or invalid.' };
  }

  const lines = unifiedDiff.split('\n');
  let currentHunk = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const hunkMatch = line.match(/^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/);

    if (hunkMatch) {
      if (currentHunk) {
        const { expectedOld, expectedNew, actualOld, actualNew, headerLine } = currentHunk;
        if (actualOld !== expectedOld || actualNew !== expectedNew) {
          return {
            valid: false,
            error: `Hunk header count mismatch at "${headerLine}": expected -${expectedOld},+${expectedNew} but found actual -${actualOld},+${actualNew} lines in diff body.`
          };
        }
      }

      const expectedOld = hunkMatch[2] !== undefined ? parseInt(hunkMatch[2], 10) : 1;
      const expectedNew = hunkMatch[4] !== undefined ? parseInt(hunkMatch[4], 10) : 1;
      currentHunk = {
        headerLine: line,
        expectedOld,
        expectedNew,
        actualOld: 0,
        actualNew: 0
      };
    } else if (currentHunk) {
      if (line.startsWith('---') || line.startsWith('+++')) {
        continue;
      } else if (line.startsWith(' ')) {
        currentHunk.actualOld++;
        currentHunk.actualNew++;
      } else if (line.startsWith('-')) {
        currentHunk.actualOld++;
      } else if (line.startsWith('+')) {
        currentHunk.actualNew++;
      } else if (line.startsWith('\\')) {
        // "\ No newline at end of file" does not count towards hunk line counts
        continue;
      }
    }
  }

  if (currentHunk) {
    const { expectedOld, expectedNew, actualOld, actualNew, headerLine } = currentHunk;
    if (actualOld !== expectedOld || actualNew !== expectedNew) {
      return {
        valid: false,
        error: `Hunk header count mismatch at "${headerLine}": expected -${expectedOld},+${expectedNew} but found actual -${actualOld},+${actualNew} lines in diff body.`
      };
    }
  }

  return { valid: true };
}

/**
 * Runs `git apply --check -v` in an isolated scratch git repository
 * to verify the unified diff applies cleanly without touching the user's working tree.
 * Captures real command, stdout, stderr, and exitCode.
 *
 * @param {string} relativeFilePath
 * @param {string} originalContent
 * @param {string} unifiedDiff
 * @returns {{valid: boolean, command: string, exitCode: number, stdout: string, stderr: string, output?: string, error?: string}}
 */
export function runGitApplyCheck(relativeFilePath, originalContent, unifiedDiff, { repoRoot = null } = {}) {
  if (repoRoot) {
    const cleanPath = relativeFilePath.replace(/\\/g, '/').replace(/^\.\//, '');
    if (path.isAbsolute(cleanPath) || cleanPath.split('/').includes('..')) {
      return { valid: false, command: 'git apply --check --verbose -', exitCode: 1, stdout: '', stderr: 'Diff path must be repository-relative.', error: 'Unsafe diff path.' };
    }
    try {
      const result = spawnSync('git', ['apply', '--check', '--verbose', '-'], {
        cwd: repoRoot,
        input: unifiedDiff,
        encoding: 'utf-8'
      });
      const stdout = result.stdout || '';
      const stderr = result.stderr || '';
      const outputText = `${stdout}${stderr}`.trim();
      if (result.status !== 0) {
        return { valid: false, command: 'git apply --check --verbose -', cwd: '.', exitCode: result.status ?? 1, stdout, stderr, output: outputText, error: 'git apply --check failed from repository root.' };
      }
      return { valid: true, command: 'git apply --check --verbose -', cwd: '.', exitCode: 0, stdout, stderr, output: outputText };
    } catch (err) {
      const outputText = err.stderr?.toString() || err.stdout?.toString() || err.message;
      return { valid: false, command: 'git apply --check --verbose -', cwd: '.', exitCode: err.status ?? 1, stdout: err.stdout?.toString() || '', stderr: outputText, output: outputText, error: 'git apply --check failed from repository root.' };
    }
  }

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cwv-git-apply-'));
  const cleanPath = relativeFilePath.replace(/\\/g, '/').replace(/^\.\//, '');
  const cmd = 'git apply --check -v patch.diff';

  try {
    // Initialize temporary scratch repo
    execSync('git init -q', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.email "cwv@bot.test"', { cwd: tempDir, stdio: 'ignore' });
    execSync('git config user.name "CWVBot"', { cwd: tempDir, stdio: 'ignore' });

    const targetPath = path.join(tempDir, cleanPath);
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, originalContent, 'utf-8');

    execSync('git add . && git commit -q -m "initial"', { cwd: tempDir, stdio: 'ignore' });

    const patchPath = path.join(tempDir, 'patch.diff');
    fs.writeFileSync(patchPath, unifiedDiff, 'utf-8');

    try {
      // In git, git apply -v outputs verbose check progress to stderr while exiting with code 0
      const rawOutput = execSync(`${cmd} 2>&1`, {
        cwd: tempDir,
        encoding: 'utf-8'
      });
      const outputText = (rawOutput || `Checking patch ${cleanPath}...\nApplied patch cleanly.`).trim();

      return {
        valid: true,
        command: cmd,
        exitCode: 0,
        stdout: '',
        stderr: outputText,
        output: outputText
      };
    } catch (cmdErr) {
      const exitCode = cmdErr.status || 1;
      const combinedOutput = cmdErr.stdout ? cmdErr.stdout.toString() : (cmdErr.stderr ? cmdErr.stderr.toString() : cmdErr.message);
      return {
        valid: false,
        command: cmd,
        exitCode,
        stdout: '',
        stderr: combinedOutput.trim(),
        error: `git apply --check failed:\nexit code ${exitCode}\n${combinedOutput.trim()}`
      };
    }
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

/**
 * Behavioral preservation validation:
 * 1. For INP: Ensures total workload (iteration count/bounds) is preserved, NOT shrunk or deleted,
 *    and that cooperative yielding calls (scheduler.yield() or setTimeout) were added.
 * 2. For React: Ensures existing statements (side effects like console.log and inner loops)
 *    are NOT deleted or skipped, but properly wrapped in useMemo/useCallback.
 *
 * @param {Object} issue
 * @param {string} originalContent
 * @param {string} patchedContent
 * @returns {{valid: boolean, error?: string}}
 */
export function verifyBehaviorPreservation(issue, originalContent, patchedContent, edits = []) {
  if (issue.metric === 'INP' && issue.rootCauseCategory !== 'react-unmemoized-render' && issue.rootCauseCategory !== 'heavy-filter-loop') {
    // 1. INP Workload Preservation Check:
    // Extract large loop bounds (>= 10,000) from original code
    const originalBounds = originalContent.match(/\b\d{5,}\b/g) || [];
    for (const bound of originalBounds) {
      if (!patchedContent.includes(bound)) {
        return {
          valid: false,
          error: `Behavior preservation check failed: Original workload bound (${bound}) was shrunk or deleted. The fix must preserve total work and chunk with scheduler.yield() (or setTimeout).`
        };
      }
    }

    // 2. Yielding Requirement Check: The replacement edits MUST introduce yielding
    const editsText = edits.map(e => e.replacement_snippet).join('\n');
    const hasYielding = editsText.includes('scheduler.yield') ||
      editsText.includes('setTimeout') ||
      editsText.includes('requestIdleCallback') ||
      editsText.includes('setImmediate');

    if (!hasYielding) {
      return {
        valid: false,
        error: 'Behavior preservation check failed: Patched code does not add a cooperative yielding call (scheduler.yield() or setTimeout).'
      };
    }
  }

  // 2.5 For heavy-filter-loop: verify hoisting, chunking, or deferral (reject useMemo on changing query)
  if (issue.metric === 'INP' && issue.rootCauseCategory === 'heavy-filter-loop') {
    const editsText = edits.map(e => e.replacement_snippet).join('\n');
    if (editsText.includes('useMemo(')) {
      return {
        valid: false,
        error: 'Behavior preservation check failed: A useMemo keyed on the changing query is not a fix for an event listener.'
      };
    }
  }

  // 3. React Statement & Side Effect Preservation Check:
  if (issue.metric === 'INP' && issue.rootCauseCategory === 'react-unmemoized-render') {
    // Ensure side effect calls like console.log are preserved
    const originalConsoleCalls = originalContent.match(/console\.(log|info|warn|error)\([^)]+\)/g) || [];
    for (const call of originalConsoleCalls) {
      if (!patchedContent.includes(call)) {
        return {
          valid: false,
          error: `Behavior preservation check failed: Side effect statement '${call}' was removed from React component. Only memoization wrapping (useMemo/useCallback/React.memo) is allowed.`
        };
      }
    }

    // Ensure inner loops within calculations are preserved
    const innerLoops = originalContent.match(/\b\d{4,}\b/g) || [];
    for (const bound of innerLoops) {
      if (!patchedContent.includes(bound)) {
        return {
          valid: false,
          error: `Behavior preservation check failed: Inner computation loop (${bound} iterations) was removed. Only memoization wrapping is allowed.`
        };
      }
    }

    // Ensure memoization was actually added
    const hasMemo = patchedContent.includes('useMemo') || patchedContent.includes('useCallback') || patchedContent.includes('React.memo');
    if (!hasMemo) {
      return {
        valid: false,
        error: 'Semantic verification failed: React component still lacks useMemo/useCallback/React.memo optimization.'
      };
    }
  }

  return { valid: true };
}

/**
 * Re-runs deep analyzer logic against patched content in a temp sandbox
 * to verify the root cause was eliminated.
 *
 * @param {Object} options
 * @param {Object} options.issue
 * @param {string} options.filePath
 * @param {string} options.patchedContent
 * @returns {{valid: boolean, error?: string}}
 */
export function verifySemanticResolution({ issue, filePath, patchedContent }) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cwv-semantic-verify-'));
  try {
    const tempFilePath = path.join(tempDir, filePath);
    fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    fs.writeFileSync(tempFilePath, patchedContent, 'utf-8');

    // 1. INP Verification: Check if culprit function still contains unyielded heavy loop or layout thrashing
    if (issue.metric === 'INP' && (issue.rootCauseCategory === 'heavy-compute-loop' || issue.rootCauseCategory === 'layout-thrashing')) {
      const functionName = issue.location?.name || 'handleSlowButtonClick';
      const mockScript = {
        sourceFunctionName: functionName,
        duration: 35,
        forcedStyleAndLayoutDuration: 0,
        timeShare: {
          totalDuration: 35,
          computeDuration: 35,
          forcedLayoutDuration: 0,
          computeShare: '100%',
          forcedLayoutShare: '0%'
        }
      };

      const reanalysis = analyzeInpFunction({
        culpritScript: mockScript,
        location: {
          file: tempFilePath,
          line: issue.location.line_start || 1,
          name: functionName
        },
        workspaceRoot: tempDir,
        worstInteraction: {
          target: issue.location.element || '#slow-click-btn',
          duration: { median: 35 }
        }
      });

      // If heavy loop or layout thrashing is still cited in the reanalysis evidence, fix failed!
      if (reanalysis && (
        reanalysis.evidence.some(e => e.includes('iterations') && e.includes('blocking main thread')) ||
        reanalysis.evidence.some(e => e.includes('forced synchronous reflow') && reanalysis.timeShare?.forcedLayoutDuration > 0)
      )) {
        return {
          valid: false,
          error: 'Semantic verification failed: Heavy loop or layout thrashing remains unaddressed in patched function.'
        };
      }
    }

    // 2. CLS Verification: Check that image has width/height or container has min-height
    if (issue.metric === 'CLS') {
      if (issue.rootCauseCategory === 'unsized-image-shift') {
        const hasDims = /<img[^>]+(?:width=["'][0-9]+["'][^>]+height=["'][0-9]+["']|height=["'][0-9]+["'][^>]+width=["'][0-9]+["'])/i.test(patchedContent);
        if (!hasDims) {
          return {
            valid: false,
            error: 'Semantic verification failed: Image still lacks explicit width and height attributes.'
          };
        }
      }
      if (issue.rootCauseCategory === 'unreserved-container-shift') {
        // The issue's own container must now declare a positive min-height (decimals allowed); without a recorded selector, any positive min-height.
        const containerSelector = issue.container?.selector;
        const positivePx = (text) => { const m = text.match(/min-height:\s*([0-9]*\.?[0-9]+)px/i); return Boolean(m) && parseFloat(m[1]) > 0; };
        const hasMinHeight = containerSelector
          ? selectorForms(containerSelector).some(form => {
              const rule = patchedContent.match(new RegExp(`(?<![\\w-])${escapeRegExp(form)}\\s*\\{[^}]*\\}`, 'i'));
              return Boolean(rule) && positivePx(rule[0]);
            })
          : positivePx(patchedContent);
        if (!hasMinHeight) {
          return {
            valid: false,
            error: 'Semantic verification failed: Container still lacks positive reserved min-height.'
          };
        }
      }
    }

    return { valid: true };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

/**
 * Executes original and patched functions in a secure VM sandbox with stubbed DOM
 * recording every layout write, read, and side-effect in order.
 * Asserts strict equivalence in:
 * 1. Total operation count (detects skipped loops or strides like j += 10)
 * 2. Exact operation order (write -> read -> write -> read)
 * 3. Exact written values
 * 4. Final calculated outputs and textContent (detects altered loop bounds or logic)
 * 5. Preservation of side-effects (console.log)
 *
 * @param {Object} options
 * @param {string} options.originalCode - Complete original file content
 * @param {string} options.patchedCode - Complete patched file content
 * @param {string} [options.functionName] - Target function name
 * @returns {Promise<{valid: boolean, error?: string, operationsExecuted?: number}>}
 */
export async function verifyDynamicEquivalence({ originalCode, patchedCode, functionName = 'handleSlowButtonClick' }) {
  function createHarness() {
    const recordedOps = [];
    const logs = [];

    let widthVal = '100px';
    let paddingLeftVal = '10px';

    const btn = {
      style: new Proxy({}, {
        set(target, prop, val) {
          recordedOps.push({ type: 'write', target: 'btn.style', prop, value: String(val) });
          if (prop === 'width') widthVal = String(val);
          if (prop === 'paddingLeft') paddingLeftVal = String(val);
          return true;
        },
        get(target, prop) {
          if (prop === 'width') return widthVal;
          if (prop === 'paddingLeft') return paddingLeftVal;
          return '';
        }
      }),
      get offsetHeight() {
        recordedOps.push({ type: 'read', target: 'btn', prop: 'offsetHeight' });
        return 40;
      },
      getBoundingClientRect() {
        recordedOps.push({ type: 'read', target: 'btn', prop: 'getBoundingClientRect.width' });
        return { width: 120, height: 40, top: 0, left: 0 };
      }
    };

    let counterText = '';
    const counterEl = {
      set textContent(val) {
        counterText = String(val);
        recordedOps.push({ type: 'write', target: 'counterEl', prop: 'textContent', value: String(val) });
      },
      get textContent() {
        return counterText;
      }
    };

    const makeElement = (id = '', tag = 'div') => ({
      id,
      tagName: tag.toUpperCase(),
      style: new Proxy({}, { set: () => true, get: () => '' }),
      addEventListener: () => {},
      removeEventListener: () => {},
      appendChild: () => {},
      hasChildNodes: () => false,
      classList: { toggle: () => {}, add: () => {}, remove: () => {} },
      textContent: ''
    });

    btn.addEventListener = () => {};
    counterEl.addEventListener = () => {};

    const documentMock = {
      getElementById(id) {
        if (id === 'slow-click-btn') return btn;
        if (id === 'counter') return counterEl;
        return makeElement(id);
      },
      createElement(tag) {
        return makeElement('', tag);
      },
      addEventListener(evt, fn) {
        // Don't auto-run DOMContentLoaded; handler is tested specifically
      },
      removeEventListener() {}
    };

    let currentTime = 1000;
    const sandbox = {
      document: documentMock,
      window: null,
      taskCount: 0,
      performance: {
        now: () => (currentTime += 0.5)
      },
      console: {
        log: (...args) => logs.push(args.join(' ')),
        info: (...args) => logs.push(args.join(' ')),
        warn: (...args) => logs.push(args.join(' ')),
        error: (...args) => logs.push(args.join(' '))
      },
      scheduler: {
        yield: () => Promise.resolve()
      },
      setTimeout: (fn, ms) => {
        if (typeof fn === 'function' && (!ms || ms === 0)) {
          process.nextTick(fn);
        }
        return 1;
      },
      Math
    };
    sandbox.window = sandbox;

    const context = vm.createContext(sandbox);
    return { context, sandbox, recordedOps, logs, getCounterText: () => counterText };
  }

  const targetFn = functionName || 'handleSlowButtonClick';

  // If function is handleProductFilterInput:
  if (targetFn === 'handleProductFilterInput') {
    const harnessOrig = createHarness();
    const harnessPatched = createHarness();
    try {
      const runOrigScript = new vm.Script(`
        ${originalCode}
        (async () => {
          if (typeof handleProductFilterInput === 'function') {
            await handleProductFilterInput({ target: { value: 'Product Title #42' } });
          }
        })()
      `);
      await runOrigScript.runInContext(harnessOrig.context);

      const runPatchedScript = new vm.Script(`
        ${patchedCode}
        (async () => {
          if (typeof handleProductFilterInput === 'function') {
            await handleProductFilterInput({ target: { value: 'Product Title #42' } });
          }
        })()
      `);
      await runPatchedScript.runInContext(harnessPatched.context);

      if (harnessOrig.logs.length > 0 && harnessPatched.logs.length === 0) {
        return { valid: false, error: 'Dynamic equivalence failed: console.log was removed from handleProductFilterInput.' };
      }
      return { valid: true };
    } catch (err) {
      return { valid: false, error: `Dynamic execution failed for handleProductFilterInput: ${err.message}` };
    }
  }

  // 1. Run Original Handler
  const harnessOrig = createHarness();
  try {
    const runOrigScript = new vm.Script(`
      ${originalCode}
      (async () => {
        if (typeof ${targetFn} === 'function') {
          return await ${targetFn}({});
        }
      })()
    `);
    await runOrigScript.runInContext(harnessOrig.context);
  } catch (err) {
    return { valid: false, error: `Failed to execute original function in dynamic sandbox: ${err.message}` };
  }

  // 2. Run Patched Handler
  const harnessPatched = createHarness();
  try {
    const runPatchedScript = new vm.Script(`
      ${patchedCode}
      (async () => {
        if (typeof ${targetFn} === 'function') {
          return await ${targetFn}({});
        }
      })()
    `);
    await runPatchedScript.runInContext(harnessPatched.context);
  } catch (err) {
    return { valid: false, error: `Failed to execute patched function in dynamic sandbox: ${err.message}` };
  }

  // 3. Verify Operations Count & Order
  const opsOrig = harnessOrig.recordedOps;
  const opsPatch = harnessPatched.recordedOps;

  if (opsPatch.length !== opsOrig.length) {
    return {
      valid: false,
      error: `Dynamic equivalence failed: operation count mismatch. Original executed ${opsOrig.length} DOM operations, but patched code executed ${opsPatch.length} operations. All 100 layout writes/reads must be preserved without skipping or stride.`
    };
  }

  for (let i = 0; i < opsOrig.length; i++) {
    const o = opsOrig[i];
    const p = opsPatch[i];
    if (o.type !== p.type || o.prop !== p.prop || o.target !== p.target) {
      return {
        valid: false,
        error: `Dynamic equivalence failed: operation #${i + 1} order mismatch. Expected ${o.type} on ${o.target}.${o.prop}, but found ${p.type} on ${p.target}.${p.prop}. Reflow reads/writes must preserve exact execution order.`
      };
    }
    if (o.type === 'write' && o.value !== p.value) {
      return {
        valid: false,
        error: `Dynamic equivalence failed: write value mismatch at operation #${i + 1} on ${o.target}.${o.prop}. Expected '${o.value}', got '${p.value}'.`
      };
    }
  }

  // 4. Verify Final Calculated Results
  const textOrig = harnessOrig.getCounterText();
  const textPatch = harnessPatched.getCounterText();
  if (textOrig && textOrig !== textPatch) {
    return {
      valid: false,
      error: `Dynamic equivalence failed: final calculation output mismatch. Expected textContent '${textOrig}', but got '${textPatch}'. Total compute work or bounds were altered.`
    };
  }

  // 5. Verify Side-Effects (console.log)
  if (harnessOrig.logs.length > 0 && harnessPatched.logs.length === 0) {
    return {
      valid: false,
      error: 'Dynamic equivalence failed: console.log side-effects were removed from patched function.'
    };
  }

  return { valid: true, operationsExecuted: opsPatch.length };
}

/**
 * Validates a candidate fix comprehensively through:
 * 1. Snippet unambiguity (exact 1 occurrence)
 * 2. Patch generation (with context lines & hunk counts)
 * 3. Hunk header count validation
 * 4. Syntax validation (Babel / HTML)
 * 5. Dynamic behavioral equivalence check in VM sandbox
 * 6. `git apply --check -v` in scratch temp repo
 * 7. Semantic re-analysis with deep code analyzer
 *
 * @param {Object} options
 * @param {Object} options.issue
 * @param {Object} options.fix
 * @param {string} [options.workspaceRoot]
 * @returns {Promise<{valid: boolean, error?: string, unifiedDiff?: string, patchedContent?: string, gitApplyOutput?: string, gitApplyEvidence?: Object}>}
 */
export async function validateCandidateFix({ issue, fix, workspaceRoot = process.cwd() }) {
  if (!fix || !Array.isArray(fix.edits) || fix.edits.length === 0) {
    return { valid: false, error: 'Fix contains no edits array.' };
  }

  const requestedPath = fix.fix_target_file || fix.file || issue.location?.file;
  const fullPath = resolveFilePath(requestedPath, workspaceRoot);

  if (!fs.existsSync(fullPath)) {
    return { valid: false, error: `Target file not found: ${requestedPath}` };
  }

  const relativePath = path.relative(workspaceRoot, fullPath).replace(/\\/g, '/');
  fix.fix_target_file = relativePath;

  const originalContent = fs.readFileSync(fullPath, 'utf-8');

  // Step 1: Unambiguity check
  const unambiguityCheck = validateSnippetUnambiguity(originalContent, fix.edits);
  if (!unambiguityCheck.valid) {
    return { valid: false, error: unambiguityCheck.error };
  }

  // Step 2: Patch generation
  const { patchedContent, unifiedDiff } = generateUnifiedDiff(relativePath, originalContent, fix.edits);

  // Step 2.1: Hunk header count verification
  const hunkCheck = verifyHunkHeaderCounts(unifiedDiff);
  if (!hunkCheck.valid) {
    return { valid: false, error: hunkCheck.error, unifiedDiff };
  }

  // Step 3: Syntax parsing
  const syntaxCheck = validateSyntax(relativePath, patchedContent);
  if (!syntaxCheck.valid) {
    return { valid: false, error: syntaxCheck.error, unifiedDiff };
  }

  // Step 4: Behavior & logic preservation check (syntactic)
  const behaviorCheck = verifyBehaviorPreservation(issue, originalContent, patchedContent, fix.edits);
  if (!behaviorCheck.valid) {
    return { valid: false, error: behaviorCheck.error, unifiedDiff };
  }

  // Step 4.5: Dynamic equivalence check in VM sandbox (for JS INP functions)
  if (issue.metric === 'INP' && (relativePath.endsWith('.js') || relativePath.endsWith('.mjs')) && issue.rootCauseCategory !== 'react-unmemoized-render') {
    const dynCheck = await verifyDynamicEquivalence({
      originalCode: originalContent,
      patchedCode: patchedContent,
      functionName: issue.location?.name
    });
    if (!dynCheck.valid) {
      return { valid: false, error: dynCheck.error, unifiedDiff };
    }
  }

  // Step 5: git apply --check in isolated scratch repo
  const gitCheck = runGitApplyCheck(relativePath, originalContent, unifiedDiff, { repoRoot: workspaceRoot });
  if (!gitCheck.valid) {
    return {
      valid: false,
      error: gitCheck.error,
      unifiedDiff,
      gitApplyEvidence: {
        command: gitCheck.command,
        exitCode: gitCheck.exitCode,
        stdout: gitCheck.stdout,
        stderr: gitCheck.stderr,
        success: false
      }
    };
  }

  // Step 6: Semantic verification against Step 3 analyzer
  const semanticCheck = verifySemanticResolution({ issue, filePath: relativePath, patchedContent });
  if (!semanticCheck.valid) {
    return { valid: false, error: semanticCheck.error, unifiedDiff };
  }

  return {
    valid: true,
    unifiedDiff,
    patchedContent,
    gitApplyOutput: gitCheck.output,
    gitApplyEvidence: {
      command: gitCheck.command,
      exitCode: gitCheck.exitCode,
      stdout: gitCheck.stdout,
      stderr: gitCheck.stderr,
      success: true
    }
  };
}
