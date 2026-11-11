import assert from 'assert';
import path from 'path';
import fs from 'fs';
import vm from 'vm';
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
import { generateRuleBasedFix, getImageDimensions } from '../generator/ruleFixer.js';
import { generateFixesForIssues, checkIssueEligibility } from '../generator/fixGenerator.js';
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

  const [goodResult] = await generateFixesForIssues([inpIssue], { workspaceRoot });
  console.log('goodResult.fix:', goodResult.fix);
  assert(goodResult.fix_validated, 'Good edit must have fix_validated: true');
  assert.strictEqual(goodResult.fix.strategy, 'copilot');
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

  const [retryResultB] = await generateFixesForIssues([inpIssue], { workspaceRoot });
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

  const [retryResultC] = await generateFixesForIssues([inpIssue], { workspaceRoot });
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

  const [retryResultD] = await generateFixesForIssues([inpIssue], { workspaceRoot });
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

  const [failedShrunk] = await generateFixesForIssues([inpIssue], { workspaceRoot });
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

  const [failedNoYield] = await generateFixesForIssues([inpIssue], { workspaceRoot });
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

  const [failedReact] = await generateFixesForIssues([reactIssue], { workspaceRoot });
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
  // G.1: Natural image dimensions (800x450 read directly from hero.jpg)
  const heroDims = getImageDimensions(path.resolve(demoAppDir, 'hero.jpg'));
  assert(heroDims, 'Must read natural image dimensions from hero.jpg');
  assert.strictEqual(heroDims.width, 800);
  assert.strictEqual(heroDims.height, 450);

  const heroClsIssue = {
    metric: 'CLS',
    priority: 'HIGH',
    confidence: 'high',
    evidence_type: 'measured',
    location: {
      file: 'tests/fixtures/demo-app/index.html',
      line_start: 124,
      line_end: 124,
      element: '#hero-img'
    },
    problem: 'Unsized hero image hero.jpg causes layout shift of 0.1.',
    root_cause: 'Missing width and height attributes.',
    rootCauseCategory: 'unsized-image-shift',
    evidence: ['Unsized <img> element #hero-img lacks explicit width and height attributes']
  };

  const heroFix = generateRuleBasedFix(heroClsIssue, demoAppDir);
  assert(heroFix, 'Rule fixer must produce fix for unsized image');
  assert.strictEqual(heroFix.strategy, 'rule-based');
  assert(heroFix.edits[0].replacement_snippet.includes('width="800" height="450"'), 'Must add width and height attributes');

  const heroValidation = await validateCandidateFix({ issue: heroClsIssue, fix: heroFix, workspaceRoot: demoAppDir });
  assert(heroValidation.valid, 'Hero image fix must pass diff validation');
  assert.strictEqual(heroFix.fix_target_file, 'index.html', 'fix_target_file must name the edited HTML file');
  assert(heroValidation.unifiedDiff.includes('--- a/index.html'), 'Diff path must match fix_target_file');
  assert(heroValidation.gitApplyOutput.includes('Checking patch'), 'git apply --check must succeed');
  console.log('✓ Case G.1: Rule-based unsized hero image fix passed (read 800x450 from disk)');

  // G.2: Measured container height (54px) on #dynamic-banner-slot
  const bannerClsIssue = {
    metric: 'CLS',
    priority: 'MEDIUM',
    confidence: 'high',
    evidence_type: 'measured',
    location: {
      file: 'tests/fixtures/demo-app/app.js',
      line_start: 100,
      line_end: 103,
      element: '#dynamic-banner-slot'
    },
    container: {
      selector: '#dynamic-banner-slot',
      measuredHeight: 54
    },
    problem: 'Late injected banner pushes content downward.',
    root_cause: 'Container has min-height: 0.',
    rootCauseCategory: 'unreserved-container-shift',
    evidence: ['Container #dynamic-banner-slot has min-height: 0 and fails to reserve vertical space']
  };

  const bannerFix = generateRuleBasedFix(bannerClsIssue, workspaceRoot);
  assert(bannerFix, 'Rule fixer must produce fix for unreserved container');
  assert.strictEqual(bannerFix.strategy, 'rule-based');
  assert(bannerFix.edits[0].replacement_snippet.includes('min-height: 54px;'), 'Must reserve min-height: 54px');

  const bannerValidation = await validateCandidateFix({ issue: bannerClsIssue, fix: bannerFix, workspaceRoot });
  assert(bannerValidation.valid, 'Banner slot container fix must pass diff validation');
  assert.strictEqual(bannerFix.fix_target_file, 'tests/fixtures/demo-app/index.html', 'fix_target_file must reflect the actual edit target even when issue.location points to app.js');
  assert(bannerValidation.unifiedDiff.includes('--- a/tests/fixtures/demo-app/index.html'), 'Banner diff path must match fix_target_file');
  console.log('✓ Case G.2: Rule-based unreserved container fix passed (measured 54px)');

  // G.3: Corrupted Hunk Rejection Test (Tests real git apply failure)
  const corruptDiff = `--- a/app.js\n+++ b/app.js\n@@ -999,5 +999,5 @@\n-nonexistent_line_1;\n+replacement_line;\n`;
  const gitCorruptCheck = runGitApplyCheck('app.js', 'console.log(1);\n', corruptDiff);
  assert.strictEqual(gitCorruptCheck.valid, false, 'Corrupted hunk must fail git apply --check');
  assert(gitCorruptCheck.error.includes('git apply --check failed:'), 'Must report git failure');
  console.log('✓ Case G.3: Corrupted diff hunk correctly rejected by git apply --check');

  // G.4: Dynamic Rule-Based Fix on Alternative Fixture demo-app-alt (No hardcoded selectors)
  const altDims = getImageDimensions(path.resolve(demoAppAltDir, 'cover.svg'));
  assert(altDims, 'Must read dimensions from demo-app-alt cover.svg');
  assert.strictEqual(altDims.width, 640);
  assert.strictEqual(altDims.height, 360);

  const altImageIssue = {
    metric: 'CLS',
    priority: 'HIGH',
    confidence: 'high',
    evidence_type: 'measured',
    location: {
      file: 'tests/fixtures/demo-app-alt/index.html',
      element: '#alt-news-cover'
    },
    rootCauseCategory: 'unsized-image-shift',
    evidence: ['Unsized <img> element #alt-news-cover lacks explicit width and height attributes']
  };

  const altFix = generateRuleBasedFix(altImageIssue, demoAppAltDir);
  assert(altFix, 'Must generate fix for demo-app-alt image');
  assert(altFix.edits[0].replacement_snippet.includes('width="640" height="360"'), 'Must dynamically use 640x360 from cover.svg');

  const altContainerIssue = {
    metric: 'CLS',
    priority: 'MEDIUM',
    confidence: 'high',
    evidence_type: 'measured',
    location: {
      file: 'tests/fixtures/demo-app-alt/index.html',
      element: '#news-ticker-slot'
    },
    container: {
      selector: '#news-ticker-slot',
      measuredHeight: 48
    },
    rootCauseCategory: 'unreserved-container-shift',
    evidence: ['Container #news-ticker-slot has min-height: 0 and fails to reserve vertical space']
  };

  const altContainerFix = generateRuleBasedFix(altContainerIssue, demoAppAltDir);
  assert(altContainerFix, 'Must generate fix for demo-app-alt ticker container');
  assert(altContainerFix.edits[0].replacement_snippet.includes('min-height: 48px;'), 'Must dynamically reserve 48px');
  console.log('✓ Case G.4: Dynamic rule-based fixes verified on demo-app-alt (zero hardcoded numbers)\n');

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
  assert.strictEqual(dynResultCorrect.operationsExecuted, 401, 'Must execute exactly 401 DOM operations in exact order');
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
  console.log('✓ Case I.5: Chunked guard passed dynamic equivalence and ignored a second click during yielding (401 operations)\n');

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

  console.log('All Step 4 Fix Generator & Diff Validator Tests passed successfully!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
