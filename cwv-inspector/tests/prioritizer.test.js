import assert from 'assert';
import { computePriority, filterByPriority, groupByPriorityAndMetric } from '../utils/prioritizer.js';

async function runTests() {
  console.log('Running prioritizer tests...\n');

  // Test 1: Static-only findings never reach HIGH or MEDIUM
  const staticIssue = {
    metric: 'INP',
    evidence_type: 'static',
    confidence: 'high',
    estimated_gain: { metric_delta: 500 },
    location: { file: 'src/handler.js', element: '#btn' }
  };
  const { priority: staticPriority } = computePriority(staticIssue);
  assert.strictEqual(staticPriority, 'LOW', 'Static-only must be LOW');
  console.log('✓ Test 1: Static-only findings never reach HIGH or MEDIUM');

  // Test 2: LCP < 100ms threshold enforced
  const lcpSmall = {
    metric: 'LCP',
    evidence_type: 'measured',
    measured_improvement: { delta: 80 },
    location: { file: 'src/lcp.js' }
  };
  const { priority: lcpSmallPriority, reason: lcpReason } = computePriority(lcpSmall);
  assert.strictEqual(lcpSmallPriority, 'LOW', 'LCP < 100ms must be LOW');
  assert(lcpReason.includes('100ms'), 'Reason must cite 100ms threshold');
  console.log('✓ Test 2: LCP < 100ms threshold enforced');

  // Test 3: CLS < 0.02 threshold enforced
  const clsSmall = {
    metric: 'CLS',
    evidence_type: 'measured',
    measured_improvement: { delta: 0.01 },
    location: { file: 'src/cls.js' }
  };
  const { priority: clsSmallPriority } = computePriority(clsSmall);
  assert.strictEqual(clsSmallPriority, 'LOW', 'CLS < 0.02 must be LOW');
  console.log('✓ Test 3: CLS < 0.02 threshold enforced');

  // Test 4: INP < 30ms threshold enforced
  const inpSmall = {
    metric: 'INP',
    evidence_type: 'measured',
    measured_improvement: { delta: 20 },
    location: { file: 'src/handler.js', element: '#btn' }
  };
  const { priority: inpSmallPriority } = computePriority(inpSmall);
  assert.strictEqual(inpSmallPriority, 'LOW', 'INP < 30ms must be LOW');
  console.log('✓ Test 4: INP < 30ms threshold enforced');

  // Test 5: Third-party code detected
  const thirdParty = {
    metric: 'INP',
    evidence_type: 'measured',
    measured_improvement: { delta: 500 },
    location: { file: 'node_modules/lib/handler.js' }
  };
  const { priority: tpPriority } = computePriority(thirdParty);
  assert.strictEqual(tpPriority, 'LOW', 'Third-party must be LOW');
  console.log('✓ Test 5: Third-party code detected');

  // Test 6: Low confidence + low impact = LOW
  const lowConfLowImpact = {
    metric: 'INP',
    evidence_type: 'measured',
    confidence: 'low',
    measured_improvement: { delta: 30 },
    location: { file: 'src/handler.js', element: '#btn' }
  };
  const { priority: lcliPriority } = computePriority(lowConfLowImpact);
  assert.strictEqual(lcliPriority, 'LOW', 'Low confidence + low impact must be LOW');
  console.log('✓ Test 6: Low confidence + low impact = LOW');

  // Test 7: Priority COMPUTED FROM SCORE, not input field
  const inputIssue = {
    metric: 'INP',
    evidence_type: 'measured',
    measured_improvement: { delta: 500 },
    priority: 'LOW',  // Input says LOW, but score should compute HIGH
    confidence: 'high',
    ease_of_fix: 'medium',
    location: { file: 'src/handler.js', element: '#btn' }
  };
  const { priority: computedPriority, score } = computePriority(inputIssue);
  assert.strictEqual(computedPriority, 'HIGH', 'Priority computed from score, not input field');
  assert(score >= 150, 'Score should be >= 150 for HIGH');
  console.log('✓ Test 7: Priority computed from score, not input field');

  // Test 8: Measured and estimated data preserved in output
  const measureIssue = {
    metric: 'CLS',
    evidence_type: 'measured',
    measured_improvement: { metric_before: 0.25, metric_after: 0.01, delta: 0.24, unit: 'CLS' },
    estimated_gain: { metric_delta: 0.20 },
    confidence: 'high',
    ease_of_fix: 'easy',
    location: { file: 'src/layout.js' }
  };
  const result = computePriority(measureIssue);
  assert(result.measured_improvement !== null, 'Measured improvement should be in output');
  assert(result.estimated_gain !== null, 'Estimated gain should be in output');
  console.log('✓ Test 8: Measured and estimated gains preserved in output');

  // Test 9: Default hiding (includeLow=false)
  const issues = [
    { metric: 'INP', evidence_type: 'measured', measured_improvement: { delta: 500 }, location: { file: 'src/handler.js', element: '#btn' }, confidence: 'high', ease_of_fix: 'medium' },
    { metric: 'LCP', evidence_type: 'measured', measured_improvement: { delta: 50 }, location: { file: 'src/lcp.js' }, confidence: 'high', ease_of_fix: 'medium' },
    { metric: 'CLS', evidence_type: 'measured', measured_improvement: { delta: 0.25 }, location: { file: 'src/cls.js' }, confidence: 'high', ease_of_fix: 'medium' }
  ];
  const { included, hiddenReasons } = filterByPriority(issues, false);
  assert(included.length >= 2, `Should include at least 2 issues, got ${included.length}`);
  assert(Object.keys(hiddenReasons).length > 0, 'Should have hidden reasons');
  console.log(`✓ Test 9: Default hiding works (${included.length} shown, ${Object.values(hiddenReasons).reduce((a, b) => a + b, 0)} hidden)`);

  // Test 10: --include-low shows all
  const { included: allIncluded } = filterByPriority(issues, true);
  assert.strictEqual(allIncluded.length, 3, 'With --include-low, should show all 3');
  console.log('✓ Test 10: --include-low shows all issues');

  // Test 11: Grouping by priority then metric
  const mixedIssues = [
    { metric: 'LCP', priority: 'LOW' },
    { metric: 'INP', priority: 'HIGH' },
    { metric: 'CLS', priority: 'MEDIUM' },
    { metric: 'CLS', priority: 'HIGH' },
    { metric: 'INP', priority: 'MEDIUM' }
  ];
  const grouped = groupByPriorityAndMetric(mixedIssues);
  const priorities = grouped.map(i => i.priority);
  const highIndex = priorities.indexOf('HIGH');
  const mediumIndex = priorities.indexOf('MEDIUM');
  const lowIndex = priorities.indexOf('LOW');
  assert(highIndex < mediumIndex, 'HIGH should come before MEDIUM');
  assert(mediumIndex < lowIndex, 'MEDIUM should come before LOW');
  console.log('✓ Test 11: Grouping by priority then metric works');

  // Test 12: Metric gain and source returned
  const gainIssue = {
    metric: 'INP',
    evidence_type: 'measured',
    measured_improvement: { delta: 325 },
    confidence: 'high',
    ease_of_fix: 'easy',
    location: { file: 'src/handler.js', element: '#btn' }
  };
  const { metricGain, gainSource } = computePriority(gainIssue);
  assert.strictEqual(metricGain, 325, 'Metric gain should be 325');
  assert.strictEqual(gainSource, 'measured', 'Gain source should be measured');
  console.log('✓ Test 12: Metric gain and source returned');

  console.log('\nAll prioritizer tests passed!');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
