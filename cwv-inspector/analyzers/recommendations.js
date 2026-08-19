import path from 'path';
import { correlateCls } from './correlation.js';

/**
 * Consolidates and groups all scanner findings to keep the report compact and clear.
 * Additionally runs the CLS Correlation Engine to map layout shifts to source coordinates.
 * 
 * @param {Array<object>} staticIssues Issues found by code inspection.
 * @param {Array<object>} lighthouseIssues Issues found by running lighthouse (optional).
 * @param {Array<object>} astElements JSX elements parsed from project files.
 * @returns {object} Categorized, prioritized, and scored recommendations.
 */
export function compileRecommendations(staticIssues, lighthouseIssues = null, astElements = []) {
  // Extract runtime CLS elements
  const lhClsElements = [];
  if (lighthouseIssues) {
    if (lighthouseIssues.mobile && Array.isArray(lighthouseIssues.mobile.clsElements)) {
      lhClsElements.push(...lighthouseIssues.mobile.clsElements.map(el => ({ ...el, device: 'Mobile' })));
    }
    if (lighthouseIssues.desktop && Array.isArray(lighthouseIssues.desktop.clsElements)) {
      lhClsElements.push(...lighthouseIssues.desktop.clsElements.map(el => ({ ...el, device: 'Desktop' })));
    }
  }

  // Run the Correlation Engine
  const correlatedClsResult = correlateCls(lhClsElements, astElements);
  
  // Track matched static issues to exclude them from standard listing
  const matchedStaticIndices = new Set();
  const correlatedIssues = [];

  correlatedClsResult.forEach(item => {
    if (item.confidence !== 'UNRESOLVED' && item.source) {
      const srcFile = item.source.filePath;
      const srcLine = item.source.line;

      // Find if there is a matching static issue on this file & line
      const staticMatchIdx = staticIssues.findIndex(issue => {
        // Resolve absolute paths for safe comparison
        const isSameFile = issue.file === srcFile || path.resolve(issue.file) === path.resolve(srcFile);
        const isSameLine = parseInt(issue.line, 10) === parseInt(srcLine, 10);
        return isSameFile && isSameLine && issue.cwv === 'cls';
      });

      let staticDetails = null;
      if (staticMatchIdx !== -1) {
        matchedStaticIndices.add(staticMatchIdx);
        staticDetails = staticIssues[staticMatchIdx];
      }

      // Build context-aware recommendation text
      const shortFile = path.basename(srcFile);
      const isImg = item.source.tagName.toLowerCase() === 'img' || item.source.tagName === 'Image';
      let message = `CLS Layout Shift associated with <${item.source.tagName}> in ${shortFile}`;
      let suggestion = `Reserve layout space for the <${item.source.tagName}> element by providing explicit width and height attributes or style definitions.`;
      
      if (staticDetails) {
        message = `Layout Shift matched to source: <${item.source.tagName}> in ${shortFile}`;
        suggestion = `${staticDetails.suggestion} This resolves the runtime shift participant identified by Lighthouse.`;
      } else if (isImg) {
        suggestion = `Verify if the image is missing width/height attributes or CSS aspect-ratio properties.`;
      }

      const evidenceText = item.evidence.join('; ');
      const impact = `Lighthouse flagged "${item.lhEl.selector}" as participating in layout shifts (Shift Score: ${item.lhEl.score.toFixed(3)}) on ${item.lhEl.device}. [Evidence: ${evidenceText}]`;

      correlatedIssues.push({
        type: 'correlated',
        cwv: 'cls',
        severity: 'high',
        file: srcFile,
        line: srcLine,
        message,
        impact,
        suggestion,
        confidence: item.confidence,
        evidence: item.evidence,
        selector: item.lhEl.selector,
        device: item.lhEl.device,
        snippet: item.lhEl.snippet,
        score: item.lhEl.score,
        staticRule: staticDetails ? staticDetails.message : null
      });
    } else {
      // Unresolved: Keep as runtime-only CLS issue
      correlatedIssues.push({
        type: 'lighthouse-unresolved',
        cwv: 'cls',
        severity: 'medium',
        file: `Runtime Audit (Lighthouse ${item.lhEl.device})`,
        line: '-',
        message: `Layout Shift on selector "${item.lhEl.selector}"`,
        impact: `Lighthouse detected this element shifting on ${item.lhEl.device} but it could not be mapped to a unique source element.`,
        suggestion: `Check elements matching "${item.lhEl.selector}" in your compiled layouts.`,
        selector: item.lhEl.selector,
        device: item.lhEl.device,
        snippet: item.lhEl.snippet,
        score: item.lhEl.score,
        confidence: 'UNRESOLVED',
        evidence: item.evidence
      });
    }
  });

  // Filter staticIssues to remove combined ones
  const cleanStaticIssues = staticIssues.filter((_, idx) => !matchedStaticIndices.has(idx));

  // Build final consolidated issues list
  const allIssues = [...cleanStaticIssues, ...correlatedIssues];

  // Append other general (non-CLS) Lighthouse opportunities
  if (lighthouseIssues) {
    const handleOpps = (opps, modeLabel) => {
      if (!Array.isArray(opps)) return;
      opps.forEach(opp => {
        // Skip CLS opportunities since we processed them via correlation engine above
        const isCls = opp.id.includes('layout') || opp.id.includes('shift') || opp.id.includes('cls') || opp.id.includes('cumulative-layout-shift');
        if (isCls) return;

        let cwv = 'lcp';
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
    
    if (Array.isArray(lighthouseIssues.opportunities)) {
      handleOpps(lighthouseIssues.opportunities, 'Runtime');
    }
  }

  // Group issues by message, suggestion, category, and severity
  const grouped = {};
  allIssues.forEach(issue => {
    // Keep correlated items and unresolved items separate (don't group them aggressively by description)
    const isCorrelated = issue.type === 'correlated' || issue.type === 'lighthouse-unresolved';
    const key = isCorrelated 
      ? `corr-${issue.file}-${issue.line}-${issue.selector}-${issue.cwv}` 
      : `${issue.message}-${issue.suggestion}-${issue.cwv}-${issue.severity}`;

    if (!grouped[key]) {
      grouped[key] = {
        message: issue.message,
        suggestion: issue.suggestion,
        cwv: issue.cwv,
        severity: issue.severity,
        impact: issue.impact,
        type: issue.type || 'code',
        file: issue.file,
        line: issue.line,
        confidence: issue.confidence || null,
        evidence: issue.evidence || null,
        selector: issue.selector || null,
        device: issue.device || null,
        snippet: issue.snippet || null,
        score: issue.score || null,
        staticRule: issue.staticRule || null,
        occurrences: []
      };
    }
    grouped[key].occurrences.push({ file: issue.file, line: issue.line });
  });

  // Convert grouped items back to flat list, summarizing locations
  const finalIssues = Object.values(grouped).map(group => {
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

    if (group.type !== 'correlated' && group.type !== 'lighthouse-unresolved') {
      if (uniqueOccurrences.length === 1) {
        group.file = uniqueOccurrences[0].file;
        group.line = uniqueOccurrences[0].line;
      } else {
        group.file = `${uniqueOccurrences.length} files affected`;
        group.line = '-';
      }
    }
    return group;
  });

  // Calculate scores on grouped findings
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
