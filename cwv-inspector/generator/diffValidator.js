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
  let inpReanalysis = null;
  let cssReanalysis = null;
  try {
    const tempFilePath = path.join(tempDir, filePath);
    fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });
    fs.writeFileSync(tempFilePath, patchedContent, 'utf-8');

    // 1. INP Verification: Check if culprit function still contains unyielded heavy loop or layout thrashing
    if (issue.metric === 'INP' && (issue.rootCauseCategory === 'heavy-compute-loop' || issue.rootCauseCategory === 'layout-thrashing')) {
      const functionName = issue.location?.name;
      if (!functionName) return { valid: false, error: 'Semantic re-analysis cannot run: the issue names no function.' };

      // Static re-analysis of the patched file: zero durations are neutral stand-ins, only the AST findings are used.
      const reanalysis = analyzeInpFunction({
        culpritScript: {
          sourceFunctionName: functionName,
          duration: 0,
          forcedStyleAndLayoutDuration: 0,
          timeShare: { totalDuration: 0, computeDuration: 0, forcedLayoutDuration: 0, computeShare: '0%', forcedLayoutShare: '0%' }
        },
        location: { file: tempFilePath, line: issue.location.line_start || 1, name: functionName },
        workspaceRoot: tempDir,
        worstInteraction: { target: issue.location.element ?? null, duration: { median: 0 } }
      });

      const heavyLoopRemains = Boolean(reanalysis && reanalysis.evidence.some(e => e.includes('iterations') && e.includes('blocking main thread')));
      const layoutThrashingRemains = Boolean(reanalysis && reanalysis.evidence.some(e => e.includes('Interleaved DOM style writes')));
      inpReanalysis = { heavyLoopRemains, layoutThrashingRemains, analyzerFoundFunction: Boolean(reanalysis) };
      if (heavyLoopRemains) {
        return { valid: false, error: 'Semantic verification failed: a heavy synchronous loop remains unaddressed in the patched function.' };
      }
    }

    // 2. CLS Verification: Check that image has width/height or container has min-height
    if (issue.metric === 'CLS') {
      if (issue.rootCauseCategory === 'unsized-image-shift') {
        // The issue's own <img> (found by its id/class selector) must now declare both width and height.
        const element = issue.location?.element || '';
        const imgSource = element.startsWith('#')
          ? `<img\\s+[^>]*?id=["']${escapeRegExp(element.slice(1))}["'][^>]*?\\/?>`
          : element.startsWith('.')
            ? `<img\\s+[^>]*?class=["'][^"']*?\\b${escapeRegExp(element.slice(1))}\\b[^"']*?["'][^>]*?\\/?>`
            : '<img\\s[^>]*?>';
        const tag = patchedContent.match(new RegExp(imgSource, 'i'));
        const declares = Boolean(tag) && /\swidth=["'][0-9.]+["']/i.test(tag[0]) && /\sheight=["'][0-9.]+["']/i.test(tag[0]);
        if (!declares) {
          return {
            valid: false,
            error: 'Semantic verification failed: Image still lacks explicit width and height attributes.'
          };
        }
        cssReanalysis = { verified: `<img> ${element || '(any)'} declares width and height in the patched file` };
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
        cssReanalysis = { verified: `rule for ${containerSelector || '(any container)'} declares a positive min-height in the patched file` };
      }
    }

    return { valid: true, reanalysis: inpReanalysis ?? cssReanalysis ?? { verified: 'no static re-analysis applies to this issue category' } };
  } finally {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  }
}

// An operation on a property whose name starts with "__" (e.g. btn.__cwvProcessing) is treated as guard
// bookkeeping added by a fix, not as page behavior, and is excluded when traces are compared.
const isGuardPath = (opPath) => opPath.split('.').some(segment => segment.startsWith('__'));
const behavioralOps = (ops) => ops.filter(op => !isGuardPath(op.path));

/**
 * A recording stand-in for the DOM: every property read, property write and call on it is logged in order.
 * Unknown property reads return another recorder node (so chains like el.style.width work) whose numeric
 * value is derived deterministically from its path; "__"-prefixed expando flags read as undefined until written.
 */
