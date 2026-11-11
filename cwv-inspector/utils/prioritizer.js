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

/**
 * Calculate base score as fraction of distance from current value to good threshold.
 * @param {number} metric - INP, LCP or CLS metric value
 * @param {string} type - 'INP' | 'LCP' | 'CLS'
 * @returns {number} normalized base score (0-100)
 */
function calculateBaseScore(metric, type) {
  // Good thresholds per metric
  const goodThresholds = {
    'INP': 200,   // ms
    'LCP': 2500,  // ms
    'CLS': 0.1    // unitless 0-1 scale
  };

  const good = goodThresholds[type];
  if (!good || metric <= good) return 0;

  // Score = distance to good / current metric, normalized to 0-100
  // Higher metric = further from good = higher urgency
  const distanceToGood = metric - good;
  const relativeDistance = distanceToGood / good;
  return Math.min(100, Math.round(relativeDistance * 50)); // Cap at 100
}

/**
 * Compute priority based on gain, current metric, confidence, ease.
 * Priority is COMPUTED FROM SCORE, not taken from input.
 * Returns { score, priority, reason, baseScore, gainSource, metricGain, measured_improvement, estimated_gain }
 */
export function computePriority(issue) {
  // Static-only findings never reach HIGH or MEDIUM
  if (issue.evidence_type !== 'measured') {
    return {
      score: 0,
      priority: 'LOW',
      reason: 'Static-only evidence; no measured runtime data',
      measured_improvement: issue.measured_improvement || null,
      estimated_gain: issue.estimated_gain || null
    };
  }

  // Determine metric gain (measured > estimated)
  let metricGain = 0;
  let gainSource = 'none';
  if (issue.measured_improvement && Number.isFinite(issue.measured_improvement.delta)) {
    metricGain = Math.abs(issue.measured_improvement.delta);
    gainSource = 'measured';
  } else if (issue.estimated_gain && Number.isFinite(issue.estimated_gain.metric_delta)) {
    metricGain = Math.abs(issue.estimated_gain.metric_delta);
    gainSource = 'estimated';
  }

  // Metric-specific hide rules (absolute thresholds)
  if (issue.metric === 'LCP') {
    if (metricGain < 100) {
      return {
        score: 0,
        priority: 'LOW',
        reason: `LCP gain ${metricGain}ms < 100ms threshold`,
        measured_improvement: issue.measured_improvement || null,
        estimated_gain: issue.estimated_gain || null
      };
    }
  } else if (issue.metric === 'CLS') {
    if (metricGain < 0.02) {
      return {
        score: 0,
        priority: 'LOW',
        reason: `CLS gain ${metricGain.toFixed(4)} < 0.02 threshold`,
        measured_improvement: issue.measured_improvement || null,
        estimated_gain: issue.estimated_gain || null
      };
    }
  } else if (issue.metric === 'INP') {
    if (metricGain < 30 || (issue.location?.element && metricGain < 200)) {
      return {
        score: 0,
        priority: 'LOW',
        reason: `INP gain ${metricGain}ms below threshold (30ms global, 200ms per-interaction)`,
        measured_improvement: issue.measured_improvement || null,
        estimated_gain: issue.estimated_gain || null
      };
    }
  }

  // Third-party code: cannot fix
  const file = issue.location?.file || '';
  if (file.includes('node_modules') || file.includes('vendor/') || file.startsWith('http')) {
    return {
      score: 0,
      priority: 'LOW',
      reason: 'Third-party code; no client-owned fix available',
      measured_improvement: issue.measured_improvement || null,
      estimated_gain: issue.estimated_gain || null
    };
  }

  // Low confidence + low impact
  const conf = issue.confidence || 'low';
  const confRank = { low: 1, medium: 2, high: 3 };
  if ((confRank[conf] || 0) === 1 && metricGain < 50) {
    return {
      score: 0,
      priority: 'LOW',
      reason: `Low confidence (${conf}) with low impact (${metricGain}ms gain)`,
      measured_improvement: issue.measured_improvement || null,
      estimated_gain: issue.estimated_gain || null
    };
  }

  // Calculate score: base_score × confidence × ease
  const baseScore = calculateBaseScore(metricGain, issue.metric);
  const confMap = { low: 0.5, medium: 1.0, high: 1.2 };
  const easeMap = { easy: 1.0, medium: 0.6, hard: 0.3 };
  const confMultiplier = confMap[conf] || 0.5;
  const ease = easeMap[issue.ease_of_fix] || 0.5;
  const score = baseScore * confMultiplier * ease;

  // Classify priority from computed score
  let priority = 'LOW';
  if (score >= 75) priority = 'HIGH';
  else if (score >= 25) priority = 'MEDIUM';

  return {
    score,
    priority,
    reason: `${gainSource} gain ${metricGain}${issue.metric === 'CLS' ? '' : 'ms'} × confidence ${confMultiplier} × ease ${ease} = ${score.toFixed(0)}`,
    baseScore,
    gainSource,
    metricGain,
    measured_improvement: issue.measured_improvement || null,
    estimated_gain: issue.estimated_gain || null
  };
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
