/**
 * Consolidates and groups all scanner findings to keep the report compact and clear.
 * If multiple files share the same performance issue type and message, they are grouped.
 * 
 * @param {Array<object>} staticIssues Issues found by code inspection.
 * @param {Array<object>} lighthouseIssues Issues found by running lighthouse (optional).
 * @returns {object} Categorized, prioritized, and scored recommendations.
 */
export function compileRecommendations(staticIssues, lighthouseIssues = null) {
  const allIssues = [...staticIssues];

  if (lighthouseIssues) {
    const handleOpps = (opps, modeLabel) => {
      if (!Array.isArray(opps)) return;
      opps.forEach(opp => {
        let cwv = 'lcp';
        if (opp.id.includes('layout') || opp.id.includes('shift') || opp.id.includes('cls')) cwv = 'cls';
        if (opp.id.includes('block') || opp.id.includes('delay') || opp.id.includes('thread')) cwv = 'inp';

        allIssues.push({
          type: 'lighthouse',
          file: `Runtime Audit (Lighthouse ${modeLabel})`,
          line: '-',
          cwv,
          severity: opp.score < 50 ? 'high' : 'medium',
          message: `${opp.title} (${opp.displayValue || ''})`,
          impact: opp.description || `Lighthouse flagged runtime efficiency opportunity on ${modeLabel}.`,
          suggestion: 'Optimize performance using Lighthouse suggestions.'
        });
      });
    };

    if (lighthouseIssues.mobile) handleOpps(lighthouseIssues.mobile.opportunities, 'Mobile');
    if (lighthouseIssues.desktop) handleOpps(lighthouseIssues.desktop.opportunities, 'Desktop');
    
    // Fallback
    if (Array.isArray(lighthouseIssues.opportunities)) {
      handleOpps(lighthouseIssues.opportunities, 'Runtime');
    }
  }

  // Group issues by message, suggestion, cwv category, and severity
  const grouped = {};
  allIssues.forEach(issue => {
    const key = `${issue.message}-${issue.suggestion}-${issue.cwv}-${issue.severity}`;
    if (!grouped[key]) {
      grouped[key] = {
        message: issue.message,
        suggestion: issue.suggestion,
        cwv: issue.cwv,
        severity: issue.severity,
        impact: issue.impact,
        type: issue.type,
        occurrences: []
      };
    }
    grouped[key].occurrences.push({ file: issue.file, line: issue.line });
  });

  // Convert grouped items back to flat list, summarizing locations
  const finalIssues = Object.values(grouped).map(group => {
    // Deduplicate occurrences
    const uniqueOccurrences = [];
    const seenOcc = new Set();
    group.occurrences.forEach(o => {
      const k = `${o.file}:${o.line}`;
      if (!seenOcc.has(k)) {
        seenOcc.add(k);
        uniqueOccurrences.push(o);
      }
    });

    group.occurrences = uniqueOccurrences;

    if (uniqueOccurrences.length === 1) {
      group.file = uniqueOccurrences[0].file;
      group.line = uniqueOccurrences[0].line;
    } else {
      group.file = `${uniqueOccurrences.length} files affected`;
      group.line = '-';
    }
    return group;
  });

  // Calculate scores on grouped findings (or raw findings - grouped is cleaner for user counts)
  const highCount = finalIssues.filter(i => i.severity === 'high').length;
  const mediumCount = finalIssues.filter(i => i.severity === 'medium').length;
  const lowCount = finalIssues.filter(i => i.severity === 'low').length;

  const totalWeight = (highCount * 5) + (mediumCount * 2) + (lowCount * 0.5);
  const healthScore = Math.max(0, Math.round(100 - totalWeight));

  return {
    healthScore,
    issues: finalIssues.sort((a, b) => {
      const priority = { high: 3, medium: 2, low: 1 };
      return priority[b.severity] - priority[a.severity];
    }),
    summary: {
      total: finalIssues.length,
      high: highCount,
      medium: mediumCount,
      low: lowCount,
      lcpIssues: finalIssues.filter(i => i.cwv === 'lcp').length,
      clsIssues: finalIssues.filter(i => i.cwv === 'cls').length,
      inpIssues: finalIssues.filter(i => i.cwv === 'inp').length
    }
  };
}