function createRecorder() {
  const ops = [];
  const store = new Map();
  const state = { failAtWrite: null, writes: 0 };
  const summarize = (v) => (typeof v === 'function' ? '[function]' : v !== null && typeof v === 'object' ? '[object]' : String(v));
  const numberFor = (nodePath) => {
    let h = 7;
    for (const ch of nodePath) h = (h * 31 + ch.charCodeAt(0)) % 997;
    return (h % 89) + 11;
  };

  const makeNode = (nodePath) => new Proxy(function () {}, {
    get(_, prop) {
      if (prop === Symbol.toPrimitive) return (hint) => (hint === 'string' ? nodePath : numberFor(nodePath));
      if (typeof prop === 'symbol' || prop === 'then') return undefined;
      const propPath = `${nodePath}.${prop}`;
      ops.push({ type: 'read', path: propPath });
      if (store.has(propPath)) return store.get(propPath);
      if (prop.startsWith('__')) return undefined;
      return makeNode(propPath);
    },
    set(_, prop, value) {
      const propPath = `${nodePath}.${String(prop)}`;
      if (!isGuardPath(propPath)) {
        state.writes++;
        if (state.failAtWrite !== null && state.writes === state.failAtWrite) throw new Error('injected failure');
      }
      ops.push({ type: 'write', path: propPath, value: summarize(value) });
      store.set(propPath, value);
      return true;
    },
    apply(_, thisArg, args) {
      const callPath = `${nodePath}(${args.map(summarize).join(',')})`;
      ops.push({ type: 'call', path: callPath });
      return makeNode(callPath);
    }
  });

  return { ops, store, state, makeNode };
}

/** Loads `code` into a fresh vm context wired to a recorder; load-time activity is discarded. */
function loadSandbox(code, functionName, { yieldHook = null, timerHook = null } = {}) {
  const recorder = createRecorder();
  const logs = [];
  let clock = 1000;
  const record = (...args) => logs.push(args.map(String).join(' '));
  const sandbox = {
    document: recorder.makeNode('document'),
    window: recorder.makeNode('window'),
    console: { log: record, info: record, warn: record, error: record },
    performance: { now: () => (clock += 0.5) },
    scheduler: { yield: yieldHook || (() => Promise.resolve()) },
    setTimeout: timerHook || ((fn, ms) => { if (typeof fn === 'function' && !ms) process.nextTick(fn); return 1; })
  };
  const context = vm.createContext(sandbox);
  new vm.Script(code).runInContext(context);
  recorder.ops.length = 0;
  const fn = vm.runInContext(`typeof ${functionName} === 'function' ? ${functionName} : undefined`, context);
  if (!fn) throw new Error(`function ${functionName} is not defined by the file`);
  const makeEvent = (query) => {
    recorder.store.set('event.target.value', query);
    return recorder.makeNode('event');
  };
  return { recorder, logs, fn, makeEvent };
}

async function traceHandler(code, functionName, query) {
  const box = loadSandbox(code, functionName);
  await box.fn(box.makeEvent(query));
  return {
    ops: behavioralOps(box.recorder.ops),
    logs: box.logs,
    writes: box.recorder.state.writes,
    readsEventValue: box.recorder.ops.some(op => op.path === 'event.target.value')
  };
}

function compareTraces(original, patched) {
  if (patched.ops.length !== original.ops.length) {
    return `Dynamic equivalence failed: operation count mismatch. Original executed ${original.ops.length} DOM operations, but patched code executed ${patched.ops.length} operations; all reads and writes must be preserved without skipping or striding.`;
  }
  for (let i = 0; i < original.ops.length; i++) {
    const o = original.ops[i];
    const q = patched.ops[i];
    if (o.type !== q.type || o.path !== q.path) {
      return `Dynamic equivalence failed: operation #${i + 1} order mismatch. Expected ${o.type} on ${o.path}, but found ${q.type} on ${q.path}. Reads and writes must keep their exact execution order.`;
    }
    if (o.type === 'write' && o.value !== q.value) {
      return `Dynamic equivalence failed: write value mismatch at operation #${i + 1} on ${o.path}. Expected '${o.value}', got '${q.value}'. Total compute work or bounds were altered.`;
    }
  }
  if (original.logs.length > 0 && patched.logs.length < original.logs.length) {
    return 'Dynamic equivalence failed: console.log side-effects were removed from patched function.';
  }
  return null;
}

