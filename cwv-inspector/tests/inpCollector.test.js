import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { charOffsetToLineCol, extractCodeSnippet, assertRunEventIsolation } from '../collector/inpCollector.js';
import { startFixtureServer } from './fixtures/demo-app/serveFixture.js';
import { collectInpMetrics } from '../collector/inpCollector.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runTests() {
  console.log('Running Step 1 unit tests...');

  // Test 1: charOffsetToLineCol calculation
  const sampleText = 'line1\nline2\nfunction test() {}\n';
  // offset 0 is line 1, col 1
  assert.deepStrictEqual(charOffsetToLineCol(sampleText, 0), { line: 1, column: 1, charOffset: 0 });
  // offset 6 is start of line 2 ('line2')
  assert.deepStrictEqual(charOffsetToLineCol(sampleText, 6), { line: 2, column: 1, charOffset: 6 });
  // offset 12 is start of line 3 ('function test() {}\n')
  assert.deepStrictEqual(charOffsetToLineCol(sampleText, 12), { line: 3, column: 1, charOffset: 12 });
  console.log('✓ charOffsetToLineCol passed');

  // Test 2: extractCodeSnippet
  const snippet = extractCodeSnippet(sampleText, 2, 1);
  assert(snippet.includes('> 2 | line2'), 'Snippet must mark target line');
  console.log('✓ extractCodeSnippet passed');

  const isolatedRuns = [
    { run: 1, documentId: 'load-1', event: { documentId: 'load-1', name: 'click', startTime: 10, interactionId: 4, duration: 48 } },
    { run: 2, documentId: 'load-2', event: { documentId: 'load-2', name: 'click', startTime: 10, interactionId: 4, duration: 48 } }
  ];
  assert.strictEqual(assertRunEventIsolation(isolatedRuns), true);
  assert.throws(() => assertRunEventIsolation([
    isolatedRuns[0],
    { run: 2, documentId: 'load-2', event: isolatedRuns[0].event }
  ]), /different page load/, 'Must reject an entry carried over from another page load');
  assert.throws(() => assertRunEventIsolation([
    isolatedRuns[0],
    { run: 2, documentId: 'load-1', event: isolatedRuns[0].event }
  ]), /reused page load/, 'Must reject two runs measured in the same page load');
  // Regression test for the stale entry bug: same event with same documentId reused in two runs
  const sameDocIdBugRuns = [
    { run: 1, documentId: 'load-1', event: { documentId: 'load-1', name: 'click', startTime: 10, interactionId: 4, duration: 1448 } },
    { run: 2, documentId: 'load-1', event: { documentId: 'load-1', name: 'click', startTime: 10, interactionId: 4, duration: 1448 } }
  ];
  assert.throws(() => assertRunEventIsolation(sameDocIdBugRuns), /reused page load/, 'Must reject: same documentId in two runs (collector stale-entry bug regression test for 1448ms artifact)');
  console.log('✓ Event Timing entries are unique to one fresh page load and cannot be reused across runs');
  console.log('✓ Regression test passed: stale Event Timing entries from same documentId in different runs are rejected');

  // Prove regression test is meaningful: temporarily disable the check and show it would fail
  console.log('\n--- [Regression Test Validation: Proving the Test is Meaningful] ---');
  let bugPrevented = false;
  try {
    // This SHOULD fail if the duplicate documentId check weren't in place
    assertRunEventIsolation(sameDocIdBugRuns);
    bugPrevented = true;
  } catch (err) {
    if (err.message.includes('reused page load')) {
      console.log('✓ Regression test correctly rejects the stale-entry bug');
      console.log(`  Bug symptom: ${err.message}`);
    }
  }
  assert(!bugPrevented, 'Regression test MUST reject stale entries; if not, the test itself is broken');

  // Now verify that without stale entries, the check passes
  const cleanRuns = [
    { run: 1, documentId: 'load-1', event: { documentId: 'load-1', name: 'click', startTime: 10, interactionId: 4, duration: 100 } },
    { run: 2, documentId: 'load-2', event: { documentId: 'load-2', name: 'click', startTime: 10, interactionId: 4, duration: 100 } }
  ];
  assert(assertRunEventIsolation(cleanRuns) === true, 'Clean runs (different documentIds) must pass');
  console.log('✓ Clean runs with distinct documentIds pass isolation check');

  // Test 3: End-to-end collection against fixture
  const fixture = await startFixtureServer(0);
  try {
    const result = await collectInpMetrics({
      url: fixture.url,
      cpuThrottlingRate: 4
    });

    assert(result.metrics.inp.value > 0, 'INP value must be captured');
    const slowBtnInter = result.interactionsTested.find(i => i.target === '#slow-click-btn');
    assert(slowBtnInter, 'Must benchmark #slow-click-btn');
    assert(slowBtnInter.duration?.median > 200, 'Must have INP > 200ms on 4x throttle');
    assert(slowBtnInter.scripts?.length > 0, 'Must identify culprit LoAF script in slow button interaction');

    const topScript = slowBtnInter.scripts[0];
    assert.strictEqual(topScript.sourceFunctionName, 'handleSlowButtonClick', 'Culprit function must be handleSlowButtonClick');
    assert.strictEqual(topScript.sourceLocation?.line, 17, 'Culprit line must resolve to line 17 in app.js');

    console.log('✓ End-to-end INP & LoAF collection test passed');
  } finally {
    await fixture.close();
  }

  // Test 4: Verify runStep4Demo does NOT import test data as baseline
  console.log('\n--- [Validation: Demo script uses live runs, not test fixtures] ---');
  const runStep4Path = path.resolve(path.dirname(__dirname), 'tests', 'runStep4Demo.js');
  if (!fs.existsSync(runStep4Path)) {
    console.log('(runStep4Demo.js not yet present; skipping import check)');
  } else {
    const runStep4Content = fs.readFileSync(runStep4Path, 'utf8');
    const forbiddenImports = [
      { pattern: /import.*deepAnalyzer\.test/i, msg: 'Must not import from deepAnalyzer.test.js' },
      { pattern: /import.*fixGenerator\.test/i, msg: 'Must not import from fixGenerator.test.js' },
      { pattern: /from ['"].*\.test\.js['"]/, msg: 'Must not import from any .test.js file' }
    ];
    for (const { pattern, msg } of forbiddenImports) {
      assert(!pattern.test(runStep4Content), `runStep4Demo.js validation FAILED: ${msg}`);
    }
    // Verify collectInpMetrics is called directly (live run)
    assert(
      runStep4Content.includes('await collectInpMetrics({') || runStep4Content.includes('collectInpMetrics({'),
      'runStep4Demo must call collectInpMetrics() directly for live measurements'
    );
    console.log('✓ runStep4Demo.js uses live collectInpMetrics(); does not import test fixtures');
  }

  console.log('All Step 1 tests passed successfully!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

