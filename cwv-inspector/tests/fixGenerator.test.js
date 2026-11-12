import assert from 'assert';
import path from 'path';
import fs from 'fs';
import vm from 'vm';
import os from 'os';
import { spawnSync, execFileSync } from 'child_process';
import { fileURLToPath } from 'url';
import {
  setMockCopilotHandler,
  queueMockResponse,
  clearMockCopilot,
  requestFix,
  parseAndValidateFix
} from '../generator/copilotClient.js';
import {
  validateCandidateFix,
  validateSnippetUnambiguity,
  generateUnifiedDiff,
  validateSyntax,
  runGitApplyCheck,
  verifyBehaviorPreservation,
  verifyHunkHeaderCounts,
  verifyDynamicEquivalence
} from '../generator/diffValidator.js';
import { generateRuleBasedFix, diagnoseRuleBasedFix, getImageDimensions } from '../generator/ruleFixer.js';
import { generateFixesForIssues, checkIssueEligibility, applyValidatedFixes } from '../generator/fixGenerator.js';
import { analyzeInpFunction } from '../analyzers/deepAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const demoAppDir = path.resolve(__dirname, 'fixtures/demo-app');
const demoAppAltDir = path.resolve(__dirname, 'fixtures/demo-app-alt');

async function runTests() {
  console.log('Running Step 4 Fix Generator & Diff Validator Tests...\n');

  // ---------------------------------------------------------------------------
  // Case A: Good edit from Copilot (Preserves 100% total work, yields with scheduler.yield)
  // ---------------------------------------------------------------------------
  clearMockCopilot();
  const inpIssue = {
    metric: 'INP',
    priority: 'HIGH',
    confidence: 'high',
    evidence_type: 'measured',
    location: {
      file: 'tests/fixtures/demo-app/app.js',
      line_start: 10,
      line_end: 37,
      name: 'handleSlowButtonClick',
      element: '#slow-click-btn'
    },
    problem: 'Synchronous execution in handleSlowButtonClick takes 445ms.',
    root_cause: 'Heavy synchronous loop and layout thrashing.',
    rootCauseCategory: 'heavy-compute-loop',
    evidence: [
      'Synchronous heavy CPU loop detected at line 17 (14,000,000 iterations) blocking main thread without yielding',
      'Forced synchronous layout calculation (layout thrashing) verified: 45ms spent in forced reflow'
    ]
  };

  const goodOriginalSnippet = `function handleSlowButtonClick(event) {
  const start = performance.now();
  const counterEl = document.getElementById('counter');
  const btn = document.getElementById('slow-click-btn');

  // 1. Heavy synchronous CPU loop (~350ms on standard CPU, ~400-500ms on 4x throttle)
  let sum = 0;
  for (let i = 0; i < 14000000; i++) {
    sum += Math.sqrt(i) * Math.sin(i);
  }

  // 2. Real forced synchronous layout calculation (Layout Thrashing)
  // Repeatedly writing styles that dirty layout, then immediately reading layout metrics
  // forces the browser into repeated synchronous reflows, causing forcedStyleAndLayoutDuration > 0
  let forcedDimsTotal = 0;
  for (let j = 0; j < 100; j++) {
    btn.style.width = \`\${180 + (j % 30)}px\`;
    forcedDimsTotal += btn.offsetHeight; // layout read forcing synchronous layout
    btn.style.paddingLeft = \`\${10 + (j % 12)}px\`;
    forcedDimsTotal += btn.getBoundingClientRect().width; // layout read forcing another reflow
  }`;

  const goodReplacementSnippet = `async function handleSlowButtonClick(event) {
  const start = performance.now();
  const counterEl = document.getElementById('counter');
  const btn = document.getElementById('slow-click-btn');

  // Ignore repeated clicks while this handler yields between chunks.
  if (btn.__cwvProcessing) return;
  btn.__cwvProcessing = true;
  let sum = 0;
  let forcedDimsTotal = 0;
  try {

  // Cooperative yielding helper
  const yieldToMain = () => (typeof scheduler !== 'undefined' && scheduler.yield ? scheduler.yield() : new Promise(r => setTimeout(r, 0)));

  // 1. Chunked compute preserving all 14,000,000 operations
  const CHUNK_SIZE = 1000000;
  for (let i = 0; i < 14000000; i += CHUNK_SIZE) {
    const chunkEnd = Math.min(i + CHUNK_SIZE, 14000000);
    for (let k = i; k < chunkEnd; k++) {
      sum += Math.sqrt(k) * Math.sin(k);
    }
    await yieldToMain();
  }

  // 2. Preserved all 100 layout operations in exact order, yielding in batches of 10
  for (let j = 0; j < 100; j++) {
    btn.style.width = \`\${180 + (j % 30)}px\`;
    forcedDimsTotal += btn.offsetHeight;
    btn.style.paddingLeft = \`\${10 + (j % 12)}px\`;
    forcedDimsTotal += btn.getBoundingClientRect().width;
    if ((j + 1) % 10 === 0) {
      await yieldToMain();
    }
  }
  } finally {
    btn.__cwvProcessing = false;
  }
`;

  const mockGoodFix = {
    file: 'tests/fixtures/demo-app/app.js',
    edits: [
      {
        original_snippet: goodOriginalSnippet,
        replacement_snippet: goodReplacementSnippet
      }
    ],
    description: 'Preserve all 14M loop operations and all 100 reflow operations, chunking with scheduler.yield() to eliminate blocking tasks',
    why_it_works: 'Yielding the main thread between 1M iteration chunks and every 10 layout operations allows the browser paint pipeline to process pending frames, reducing INP by ~440ms without altering workload or reflow calculations.',
    tradeoffs: 'Longer total wall-clock duration; repeated clicks are ignored while the handler is yielding; state and DOM textContent updates now complete later.'
  };

  queueMockResponse(mockGoodFix);

  const [goodResult] = await generateFixesForIssues([inpIssue], { workspaceRoot, copilot: 'on' });
  console.log('goodResult.fix:', goodResult.fix);
  assert(goodResult.fix_validated, 'Good edit must have fix_validated: true');
  assert.strictEqual(goodResult.fix.strategy, 'mock', 'A stored/queued response must be labelled mock, never copilot');
  assert(/^not run/.test(goodResult.copilot), 'No Copilot call was made, so the status must say not run');
  assert(goodResult.fix.diff.includes('+  // 1. Chunked compute preserving all 14,000,000 operations'), 'Diff must contain patched lines');
  assert(goodResult.fix.gitApplyEvidence, 'Must have gitApplyEvidence');
  assert.strictEqual(goodResult.fix.gitApplyEvidence.exitCode, 0, 'git apply exitCode must be 0');
  assert(goodResult.fix.gitApplyOutput.includes('Checking patch'), 'git apply --check must execute and report output');
  console.log('✓ Case A: Mock Copilot response (not a live call) preserves 14M work, guards re-entrant clicks, and passes git apply\n');

  // ---------------------------------------------------------------------------
  // Case B: Snippet not found (triggers validation error & retry)
  // ---------------------------------------------------------------------------
  clearMockCopilot();
  const mockBadSnippetFix = {
    file: 'tests/fixtures/demo-app/app.js',
    edits: [
      {
        original_snippet: 'this snippet definitely does not exist in app.js',
        replacement_snippet: 'console.log("replacement");'
      }
    ],
    description: 'Bad snippet test',
    why_it_works: 'Does not work',
    tradeoffs: 'None'
  };

  queueMockResponse(mockBadSnippetFix);
  queueMockResponse(mockGoodFix);

  const [retryResultB] = await generateFixesForIssues([inpIssue], { workspaceRoot, copilot: 'on' });
  assert(retryResultB.fix_validated, 'Fix must recover and be verified after retry');
  console.log('✓ Case B: Snippet not found triggered retry and recovered successfully\n');

  // ---------------------------------------------------------------------------
  // Case C: Ambiguous snippet (appears multiple times in file)
  // ---------------------------------------------------------------------------
  clearMockCopilot();
  const mockAmbiguousFix = {
    file: 'tests/fixtures/demo-app/app.js',
    edits: [
      {
        original_snippet: 'let ',
        replacement_snippet: 'const '
      }
    ],
    description: 'Ambiguous snippet test',
    why_it_works: 'Ambiguous',
    tradeoffs: 'None'
  };

  queueMockResponse(mockAmbiguousFix);
  queueMockResponse(mockGoodFix);

  const [retryResultC] = await generateFixesForIssues([inpIssue], { workspaceRoot, copilot: 'on' });
  assert(retryResultC.fix_validated, 'Ambiguous snippet must trigger retry and recover');
  console.log('✓ Case C: Ambiguous snippet rejected and recovered via retry\n');

  // ---------------------------------------------------------------------------
  // Case D: Syntax error in first edit, good on retry
  // ---------------------------------------------------------------------------
  clearMockCopilot();
  const mockSyntaxErrorFix = {
    file: 'tests/fixtures/demo-app/app.js',
    edits: [
      {
        original_snippet: goodOriginalSnippet,
        replacement_snippet: 'function broken() { if (true) { let x = ;'
      }
    ],
    description: 'Syntax error test',
    why_it_works: 'Invalid',
    tradeoffs: 'None'
  };

  queueMockResponse(mockSyntaxErrorFix);
  queueMockResponse(mockGoodFix);

  const [retryResultD] = await generateFixesForIssues([inpIssue], { workspaceRoot, copilot: 'on' });
  assert(retryResultD.fix_validated, 'Syntax error must be caught and resolved on retry');
  console.log('✓ Case D: Syntax error caught by parser and resolved on retry\n');

  // ---------------------------------------------------------------------------
  // Case E.1: Shrunk or Deleted Workload Rejected
  // ---------------------------------------------------------------------------
  clearMockCopilot();
  const mockShrunkWorkFix = {
    file: 'tests/fixtures/demo-app/app.js',
    edits: [
      {
        original_snippet: goodOriginalSnippet,
        // Shrunk 14M iterations to 1,000 (deleting work)
        replacement_snippet: `async function handleSlowButtonClick(event) {
  const start = performance.now();
  let sum = 0;
  for (let i = 0; i < 1000; i++) {
    sum += Math.sqrt(i);
  }
  await (typeof scheduler !== 'undefined' && scheduler.yield ? scheduler.yield() : new Promise(r => setTimeout(r, 0)));`
      }
    ],
    description: 'Shrunk work fix',
    why_it_works: 'Shrinks workload',
    tradeoffs: 'Deletes operations'
  };

  queueMockResponse(mockShrunkWorkFix);
  queueMockResponse(mockShrunkWorkFix);

  const [failedShrunk] = await generateFixesForIssues([inpIssue], { workspaceRoot, copilot: 'on' });
  assert(!failedShrunk.fix_validated, 'Shrunk work must fail verification');
  assert(failedShrunk.fix.validation_error.includes('Original workload bound (14000000) was shrunk or deleted'), 'Error must report workload deletion');
  console.log('✓ Case E.1: Workload deletion (shrinking 14M to 1k) caught and rejected\n');

  // ---------------------------------------------------------------------------
  // Case E.2: Missing Yielding Call Rejected
  // ---------------------------------------------------------------------------
  clearMockCopilot();
  const mockNoYieldFix = {
    file: 'tests/fixtures/demo-app/app.js',
    edits: [
      {
        original_snippet: goodOriginalSnippet,
        // Preserves 14M but omits scheduler.yield / setTimeout
        replacement_snippet: `function handleSlowButtonClick(event) {
  const start = performance.now();
  let sum = 0;
  for (let i = 0; i < 14000000; i++) {
    sum += Math.sqrt(i) * Math.sin(i);
  }`
      }
    ],
    description: 'No yield fix',
    why_it_works: 'Missing yield',
    tradeoffs: 'Still blocks'
  };

  queueMockResponse(mockNoYieldFix);
  queueMockResponse(mockNoYieldFix);

  const [failedNoYield] = await generateFixesForIssues([inpIssue], { workspaceRoot, copilot: 'on' });
  console.log('failedNoYield error:', failedNoYield.fix?.validation_error);
  assert(!failedNoYield.fix_validated, 'Missing yield must fail verification');
  assert(failedNoYield.fix.validation_error.includes('does not add a cooperative yielding call'), 'Error must report missing yield');
  console.log('✓ Case E.2: Missing cooperative yielding call rejected\n');

  // ---------------------------------------------------------------------------
  // Case E.3: React Component Statement / Side-Effect Removal Rejected
  // ---------------------------------------------------------------------------
  clearMockCopilot();
  const reactIssue = {
    metric: 'INP',
    priority: 'HIGH',
    confidence: 'high',
    evidence_type: 'measured',
    location: {
      file: 'tests/fixtures/demo-app/components/ProductList.jsx',
      line_start: 19,
      line_end: 32,
      element: '<ProductItem>'
    },
    problem: 'Unmemoized computation in React component',
    root_cause: 'Missing useMemo and useCallback',
    rootCauseCategory: 'react-unmemoized-render',
    evidence: ['Unmemoized filter loop at line 19', 'Unmemoized callback at line 28']
  };

  const reactOriginal = `  // Unmemoized expensive filter loop executed on every re-render
  const filteredProducts = allProducts.filter(p => {
    let matches = false;
    for (let i = 0; i < 5000; i++) {
      matches = p.name?.toLowerCase().includes(query.toLowerCase());
    }
    return matches;
  });

  // Unmemoized callback passed to child list items, causing cascading re-renders
  const handleSelectProduct = (id) => {
    setSelectedId(id);
    console.log('Selected product:', id);
  };`;

  // Fix that illegally deletes console.log
  const reactBadFix = {
    file: 'tests/fixtures/demo-app/components/ProductList.jsx',
    edits: [
      {
        original_snippet: reactOriginal,
        replacement_snippet: `  const filteredProducts = React.useMemo(() => allProducts, []);
  const handleSelectProduct = React.useCallback((id) => { setSelectedId(id); }, []);`
      }
    ],
    description: 'Bad react fix',
    why_it_works: 'Deletes console.log and loop',
    tradeoffs: 'Changes behavior'
  };

  queueMockResponse(reactBadFix);
  queueMockResponse(reactBadFix);

  const [failedReact] = await generateFixesForIssues([reactIssue], { workspaceRoot, copilot: 'on' });
  assert(!failedReact.fix_validated, 'React fix removing console.log must fail');
  assert(failedReact.fix.validation_error.includes('Side effect statement') || failedReact.fix.validation_error.includes('Inner computation loop'), 'Must report removed statements');
  console.log('✓ Case E.3: React fix that removed console.log / inner loop rejected\n');

  // ---------------------------------------------------------------------------
  // Case F: Invalid JSON response safely handled
  // ---------------------------------------------------------------------------
  clearMockCopilot();
  let caughtJsonError = false;
  try {
    parseAndValidateFix('This is not json at all { unclosed');
  } catch (err) {
    caughtJsonError = true;
  }
  assert(caughtJsonError, 'Invalid JSON must be caught and rejected');
  console.log('✓ Case F: Invalid JSON response safely caught by parser\n');

  // ---------------------------------------------------------------------------
  // Case G: Rule-Based Fixes on Fixture App
  // ---------------------------------------------------------------------------
  // G.1/G.2/G.4: CLS fixes produced by the CLI from LIVE output on BOTH fixtures (source: live-run).
  // Every number in a fix must equal a value recorded in that run; image sizes are also cross-checked against the image file headers.
  const repoRoot = execFileSync('git', ['-C', workspaceRoot, 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  const runCliLive = (fixtureDir, interactions, extraArgs = []) => {
    const args = ['bin/cwv.js', 'analyze', 'fixture', '--path', path.relative(workspaceRoot, fixtureDir), ...extraArgs];
    if (interactions) {
      const file = path.join(os.tmpdir(), `cwv-interactions-${process.pid}-${path.basename(fixtureDir)}.json`);
      fs.writeFileSync(file, JSON.stringify(interactions));
      args.push('--interactions', file);
    }
    const run = spawnSync('node', args, { cwd: workspaceRoot, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout: 280000 });
    assert.strictEqual(run.status, 0, `CLI run failed: ${run.stderr.split('\n').filter(l => !l.startsWith('[Calibration')).join('\n')}`);
    const report = JSON.parse(run.stdout);
    assert.strictEqual(report.source, 'live-run');
    const allowedSources = new Set(['live-run', 'test-fixture-data']);
    const sourceTagFailures = [];
    const inspect = (value, parentObject, location) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        if (!parentObject || !allowedSources.has(parentObject.source)) sourceTagFailures.push(location);
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => inspect(item, parentObject, `${location}[${index}]`));
      } else if (value && typeof value === 'object') {
        for (const [key, child] of Object.entries(value)) inspect(child, value, `${location}.${key}`);
      }
    };
    inspect(report, null, '$');
    assert.deepStrictEqual(sourceTagFailures, [], `Every numeric leaf must have a valid source tag on its parent object: ${sourceTagFailures.join(', ')}`);
    console.log(`✓ Source-tag audit: ${sourceTagFailures.length} numeric leaves missing provenance tags`);
    return report;
  };

  const liveFixtures = [
    { name: 'demo-app', dir: demoAppDir, interactions: [{ selector: '#menu-toggle', type: 'click', label: 'menu' }] },
    { name: 'demo-app-alt', dir: demoAppAltDir, interactions: null }
  ];
  const liveIssues = {};
  for (const fx of liveFixtures) {
    const report = runCliLive(fx.dir, fx.interactions);
    // Phase 4 reporters hide sub-threshold findings; checks that validate measured fixture fixes
    // must inspect both visible and explicitly hidden issues returned in the same real report.
    const cls = [...report.issues, ...report.hiddenIssues].filter(i => i.metric === 'CLS');
    const imageIssue = cls.find(i => i.rootCauseCategory === 'unsized-image-shift');
    const containerIssue = cls.find(i => i.rootCauseCategory === 'unreserved-container-shift');
    assert(imageIssue, `${fx.name}: live run must yield an unsized-image CLS issue`);
    assert(containerIssue, `${fx.name}: live run must yield an unreserved-container CLS issue`);
    liveIssues[fx.name] = { imageIssue, containerIssue, pageFile: new URL(report.url).pathname };

    // Independent cross-check: recorded natural size equals the size in the image file header
    const header = getImageDimensions(path.resolve(fx.dir, imageIssue.timingCorrelation.candidates[0].url));
    assert(header, `${fx.name}: must read the image header`);
    assert.strictEqual(imageIssue.naturalWidth, header.width);
    assert.strictEqual(imageIssue.naturalHeight, header.height);

    for (const [label, issue, expected] of [
      ['image', imageIssue, `width="${imageIssue.naturalWidth}" height="${imageIssue.naturalHeight}"`],
      ['container', containerIssue, `min-height: ${containerIssue.container.measuredHeight}px;`]
    ]) {
      const fix = issue.fix;
      assert(fix && fix.fix_validated === true, `${fx.name} ${label}: CLI must produce a validated fix`);
      assert.strictEqual(fix.strategy, 'rule-based');
      assert(fix.diff.includes(expected), `${fx.name} ${label}: diff must contain the recorded value ${expected}`);
      // Paths are relative to the repository root and apply from there
      assert(!path.isAbsolute(fix.fix_target_file) && fs.existsSync(path.join(repoRoot, fix.fix_target_file)), `${fx.name} ${label}: fix_target_file must exist relative to the repo root (${fix.fix_target_file})`);
      assert(fix.diff.includes(`--- a/${fix.fix_target_file}`), 'diff paths must match fix_target_file');
      // Raw git apply --check evidence
      assert.strictEqual(fix.gitApplyEvidence.exitCode, 0);
      assert(/git apply --check/.test(fix.gitApplyEvidence.command));
      assert.strictEqual(fix.gitApplyEvidence.success, true);
      assert.strictEqual(fix.validation.hunkHeaderCounts.valid, true);
      assert.strictEqual(issue.measured_improvement, null, 'fix_validated is not a measured improvement');
      console.log(`\n[${fx.name}] ${label} fix (source: live-run; ${expected} recorded in this run) git: \`${fix.gitApplyEvidence.command}\` exit ${fix.gitApplyEvidence.exitCode} stderr: ${JSON.stringify(fix.gitApplyEvidence.stderr.trim())}\n${fix.diff}`);
    }
  }
  console.log('\n✓ Case G.1: CLI CLS fixes on demo-app use only values recorded in the live run, with repo-relative diffs and git apply evidence');
  console.log('✓ Case G.4: Same on demo-app-alt (different ids, insertBefore, different timing)');

  // G.2: a missing measurement yields NO fix, a reason, and no Copilot call
  let copilotCalls = 0;
  setMockCopilotHandler(async () => { copilotCalls++; throw new Error('Copilot must not be consulted when a rule lacks a measurement'); });
  for (const fx of liveFixtures) {
    const { imageIssue, containerIssue, pageFile } = liveIssues[fx.name];
    const ruleOptions = { pageFile, searchRoot: fx.dir };
    const withoutNatural = { ...imageIssue };
    delete withoutNatural.naturalWidth;
    delete withoutNatural.naturalHeight;
    const withoutHeight = { ...containerIssue, container: { selector: containerIssue.container.selector } };
    const withoutContainer = { ...containerIssue, container: null };
    const unknownContainer = { ...containerIssue, container: { ...containerIssue.container, selector: '#no-such-container-anywhere' } };
    const unresolved = { ...imageIssue, location: null };

    for (const [label, issue, reasonPattern] of [
      ['natural size not measured', withoutNatural, /not measured/],
      ['node height not measured', withoutHeight, /not measured|not estimating/],
      ['container selector not measured', withoutContainer, /not measured/],
      ['container rule absent from workspace', unknownContainer, /No CSS rule/],
      ['source location unresolved', unresolved, /unresolved/i]
    ]) {
      const diagnosis = diagnoseRuleBasedFix(issue, repoRoot, ruleOptions);
      assert(diagnosis, `${fx.name} / ${label}: a rule must apply`);
      assert.strictEqual(diagnosis.fix, null, `${fx.name} / ${label}: must emit no fix`);
      assert(reasonPattern.test(diagnosis.no_fix_reason), `${fx.name} / ${label}: reason was "${diagnosis.no_fix_reason}"`);
    }
    const [enriched] = await generateFixesForIssues([withoutNatural], { workspaceRoot: repoRoot, copilot: 'on' });
    assert.strictEqual(enriched.fix, null);
    assert(enriched.no_fix_reason && /not measured/.test(enriched.no_fix_reason));
    assert.strictEqual(enriched.fix_validated, false);
  }
  assert.strictEqual(copilotCalls, 0, 'No Copilot call may be made for missing measurements');
  clearMockCopilot();
  console.log('✓ Case G.2: Missing measurements yield no fix + no_fix_reason on both fixtures, with 0 Copilot calls');

  // G.3: Corrupted Hunk Rejection Test (Tests real git apply failure)
  const corruptDiff = `--- a/app.js\n+++ b/app.js\n@@ -999,5 +999,5 @@\n-nonexistent_line_1;\n+replacement_line;\n`;
  const gitCorruptCheck = runGitApplyCheck('app.js', 'console.log(1);\n', corruptDiff);
  assert.strictEqual(gitCorruptCheck.valid, false, 'Corrupted hunk must fail git apply --check');
  assert(gitCorruptCheck.error.includes('git apply --check failed:'), 'Must report git failure');
  console.log('✓ Case G.3: Corrupted diff hunk correctly rejected by git apply --check');

  // ---------------------------------------------------------------------------
  // Case H: Hunk Header Line Counts Verification
  // ---------------------------------------------------------------------------
  const validPatch = [
    '--- a/file.js',
    '+++ b/file.js',
    '@@ -1,3 +1,4 @@',
    ' line 1',
    '-line 2',
    '+line 2 replacement',
    '+line 2 addition',
    ' line 3'
  ].join('\n');
  const validHunkCheck = verifyHunkHeaderCounts(validPatch);
  assert(validHunkCheck.valid, 'Valid hunk counts must pass');

  const corruptHunkPatch = [
    '--- a/file.js',
    '+++ b/file.js',
    '@@ -1,3 +1,10 @@', // claimed 10 lines new, but only 4 exist
    ' line 1',
    '-line 2',
    '+line 2 replacement',
    '+line 2 addition',
    ' line 3'
  ].join('\n');
  const corruptHunkCheck = verifyHunkHeaderCounts(corruptHunkPatch);
  assert(!corruptHunkCheck.valid, 'Corrupt hunk header counts must fail');
  assert(corruptHunkCheck.error.includes('Hunk header count mismatch'), 'Must report hunk header count mismatch');
  console.log('✓ Case H: Hunk header count verification strictly validated\n');

  // ---------------------------------------------------------------------------
  // Case I: Dynamic Equivalence Mutation Tests
  // ---------------------------------------------------------------------------
  const appJsOriginal = fs.readFileSync(path.resolve(demoAppDir, 'app.js'), 'utf-8');

  // Mutation 1: Stride j += 10 (skipping 90 iterations)
  const patchedStride10 = appJsOriginal.replace(
    'for (let j = 0; j < 100; j++)',
    'for (let j = 0; j < 100; j += 10)'
  );
  const dynResultStride = await verifyDynamicEquivalence({
    originalCode: appJsOriginal,
    patchedCode: patchedStride10,
    functionName: 'handleSlowButtonClick'
  });
  assert(!dynResultStride.valid, 'j += 10 stride must fail dynamic equivalence');
  assert(dynResultStride.error.includes('operation count mismatch'), 'Must report operation count mismatch');
  console.log('✓ Case I.1: Mutation j += 10 stride rejected by dynamic validator');

  // Mutation 2: Shrunk loop bound (1000 instead of 14M)
  const patchedShrunk = appJsOriginal.replace('14000000', '1000');
  const dynResultShrunk = await verifyDynamicEquivalence({
    originalCode: appJsOriginal,
    patchedCode: patchedShrunk,
    functionName: 'handleSlowButtonClick'
  });
  assert(!dynResultShrunk.valid, 'Shrunk loop bound must fail dynamic equivalence');
  assert(dynResultShrunk.error.includes('value mismatch') || dynResultShrunk.error.includes('calculation output mismatch'), 'Must report calculation mismatch');
  console.log('✓ Case I.2: Mutation shrunk loop bound rejected by dynamic validator');

  // Mutation 3: Removed layout read (offsetHeight omitted)
  const patchedOmitRead = appJsOriginal.replace('forcedDimsTotal += btn.offsetHeight;', '');
  const dynResultOmitRead = await verifyDynamicEquivalence({
    originalCode: appJsOriginal,
    patchedCode: patchedOmitRead,
    functionName: 'handleSlowButtonClick'
  });
  assert(!dynResultOmitRead.valid, 'Removed layout read must fail dynamic equivalence');
  assert(dynResultOmitRead.error.includes('order mismatch') || dynResultOmitRead.error.includes('operation count mismatch'), 'Must report missing operation');
  console.log('✓ Case I.3: Mutation removed layout read rejected by dynamic validator');

  // Mutation 4: Removed console.log
  const patchedOmitLog = appJsOriginal.replace(
    "console.log(`[DemoApp] handleSlowButtonClick completed in ${elapsed.toFixed(1)}ms`);",
    '// log removed'
  );
  const dynResultOmitLog = await verifyDynamicEquivalence({
    originalCode: appJsOriginal,
    patchedCode: patchedOmitLog,
    functionName: 'handleSlowButtonClick'
  });
  assert(!dynResultOmitLog.valid, 'Removed console.log must fail dynamic equivalence');
  assert(dynResultOmitLog.error.includes('console.log side-effects were removed'), 'Must report console.log removal');
  console.log('✓ Case I.4: Mutation removed console.log rejected by dynamic validator');

  // Mutation 5: Correct chunked version (all 14M operations + all 100 layout reads/writes in order)
  const patchedCorrect = appJsOriginal.replace(goodOriginalSnippet, goodReplacementSnippet);
  const dynResultCorrect = await verifyDynamicEquivalence({
    originalCode: appJsOriginal,
    patchedCode: patchedCorrect,
    functionName: 'handleSlowButtonClick'
  });
  assert(dynResultCorrect.valid, 'Correct chunked version must pass dynamic equivalence');
  assert.strictEqual(dynResultCorrect.operationsExecuted, dynResultCorrect.originalOperations, 'Patched run must execute exactly the original\'s DOM operations in the same order');
  assert(dynResultCorrect.originalOperations > 0);
  assert(/^passed/.test(dynResultCorrect.checks.reentrancy), 'Re-entrancy guard must be verified: ' + dynResultCorrect.checks.reentrancy);
  assert(/^passed/.test(dynResultCorrect.checks.exceptionSafety), 'try/finally guard reset must be verified: ' + dynResultCorrect.checks.exceptionSafety);
  assert(patchedCorrect.includes('if (btn.__cwvProcessing) return;'), 'Chunked diff must reject clicks while yielding');

  let releaseChunk;
  let yieldCount = 0;
  let counterText = '';
  const testButton = {
    style: {},
    get offsetHeight() { return 40; },
    getBoundingClientRect() { return { width: 120, height: 40, top: 0, left: 0 }; }
  };
  const testCounter = { set textContent(value) { counterText = String(value); }, get textContent() { return counterText; } };
  const chunkGate = new Promise(resolve => { releaseChunk = resolve; });
  const reentrancyContext = vm.createContext({
    document: { getElementById(id) { return id === 'slow-click-btn' ? testButton : id === 'counter' ? testCounter : {}; }, addEventListener() {} },
    performance: { now: (() => { let t = 0; return () => ++t; })() },
    console: { log() {} },
    scheduler: { yield() { yieldCount++; return chunkGate; } },
    setTimeout(fn) { return setTimeout(fn, 0); }
  });
  new vm.Script(patchedCorrect).runInContext(reentrancyContext);
  const firstClick = vm.runInContext('handleSlowButtonClick({})', reentrancyContext);
  assert.strictEqual(yieldCount, 1, 'First click must pause at its first cooperative yield');
  await vm.runInContext('handleSlowButtonClick({})', reentrancyContext);
  assert.strictEqual(counterText, '', 'Second click must not update the result while the first is processing');
  releaseChunk();
  await firstClick;
  assert(counterText.startsWith('Tasks completed: 1'), 'Guarded handler must preserve the completed result');
  console.log('✓ Case I.5: Chunked guard passed dynamic equivalence and ignored a second click during yielding (' + dynResultCorrect.originalOperations + ' recorded operations)\n');

  // ---------------------------------------------------------------------------
  // Case J: rootCauseCategory Assertion & handleProductFilterInput Fix Validation
  // ---------------------------------------------------------------------------
  // J.1: Assert rootCauseCategory is NEVER a phase label
  const forbiddenPhaseLabels = new Set(['inputDelay', 'processingDuration', 'presentationDelay']);
  const filterCategoryIssue = analyzeInpFunction({
    culpritScript: {
      sourceFunctionName: 'handleProductFilterInput', duration: 240, forcedStyleAndLayoutDuration: 0,
      timeShare: { computeDuration: 240, forcedLayoutDuration: 0, computeShare: '100%', forcedLayoutShare: '0%' }
    },
    location: { file: 'tests/fixtures/demo-app/app.js', line: 65, name: 'handleProductFilterInput' },
    workspaceRoot: demoAppDir,
    worstInteraction: { target: '#filter-input', duration: { median: 240 }, phases: { presentationDelay: { median: 200 } } }
  });
  assert(filterCategoryIssue, 'Filter interaction must produce an INP issue');
  assert(!forbiddenPhaseLabels.has(filterCategoryIssue.rootCauseCategory), `rootCauseCategory "${filterCategoryIssue.rootCauseCategory}" must not be a phase label`);
  assert.strictEqual(filterCategoryIssue.rootCauseCategory, 'heavy-filter-loop');
  console.log('✓ Case J.1: Unit test asserts rootCauseCategory is NEVER an Event Timing phase label (inputDelay/processingDuration/presentationDelay)');

  // J.2: Dynamic equivalence for handleProductFilterInput loop-invariant hoisting
  const patchedFilterHoisting = appJsOriginal.replace(
    `  // Deterministic filter loop matching React component logic. No early return;\n  // each query scans the complete, fixed dataset rather than prior results.\n  const filtered = PRODUCT_DATASET.filter(p => {\n    let matches = false;\n    for (let j = 0; j < 300; j++) {\n      matches = p.title.toLowerCase().includes(query.toLowerCase());\n    }\n    return matches;\n  });`,
    `  // Hoist loop-invariant normalized query outside item filtering\n  const normalizedQuery = query.toLowerCase();\n  const filtered = PRODUCT_DATASET.filter(p => {\n    const normalizedTitle = p.title.toLowerCase();\n    let matches = false;\n    for (let j = 0; j < 300; j++) {\n      matches = normalizedTitle.includes(normalizedQuery);\n    }\n    return matches;\n  });`
  );

  const dynResultFilter = await verifyDynamicEquivalence({
    originalCode: appJsOriginal,
    patchedCode: patchedFilterHoisting,
    functionName: 'handleProductFilterInput'
  });
  assert(dynResultFilter.valid, 'Filter hoisting fix must pass dynamic equivalence');
  console.log('✓ Case J.2: handleProductFilterInput hoisting fix verified for identical output across inputs');

  // J.3: Unified diff generation, hunk header count, and git apply --check for filter fix
  const filterDiffResult = generateUnifiedDiff(
    'tests/fixtures/demo-app/app.js',
    appJsOriginal,
    [
      {
        original_snippet: `  // Deterministic filter loop matching React component logic. No early return;\n  // each query scans the complete, fixed dataset rather than prior results.\n  const filtered = PRODUCT_DATASET.filter(p => {\n    let matches = false;\n    for (let j = 0; j < 300; j++) {\n      matches = p.title.toLowerCase().includes(query.toLowerCase());\n    }\n    return matches;\n  });`,
        replacement_snippet: `  // Hoist loop-invariant normalized query outside item filtering\n  const normalizedQuery = query.toLowerCase();\n  const filtered = PRODUCT_DATASET.filter(p => {\n    const normalizedTitle = p.title.toLowerCase();\n    let matches = false;\n    for (let j = 0; j < 300; j++) {\n      matches = normalizedTitle.includes(normalizedQuery);\n    }\n    return matches;\n  });`
      }
    ]
  );
  const hunkCountFilter = verifyHunkHeaderCounts(filterDiffResult.unifiedDiff);
  assert(hunkCountFilter.valid, 'Filter fix hunk headers must be strictly accurate');
  const gitCheckFilter = runGitApplyCheck('tests/fixtures/demo-app/app.js', appJsOriginal, filterDiffResult.unifiedDiff);
  assert(gitCheckFilter.valid, 'git apply --check must succeed for filter hoisting patch');
  console.log('✓ Case J.3: Filter fix hunk header count and git apply --check verified\n');

  // K: --apply is opt-in and writes only validated, effective diffs in a temporary Git repository.
  const applyRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'cwv-apply-test-'));
  try {
    execFileSync('git', ['init', '-q'], { cwd: applyRepo });
    execFileSync('git', ['config', 'user.email', 'test@example.invalid'], { cwd: applyRepo });
    execFileSync('git', ['config', 'user.name', 'CWV Test'], { cwd: applyRepo });
    fs.mkdirSync(path.join(applyRepo, 'src'), { recursive: true });
    const oldText = 'const state = "before";\n';
    const newText = 'const state = "after";\n';
    const sourceFile = path.join(applyRepo, 'src/app.js');
    fs.writeFileSync(sourceFile, oldText);
    execFileSync('git', ['add', '.'], { cwd: applyRepo });
    execFileSync('git', ['commit', '-qm', 'baseline'], { cwd: applyRepo });
    const patch = generateUnifiedDiff('src/app.js', oldText, [{ original_snippet: oldText.trimEnd(), replacement_snippet: newText.trimEnd() }]).unifiedDiff;
    const defaultIssues = await generateFixesForIssues([{ metric: 'LCP', confidence: 'high', evidence_type: 'measured', location: { file: 'src/app.js' }, rootCauseCategory: 'no-rule' }], { workspaceRoot: applyRepo });
    assert.strictEqual(defaultIssues[0].fix, null);
    assert.strictEqual(execFileSync('git', ['status', '--porcelain'], { cwd: applyRepo, encoding: 'utf8' }), '', 'Default generation must leave temp repo untouched');
    const applyResult = applyValidatedFixes([
      { metric: 'INP', fix_validated: false, fix: { diff: patch, fix_validated: false } },
      { metric: 'CLS', fix_validated: true, fix: { diff: patch, fix_validated: true, ineffective: true } },
      { metric: 'INP', fix_validated: true, fix: { diff: patch, fix_validated: true, fix_target_file: 'src/app.js' } }
    ], applyRepo);
    assert.strictEqual(applyResult.error, null);
    assert.strictEqual(applyResult.applied.length, 1);
    assert.strictEqual(applyResult.skipped.length, 2);
    assert.strictEqual(fs.readFileSync(sourceFile, 'utf8'), newText);
    assert.strictEqual(applyResult.applied[0].exitCode, 0);
    assert.strictEqual(applyResult.applied[0].applyExitCode, 0);
    console.log('✓ Case K: default generation leaves a temp Git tree untouched; --apply writes only a validated effective fix');
  } finally {
    fs.rmSync(applyRepo, { recursive: true, force: true });
  }

  console.log('All Step 4 Fix Generator & Diff Validator Tests passed successfully!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