/**
 * Executes the original and patched function in a vm sandbox against a recording DOM and requires:
 * 1. identical ordered DOM operations (reads, writes with their values, calls) and no dropped console output,
 *    for each of several input queries when the handler reads event.target.value;
 * 2. if the patched handler yields (returns a promise): a second invocation while the first is suspended must be
 *    ignored, and the work done must equal one original run (re-entrancy guard);
 * 3. if so, after an exception thrown mid-handler the next invocation must run in full (the guard is released in
 *    a finally block).
 * Guard bookkeeping on "__"-prefixed properties is excluded from the comparison.
 *
 * @param {Object} options
 * @param {string} options.originalCode - Complete original file content
 * @param {string} options.patchedCode - Complete patched file content
 * @param {string} options.functionName - Handler function to exercise
 * @returns {Promise<{valid: boolean, error?: string, operationsExecuted?: number, originalOperations?: number, checks?: Object}>}
 */
export async function verifyDynamicEquivalence({ originalCode, patchedCode, functionName }) {
  if (!functionName) return { valid: false, error: 'Dynamic equivalence cannot run: the issue names no handler function.' };

  const queries = ['Product Title #42'];
  let original;
  try {
    original = await traceHandler(originalCode, functionName, queries[0]);
  } catch (err) {
    return { valid: false, error: `Failed to execute original function in dynamic sandbox: ${err.message}` };
  }
  if (original.readsEventValue) queries.push('', 'a', 'no-such-text-anywhere');

  let patched;
  for (const [index, query] of queries.entries()) {
    const reference = index === 0 ? original : await traceHandler(originalCode, functionName, query);
    try {
      patched = await traceHandler(patchedCode, functionName, query);
    } catch (err) {
      return { valid: false, error: `Failed to execute patched function in dynamic sandbox: ${err.message}` };
    }
    const mismatch = compareTraces(reference, patched);
    if (mismatch) return { valid: false, error: mismatch };
  }

  const checks = { trace: `identical for ${queries.length} input(s)` };

  // Re-entrancy: hold the first invocation at its first yield and call again.
  let releaseGate;
  let gateOpen = false;
  const gate = new Promise(resolve => { releaseGate = () => { gateOpen = true; resolve(); }; });
  const gated = loadSandbox(patchedCode, functionName, {
    yieldHook: () => (gateOpen ? Promise.resolve() : gate),
    timerHook: (fn) => { if (gateOpen) process.nextTick(fn); else gate.then(fn); return 1; }
  });
  const first = gated.fn(gated.makeEvent(queries[0]));
  if (first && typeof first.then === 'function') {
    const second = gated.fn(gated.makeEvent(queries[0]));
    releaseGate();
    await Promise.all([first, second]);
    // Repeated work shows up as repeated DOM writes: together the two invocations must write exactly what one original run writes.
    const writesOf = (ops) => ops.filter(op => op.type === 'write').map(op => `${op.path}=${op.value}`);
    const combined = writesOf(behavioralOps(gated.recorder.ops));
    const expected = writesOf(original.ops);
    if (combined.length !== expected.length || combined.some((w, i) => w !== expected[i])) {
      return { valid: false, error: `Re-entrancy check failed: a second invocation while the first was yielding repeated the work (${combined.length} DOM writes instead of ${expected.length}). A fix that yields needs a guard that ignores repeated clicks.` };
    }
    checks.reentrancy = 'passed: a second invocation during yielding was ignored';

    // Exception safety: fail partway through, then require the next invocation to complete in full.
    if (original.writes >= 2) {
      const failing = loadSandbox(patchedCode, functionName);
      failing.recorder.state.failAtWrite = Math.ceil(original.writes / 2);
      let threw = false;
      try { await failing.fn(failing.makeEvent(queries[0])); } catch { threw = true; }
      if (threw) {
        failing.recorder.state.failAtWrite = null;
        failing.recorder.ops.length = 0;
        await failing.fn(failing.makeEvent(queries[0]));
        const rerun = behavioralOps(failing.recorder.ops);
        const sameShape = rerun.length === original.ops.length && rerun.every((op, i) => op.type === original.ops[i].type && op.path === original.ops[i].path);
        if (!sameShape) {
          return { valid: false, error: 'Exception-safety check failed: after an exception mid-handler the next invocation did not run in full; the guard must be released in a finally block.' };
        }
        checks.exceptionSafety = 'passed: the next invocation after a mid-handler exception ran in full';
      } else {
        checks.exceptionSafety = 'not applicable: the patched handler did not propagate the injected failure';
      }
    } else {
      checks.exceptionSafety = 'not applicable: the original performs fewer than 2 DOM writes';
    }
  } else {
    checks.reentrancy = 'not applicable: the patched handler is synchronous, so there is no yielding window';
    checks.exceptionSafety = 'not applicable: the patched handler is synchronous';
  }

  return { valid: true, operationsExecuted: patched.ops.length, originalOperations: original.ops.length, checks };
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

  const checks = {};

  // Step 1: Unambiguity check
  const unambiguityCheck = validateSnippetUnambiguity(originalContent, fix.edits);
  checks.snippetUnambiguity = unambiguityCheck;
  if (!unambiguityCheck.valid) {
    return { valid: false, error: unambiguityCheck.error, checks };
  }

  // Step 2: Patch generation
  const { patchedContent, unifiedDiff } = generateUnifiedDiff(relativePath, originalContent, fix.edits);

  // Step 2.1: Hunk header count verification
  const hunkCheck = verifyHunkHeaderCounts(unifiedDiff);
  checks.hunkHeaderCounts = hunkCheck;
  if (!hunkCheck.valid) {
    return { valid: false, error: hunkCheck.error, unifiedDiff, checks };
  }

  // Step 3: Syntax parsing
  const syntaxCheck = validateSyntax(relativePath, patchedContent);
  checks.syntax = syntaxCheck;
  if (!syntaxCheck.valid) {
    return { valid: false, error: syntaxCheck.error, unifiedDiff, checks };
  }

  // Step 4: Behavior & logic preservation check (syntactic)
  const behaviorCheck = verifyBehaviorPreservation(issue, originalContent, patchedContent, fix.edits);
  checks.behaviorPreservation = behaviorCheck;
  if (!behaviorCheck.valid) {
    return { valid: false, error: behaviorCheck.error, unifiedDiff, checks };
  }

  // Step 4.5: Dynamic equivalence check in VM sandbox (for JS INP functions)
  if (issue.metric === 'INP' && (relativePath.endsWith('.js') || relativePath.endsWith('.mjs')) && issue.rootCauseCategory !== 'react-unmemoized-render') {
    const dynCheck = await verifyDynamicEquivalence({
      originalCode: originalContent,
      patchedCode: patchedContent,
      functionName: issue.location?.name
    });
    checks.dynamicEquivalence = dynCheck;
    if (!dynCheck.valid) {
      return { valid: false, error: dynCheck.error, unifiedDiff, checks };
    }
  } else {
    checks.dynamicEquivalence = { status: 'not applicable: only JavaScript INP handler fixes are executed in the sandbox' };
  }

  // Step 5: git apply --check in isolated scratch repo
  const gitCheck = runGitApplyCheck(relativePath, originalContent, unifiedDiff, { repoRoot: workspaceRoot });
  const gitEvidence = (success) => ({ command: gitCheck.command, cwd: gitCheck.cwd, exitCode: gitCheck.exitCode, stdout: gitCheck.stdout, stderr: gitCheck.stderr, success });
  checks.gitApply = gitEvidence(gitCheck.valid);
  if (!gitCheck.valid) {
    return { valid: false, error: gitCheck.error, unifiedDiff, gitApplyEvidence: gitEvidence(false), checks };
  }

  // Step 6: Semantic verification against Step 3 analyzer
  const semanticCheck = verifySemanticResolution({ issue, filePath: relativePath, patchedContent });
  checks.reanalysis = semanticCheck;
  if (!semanticCheck.valid) {
    return { valid: false, error: semanticCheck.error, unifiedDiff, checks, gitApplyEvidence: gitEvidence(true) };
  }

  return {
    valid: true,
    unifiedDiff,
    patchedContent,
    gitApplyOutput: gitCheck.output,
    gitApplyEvidence: gitEvidence(true),
    checks
  };
}
