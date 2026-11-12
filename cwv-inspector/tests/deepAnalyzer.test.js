import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { analyzeInpFunction, analyzeReactComponents, analyzeLcp, analyzeCls, runDeepAnalysis } from '../analyzers/deepAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const demoAppDir = path.resolve(__dirname, 'fixtures/demo-app');

// Locate the handler from the fixture itself so the test does not break when the fixture file shifts
const fixtureLines = fs.readFileSync(path.join(demoAppDir, 'app.js'), 'utf8').split('\n');
const slowHandlerLine = fixtureLines.findIndex(l => l.includes('function handleSlowButtonClick')) + 1;
assert(slowHandlerLine > 0, 'fixture must define handleSlowButtonClick');

async function runTests() {
  console.log('Running Step 3 Deep Code Analyzer Tests...\n');

  // Test 1: INP AST detection on handleSlowButtonClick
  const mockScript = {
    sourceFunctionName: 'handleSlowButtonClick',
    duration: 445,
    forcedStyleAndLayoutDuration: 45,
    pauseDuration: 0,
    timeShare: {
      totalDuration: 445,
      computeDuration: 400,
      forcedLayoutDuration: 45,
      pauseDuration: 0,
      computeShare: '90%',
      forcedLayoutShare: '10%',
      dominantCause: 'heavy-compute-loop'
    }
  };

  const inpIssue = analyzeInpFunction({
    culpritScript: mockScript,
    location: {
      file: 'tests/fixtures/demo-app/app.js',
      line: slowHandlerLine,
      name: 'handleSlowButtonClick',
      confidence: 'high'
    },
    workspaceRoot: demoAppDir,
    worstInteraction: {
      target: '#slow-click-btn',
      duration: { min: 420, median: 445, max: 480 },
      phases: { presentationDelay: { median: 430 } }
    }
  });

  console.log('Test 1 (INP Issue):', inpIssue?.problem);
  assert(inpIssue, 'INP issue must be created');
  assert.strictEqual(inpIssue.metric, 'INP');
  assert.strictEqual(inpIssue.priority, 'HIGH');
  assert.strictEqual(inpIssue.rootCauseCategory, 'heavy-compute-loop');
  assert(inpIssue.timeShare.computeShare === '90%');
  assert(inpIssue.evidence.some(e => e.includes('iterations')), 'Evidence must cite loop iterations');
  assert(inpIssue.evidence.some(e => e.toLowerCase().includes('forced synchronous layout')), 'Evidence must cite forced reflow');
  console.log('✓ Test 1: INP slow click handler with time-share split passed\n');

  // Test 2: React Re-render and Memoization AST detection
  const reactIssues = analyzeReactComponents(demoAppDir);
  console.log('Test 2 (React Issues Count):', reactIssues.length);
  assert(reactIssues.length > 0, 'Must detect React component issues');
  const reactIssue = reactIssues[0];
  assert.strictEqual(reactIssue.metric, 'INP');
  assert(reactIssue.location.file.includes('ProductList.jsx'), 'Must locate ProductList.jsx');
  assert(reactIssue.evidence.some(e => e.includes('unmemoized')), 'Evidence must cite unmemoized handler/filter');
  console.log('✓ Test 2: React re-render issue passed\n');

  // Test 3: LCP AST detection with subpart attribution
  const lcpIssue = analyzeLcp({
    lcpMetric: {
      value: 1250,
      element: '#hero-img',
      url: '/hero.jpg',
      subparts: {
        timeToFirstByte: 30,
        resourceLoadDelay: 20,
        resourceLoadDuration: 800,
        elementRenderDelay: 25
      },
      largestSubpart: 'resourceLoadDuration'
    },
    lcpElementResolution: {
      file: 'tests/fixtures/demo-app/index.html',
      line_start: 124,
      line_end: 124,
      selector: '#hero-img',
      confidence: 'high'
    },
    workspaceRoot: demoAppDir
  });

  console.log('Test 3 (LCP Issue):', lcpIssue?.problem);
  assert(lcpIssue, 'LCP issue must be created');
  assert.strictEqual(lcpIssue.metric, 'LCP');
  assert.strictEqual(lcpIssue.largestSubpart, 'resourceLoadDuration');
  assert(lcpIssue.evidence.some(e => e.includes('resourceLoadDuration')), 'Evidence must cite largest subpart');
  assert(lcpIssue.evidence.some(e => e.includes('Resource Timing for the LCP image resource was unavailable')), 'Without Resource Timing no server-wait/format conclusion may be inferred');
  assert.strictEqual(lcpIssue.location.line_start, 124, 'Location comes from the supplied resolution');

  const unlocatedLcp = analyzeLcp({
    lcpMetric: { value: 1250, element: '#hero-img', subparts: {} },
    lcpElementResolution: { selector: '#hero-img', file: '', line_start: 0, line_end: 0, confidence: 'low' },
    workspaceRoot: demoAppDir
  });
  assert.strictEqual(unlocatedLcp.location, null, 'Unresolved LCP element must have null location');
  assert.strictEqual(unlocatedLcp.confidence, 'low');
  assert(unlocatedLcp.evidence.includes('source location unresolved'));
  console.log('✓ Test 3: Subpart-attributed LCP detection passed\n');

  // Test 4: CLS grouped by measured cause (inputs are collector-shaped; values are test inputs)
  const imageCause = {
    kind: 'image-load', selector: '#img-a', url: 'a.jpg', responseEnd: 823.1, time_delta_ms: 1.3,
    image: { selector: '#img-a', currentSrc: 'http://t/a.jpg', naturalWidth: 640, naturalHeight: 360, hasWidthAttr: false, hasHeightAttr: false, hasAspectRatioCss: false }
  };
  const insertionCause = {
    kind: 'dom-insertion', selector: 'div.late-box', observedAt: 1530.2, time_delta_ms: 35.1,
    container: { selector: '#slot-a', minHeight: '0px', heightBefore: 0 }, nodeHeightAfter: 72
  };
  const clsIssues = analyzeCls({
    clsMetric: {
      value: 0.164,
      shifts: [
        { value: 0.0998, startTime: 824.4, shiftedElements: ['p', '#section-1'], matchedCause: imageCause, candidates: [imageCause], time_delta_ms: 1.3, causeConfidence: 'high' },
        { value: 0.0639, startTime: 1565.3, shiftedElements: ['main'], matchedCause: insertionCause, candidates: [insertionCause], time_delta_ms: 35.1, causeConfidence: 'high' }
      ]
    },
    elementResolutions: [
      { selector: '#img-a', causeSelector: '#img-a', file: 'tests/fixtures/demo-app/index.html', line_start: 124, line_end: 124, confidence: 'high' },
      { selector: '.late-box', causeSelector: 'div.late-box', file: 'tests/fixtures/demo-app/app.js', line_start: 69, line_end: 71, confidence: 'high',
        insertionCall: { method: 'appendChild', line: 71, snippet: 'slot.appendChild(box)' } }
    ],
    workspaceRoot: demoAppDir
  });

  console.log('Test 4 (CLS Issues Count):', clsIssues.length);
  assert.strictEqual(clsIssues.length, 2, 'Must produce one CLS issue per measured cause');
  const heroCls = clsIssues.find(i => i.rootCauseCategory === 'unsized-image-shift');
  const bannerCls = clsIssues.find(i => i.rootCauseCategory === 'unreserved-container-shift');
  assert(heroCls, 'Must classify the unsized image from measured attributes');
  assert(bannerCls, 'Must classify the unreserved container from measured heights');
  assert.strictEqual(heroCls.shiftScore, 0.1);
  assert.strictEqual(bannerCls.shiftScore, 0.064);
  assert.strictEqual(heroCls.location.line_start, 124, 'Location comes from the resolution of its own cause');
  assert.strictEqual(bannerCls.location.line_start, 69);
  assert.strictEqual(heroCls.naturalWidth, 640);
  assert.strictEqual(heroCls.naturalHeight, 360);
  assert(heroCls.evidence.includes('Measured natural image size: 640x360px'));
  assert.strictEqual(bannerCls.container.measuredHeight, 72, 'Reserved height is the measured node height');
  assert(bannerCls.evidence.includes('Inserted node height after insertion: 72px'));
  assert(bannerCls.evidence.includes('Container #slot-a height before insertion: 0px'));
  assert.strictEqual(heroCls.priority, undefined, 'Priority is the prioritizer\'s job');
  assert.strictEqual(heroCls.measuredDimensions, undefined, 'No fabricated image dimensions');
  console.log('✓ Test 4: CLS issues built from measured causes passed\n');

  // Test 4b: a shift with no candidate cause => null location, low confidence, unattributed
  const unattributedCls = analyzeCls({
    clsMetric: { value: 0.2, shifts: [{ value: 0.2, startTime: 500, shiftedElements: ['main'], matchedCause: null, candidates: [], time_delta_ms: null, causeConfidence: 'low' }] },
    workspaceRoot: demoAppDir
  });
  assert.strictEqual(unattributedCls.length, 1);
  assert.strictEqual(unattributedCls[0].rootCauseCategory, 'unattributed-shift');
  assert.strictEqual(unattributedCls[0].location, null);
  assert.strictEqual(unattributedCls[0].confidence, 'low');
  assert(unattributedCls[0].evidence.includes('source location unresolved'));
  console.log('✓ Test 4b: shift without a candidate cause is unattributed with low confidence\n');

  // Test 4c: grouping is by cause, not by time: the same cause at very different times is one issue
  const sameCauseAtTwoTimes = analyzeCls({
    clsMetric: { value: 0.3, shifts: [
      { value: 0.1, startTime: 100, shiftedElements: [], matchedCause: insertionCause, candidates: [insertionCause], time_delta_ms: 1, causeConfidence: 'high' },
      { value: 0.2, startTime: 9000, shiftedElements: [], matchedCause: insertionCause, candidates: [insertionCause], time_delta_ms: 1, causeConfidence: 'high' }
    ] },
    workspaceRoot: demoAppDir
  });
  assert.strictEqual(sameCauseAtTwoTimes.length, 1, 'One issue per cause regardless of startTime');
  assert.strictEqual(sameCauseAtTwoTimes[0].shiftScore, 0.3);
  console.log('✓ Test 4c: grouping does not depend on startTime\n');

  // Test 4d: values that were not measured are omitted, not invented
  const unmeasuredCause = { kind: 'dom-insertion', selector: 'div.x', observedAt: 10, time_delta_ms: 2, container: { selector: '#c', minHeight: null, heightBefore: null }, nodeHeightAfter: null };
  const unmeasured = analyzeCls({
    clsMetric: { value: 0.1, shifts: [{ value: 0.1, startTime: 12, shiftedElements: [], matchedCause: unmeasuredCause, candidates: [unmeasuredCause], time_delta_ms: 2, causeConfidence: 'high' }] },
    workspaceRoot: demoAppDir
  })[0];
  assert.strictEqual(unmeasured.rootCauseCategory, 'dom-insertion-shift', 'Reservation cannot be judged without both heights');
  assert(!unmeasured.evidence.some(e => /height|min-height/.test(e)), 'No height or min-height statements without measurements');
  assert(!unmeasured.container || unmeasured.container.measuredHeight === undefined, 'No invented container height');
  assert.strictEqual(unmeasured.estimated_gain, null);
  const unmeasuredImage = analyzeCls({
    clsMetric: { value: 0.1, shifts: [{ value: 0.1, startTime: 12, shiftedElements: [], matchedCause: { kind: 'image-load', selector: '#i', url: 'i.png', responseEnd: 10, time_delta_ms: 2, image: { selector: '#i', naturalWidth: null, naturalHeight: null, hasWidthAttr: false, hasHeightAttr: false, hasAspectRatioCss: false } }, candidates: [], time_delta_ms: 2, causeConfidence: 'high' }] },
    workspaceRoot: demoAppDir
  })[0];
  assert.strictEqual(unmeasuredImage.naturalWidth, undefined, 'No natural size when it was not measured');
  assert(!unmeasuredImage.evidence.some(e => e.includes('natural image size')));
  assert(!/\d+x\d+px/.test(unmeasuredImage.root_cause), 'Root cause must not quote a size that was not measured');
  console.log('✓ Test 4d: unmeasured values are omitted\n');

  // Test 5: Fast interactions produce ZERO findings (no false positives)
  const fastInteractionMenu = {
    target: '#menu-toggle',
    duration: { median: 32 },
    scripts: [{ sourceFunctionName: 'handleMenuToggle', duration: 3 }]
  };
  const fastMenuIssue = analyzeInpFunction({
    culpritScript: fastInteractionMenu.scripts[0],
    location: { file: 'tests/fixtures/demo-app/app.js', line: 56, name: 'handleMenuToggle' },
    workspaceRoot: demoAppDir,
    worstInteraction: fastInteractionMenu
  });
  // Since duration is 3ms (well below 200ms threshold), it is filtered out by runDeepAnalysis
  const masterIssuesFastOnly = runDeepAnalysis({
    step1Output: { metrics: {}, worstInteraction: fastInteractionMenu, interactionsTested: [fastInteractionMenu] },
    step2Output: { resolvedLocations: {} },
    workspaceRoot: '/empty-dir-for-zero-findings'
  });
  console.log('Test 5 (Fast Interaction Issues Count):', masterIssuesFastOnly.length);
  assert.strictEqual(masterIssuesFastOnly.length, 0, 'Fast interaction must produce ZERO findings');
  console.log('✓ Test 5: Fast interactions produce zero findings (0 false positives) passed\n');

  // Test 6: Mutation test - patched handler yielding in chunks removes INP issue
  const patchedScript = {
    sourceFunctionName: 'handleSlowButtonClick',
    duration: 35, // Fast execution after chunking
    forcedStyleAndLayoutDuration: 0, // No reflow
    pauseDuration: 0,
    timeShare: {
      totalDuration: 35,
      computeDuration: 35,
      forcedLayoutDuration: 0,
      computeShare: '100%',
      forcedLayoutShare: '0%',
      dominantCause: 'normal-execution'
    }
  };
  const patchedInteraction = {
    target: '#slow-click-btn',
    duration: { min: 30, median: 35, max: 40 },
    phases: { presentationDelay: { median: 10 } }
  };

  // When patched, duration is 35ms (below 200ms threshold)
  const masterPatchedIssues = runDeepAnalysis({
    step1Output: {
      worstInteraction: patchedInteraction,
      interactionsTested: [patchedInteraction],
      metrics: { inp: { value: 35, flagged: false } }
    },
    step2Output: {
      resolvedLocations: {
        culpritScript: { file: 'tests/fixtures/demo-app/app.js', line: slowHandlerLine, name: 'handleSlowButtonClick' }
      }
    },
    workspaceRoot: '/empty-dir-for-zero-findings'
  });
  console.log('Test 6 (Mutation Test Patched Handler Count):', masterPatchedIssues.length);
  assert.strictEqual(masterPatchedIssues.length, 0, 'Patched handler must eliminate INP finding');
  console.log('✓ Test 6: Mutation test - patched handler eliminates INP finding passed\n');

  // Test 7: Alternative fixture demo-app-alt AST detection
  const altAppDir = path.resolve(__dirname, 'fixtures/demo-app-alt');
  const altScript = {
    sourceFunctionName: 'handleFeedRefresh',
    duration: 350,
    forcedStyleAndLayoutDuration: 0,
    timeShare: {
      totalDuration: 350,
      computeDuration: 350,
      forcedLayoutDuration: 0,
      computeShare: '100%',
      forcedLayoutShare: '0%',
      dominantCause: 'heavy-compute-loop'
    }
  };
  const altIssue = analyzeInpFunction({
    culpritScript: altScript,
    location: {
      file: 'tests/fixtures/demo-app-alt/script.js',
      line: 1,
      name: 'handleFeedRefresh',
      confidence: 'high'
    },
    workspaceRoot: altAppDir,
    worstInteraction: {
      target: '#refresh-feed-btn',
      duration: { median: 350 }
    }
  });
  console.log('Test 7 (Alt Fixture Issue):', altIssue?.problem);
  assert(altIssue, 'Alt fixture issue must be detected');
  assert.strictEqual(altIssue.rootCauseCategory, 'heavy-compute-loop');
  assert(altIssue.evidence.some(e => e.includes('9,000,000')), 'Must cite 9M iterations in alt fixture');
  console.log('✓ Test 7: Alternative fixture demo-app-alt detection passed\n');

  // Test 8: input validation names the missing key (no silent empty array)
  const validStep1 = { metrics: {}, worstInteraction: {}, interactionsTested: [] };
  const validStep2 = { resolvedLocations: {} };
  const validationCases = [
    [{ step2Output: validStep2, workspaceRoot: 'x' }, 'step1Output'],
    [{ step1Output: validStep1, workspaceRoot: 'x' }, 'step2Output'],
    [{ step1Output: validStep1, step2Output: validStep2 }, 'workspaceRoot'],
    [{ step1Output: { worstInteraction: {}, interactionsTested: [] }, step2Output: validStep2, workspaceRoot: 'x' }, "'metrics'"],
    [{ step1Output: { metrics: {}, interactionsTested: [] }, step2Output: validStep2, workspaceRoot: 'x' }, "'worstInteraction'"],
    [{ step1Output: { metrics: {}, worstInteraction: {} }, step2Output: validStep2, workspaceRoot: 'x' }, "'interactionsTested'"],
    [{ step1Output: validStep1, step2Output: {}, workspaceRoot: 'x' }, "'resolvedLocations'"]
  ];
  for (const [input, missing] of validationCases) {
    assert.throws(() => runDeepAnalysis(input), err => err.message.includes(missing), `must throw naming ${missing}`);
  }
  assert.deepStrictEqual(
    runDeepAnalysis({ step1Output: { metrics: {}, worstInteraction: null, interactionsTested: [] }, step2Output: validStep2, workspaceRoot: '/empty-dir-for-zero-findings' }),
    [],
    'null worstInteraction (no interaction measured) is valid, only undefined is missing'
  );
  console.log('✓ Test 8: runDeepAnalysis input validation names each missing key\n');

  // Test 9: slow interaction whose script has no mapped location => null location, low confidence, nothing invented
  const slowInteraction = {
    target: '#slow-click-btn',
    flagged: true,
    duration: { median: 456 },
    scripts: [{ sourceFunctionName: 'handleSlowButtonClick', sourceURL: 'http://localhost/app.js', sourceCharPosition: 601, duration: 451 }]
  };
  const unresolvedIssues = runDeepAnalysis({
    step1Output: { metrics: {}, worstInteraction: slowInteraction, interactionsTested: [slowInteraction] },
    step2Output: { resolvedLocations: { culpritScript: null, culpritFilterScript: null, elements: {} } },
    workspaceRoot: '/empty-dir-for-zero-findings'
  });
  console.log('Test 9 (unresolved INP issue):', JSON.stringify(unresolvedIssues, null, 2));
  assert.strictEqual(unresolvedIssues.length, 1);
  assert.strictEqual(unresolvedIssues[0].location, null);
  assert.strictEqual(unresolvedIssues[0].confidence, 'low');
  assert(unresolvedIssues[0].evidence.includes('source location unresolved'));
  const noScriptInteraction = { target: '#slow-click-btn', flagged: true, duration: { median: 456 }, scripts: [] };
  const noScriptIssues = runDeepAnalysis({
    step1Output: { metrics: {}, worstInteraction: noScriptInteraction, interactionsTested: [noScriptInteraction] },
    step2Output: { resolvedLocations: {} },
    workspaceRoot: '/empty-dir-for-zero-findings'
  });
  assert.strictEqual(noScriptIssues[0].location, null);
  assert(noScriptIssues[0].evidence.includes('No LoAF script captured for this interaction'));
  assert(!JSON.stringify(unresolvedIssues).includes('demo-app'), 'No invented path');
  console.log('✓ Test 9: unresolved source yields null location + low confidence, no invented values\n');

  console.log('All Step 3 Deep Code Analyzer Tests passed successfully!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
