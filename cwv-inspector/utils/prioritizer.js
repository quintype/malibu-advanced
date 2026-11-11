/**
 * Prioritizer: Scores issues based on metric gain as fraction of distance to "good" threshold.
 *
 * Scoring Rule (distance-to-good):
 * ┌─────────┬─────────────┬─────────────────────────────────────────────────────┐
 * │ Metric  │ Good Value  │ Score = (current - good) / current * gain / current  │
 * ├─────────┼─────────────┼─────────────────────────────────────────────────────┤
 * │ INP     │ 200ms       │ Higher gain towards 200ms threshold = higher score   │
 * │ LCP     │ 2500ms      │ Higher gain towards 2500ms threshold = higher score  │
 * │ CLS     │ 0.1         │ Higher gain towards 0.1 threshold = higher score     │
 * └─────────┴─────────────┴─────────────────────────────────────────────────────┘
 *
 * Final Score = base_score × confidence × ease_of_fix
 * where confidence ∈ {low: 0.5, medium: 1.0, high: 1.2}
 *       ease_of_fix ∈ {hard: 0.3, medium: 0.6, easy: 1.0}
 *
 * Priority Classification:
 * - HIGH: score ≥ 75
 * - MEDIUM: score ≥ 25 and < 75
 * - LOW: score < 25 OR fails eligibility filters
 *
 * Hide Rules (must be LOW regardless of score):
 * - LCP: gain < 100ms
 * - CLS: gain < 0.02
 * - INP: gain < 30ms (global) or < 200ms (per-interaction)
 * - Third-party code (node_modules, vendor, http/https URLs)
 * - Low confidence + low impact (confidence='low' AND gain < 50ms)
 * - "Good" metrics (already at/below threshold) UNLESS gain > 100ms
 * - Static-only evidence (evidence_type !== 'measured')
 */

const GOOD = { INP: 200, LCP: 2500, CLS: 0.1 };
const confidenceFactor = { high: 1, medium: 0.7, low: 0.35 };

/**
 * Compute priority based on gain, current metric, confidence, ease.
 * Priority is COMPUTED FROM SCORE, not taken from input.
 * Returns { score, priority, reason, baseScore, gainSource, metricGain, measured_improvement, estimated_gain }
 */
export function computePriority(issue) {
  const metric = String(issue.metric || '').toUpperCase();
  const good = GOOD[metric];
  const measured = issue.measured_improvement;
  const measuredDelta = measured?.metric_delta ?? measured?.delta;
  const estimatedDelta = issue.estimated_gain?.metric_delta;
  const metricGain = Number.isFinite(measuredDelta) ? Math.abs(measuredDelta) : Number.isFinite(estimatedDelta) ? Math.abs(estimatedDelta) : 0;
  const gainSource = Number.isFinite(measuredDelta) ? 'measured' : Number.isFinite(estimatedDelta) ? 'estimated' : 'none';
  const current = Number(issue.current_value ?? issue.currentValue ?? issue.shiftScore);
  const distance = Number.isFinite(current) && Number.isFinite(good) ? Math.abs(current - good) : metricGain;
  const gainFraction = distance > 0 ? Math.min(1, metricGain / distance) : 0;
  const conf = String(issue.confidence || 'low').toLowerCase();
  const easeFactor = issue.fix?.fix_validated ? 1 : issue.rootCauseCategory ? 0.65 : 0.3;
  const factors = { gain_fraction: gainFraction, confidence_factor: confidenceFactor[conf] || 0.35, ease_factor: easeFactor };
  const score = gainFraction * factors.confidence_factor * easeFactor;
  let reason = '';
  const file = issue.location?.file || '';
  if (issue.evidence_type !== 'measured') reason = 'Static-only finding';
  else if (metric === 'LCP' && metricGain < 100) reason = `LCP gain ${metricGain}ms below 100ms threshold`;
  else if (metric === 'CLS' && metricGain < 0.02) reason = `CLS gain ${metricGain} below 0.02 threshold`;
  else if (metric === 'INP' && Number.isFinite(current) && current < 200) reason = 'INP below 200ms threshold';
  else if (metric === 'INP' && metricGain < 30) reason = 'INP gain below 30ms threshold';
  else if (issue.interactionSummary === 'below-threshold-majority' || issue.summary === 'below-threshold-majority') reason = 'interaction summary is below-threshold-majority';
  else if (issue.isThirdParty || /node_modules|vendor\//.test(file) || /^https?:/.test(file)) reason = 'Third-party finding; report as note';
  else if (conf === 'low' && gainFraction < 0.2) reason = 'Low confidence and low impact';
  else if (Number.isFinite(current) && Number.isFinite(good) && current <= good && metricGain <= 100) reason = 'Metric is already good and gain is not above 100';
  const priority = reason ? 'LOW' : score >= 0.55 ? 'HIGH' : score >= 0.2 ? 'MEDIUM' : 'LOW';
  return { score, priority, reason: reason || `${gainSource} gain fraction × confidence × ease`, gainFraction, factors, gainSource, metricGain, measured_improvement: measured || null, estimated_gain: issue.estimated_gain || null };
}

/**
 * Filter issues by priority, return { included, hiddenReasons }
 */
export function filterByPriority(issues, includeLow = false) {
  const included = [];
  const hiddenReasons = {};

  for (const issue of issues) {
    const { priority, reason, score, gainSource, metricGain, measured_improvement, estimated_gain } = computePriority(issue);

    if (priority !== 'LOW' || includeLow) {
      included.push({
        ...issue,
        priority,
        score,
        gainSource,
        metricGain,
        measured_improvement,
        estimated_gain,
        priorityReason: reason
      });
    } else {
      const key = reason || 'other';
      hiddenReasons[key] = (hiddenReasons[key] || 0) + 1;
    }
  }

  return { included, hiddenReasons };
}

/**
 * Group issues by priority (HIGH > MEDIUM > LOW) then by metric (INP, CLS, LCP)
 */
export function groupByPriorityAndMetric(issues) {
  const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const metricOrder = { INP: 0, CLS: 1, LCP: 2 };

  return issues.sort((a, b) => {
    const aPriority = priorityOrder[a.priority];
    const bPriority = priorityOrder[b.priority];
    const pDiff = (aPriority !== undefined ? aPriority : 99) - (bPriority !== undefined ? bPriority : 99);
    if (pDiff !== 0) return pDiff;

    const aMetric = metricOrder[a.metric];
    const bMetric = metricOrder[b.metric];
    return (aMetric !== undefined ? aMetric : 99) - (bMetric !== undefined ? bMetric : 99);
  });
}
