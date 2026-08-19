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

  // Extract runtime INP interactions
  const mobileInps = (lighthouseIssues?.mobile?.inpInteractions || []).map(item => ({ ...item, device: 'Mobile', score: item.score || lighthouseIssues?.mobile?.inp?.value || 0 }));
  const desktopInps = (lighthouseIssues?.desktop?.inpInteractions || []).map(item => ({ ...item, device: 'Desktop', score: item.score || lighthouseIssues?.desktop?.inp?.value || 0 }));
  const runtimeInps = [...mobileInps, ...desktopInps];

  // Outlier / Representative Aggregation: Sort worst latency first and deduplicate by device + selector + type
  const aggregatedInps = [];
  const seenInpKeys = new Set();
  runtimeInps.sort((a, b) => b.score - a.score);
  runtimeInps.forEach(ri => {
    const key = `${ri.device}-${ri.selector}-${ri.type}`;
    if (!seenInpKeys.has(key)) {
      seenInpKeys.add(key);
      aggregatedInps.push(ri);
    }
  });

  const processedInpIssues = [];
  const matchedInpStaticIndices = new Set();

  // V4 Call Graph Tracing with Cycle / Recursion Protection (max depth 2)
  const traceCallChain = (srcFile, handlerName) => {
    const componentTags = astElements.filter(el => el.filePath === srcFile);
    let calls = {};
    let functions = {};
    for (const tag of componentTags) {
      if (tag.fileCalls) calls = { ...calls, ...tag.fileCalls };
      if (tag.fileFunctions) functions = { ...functions, ...tag.fileFunctions };
    }

    const chain = [handlerName];
    const visited = new Set([handlerName]);
    let current = handlerName;

    for (let depth = 0; depth < 2; depth++) {
      const nextCalls = calls[current];
      if (Array.isArray(nextCalls) && nextCalls.length > 0) {
        // Cycle protection check
        const nextFunc = nextCalls.find(name => !visited.has(name));
        if (nextFunc) {
          chain.push(nextFunc);
          visited.add(nextFunc);
          current = nextFunc;
        } else {
          break;
        }
      } else {
        break;
      }
    }

    const lastFunc = chain[chain.length - 1];
    const isLocal = functions[lastFunc] !== undefined;

    return {
      chain,
      external: !isLocal,
      finalLine: functions[lastFunc] || null,
      finalFunc: lastFunc
    };
  };

  // Perform V4 Phase and Signal-Based INP Correlation
  aggregatedInps.forEach((ri) => {
    if (ri.score <= 200) return; // Do not correlate if INP is within Good limits (<= 200ms)

    // Classify impact bucket
    const inpImpact = ri.score > 500 ? 'Poor' : 'Needs Improvement';

    // Calculate phase breakdown
    const inDelay = ri.inputDelay || 0;
    const procDur = ri.processingDuration || 0;
    const presDelay = ri.presentationDelay || 0;
    
    let dominantPhase = 'Input Delay';
    let phaseEx = 'The main thread was busy before the interaction handler could start.';
    if (procDur > inDelay && procDur > presDelay) {
      dominantPhase = 'Processing Duration';
      phaseEx = 'The interaction handler itself is performing expensive JavaScript work.';
    } else if (presDelay > inDelay && presDelay > procDur) {
      dominantPhase = 'Presentation Delay';
      phaseEx = 'The handler completed, but rendering the resulting UI took significant time.';
    }

    // Scan static issues to find candidate matches for this interaction
    const candidates = [];

    cleanStaticIssues.forEach((issue, staticIdx) => {
      if (issue.cwv !== 'inp') return;

      let score = 0;
      const reasons = [];

      // Signal 1: Selector / Component match
      const filename = path.basename(issue.file, path.extname(issue.file)).toLowerCase();
      const isSelectorMatch = ri.selector && ri.selector.toLowerCase().includes(filename);
      if (isSelectorMatch) {
        score += 3;
        reasons.push('exact selector/component match');
      }

      // Signal 2: Event handler name match
      const matchesHandler = issue.handler && ri.type && issue.handler.toLowerCase().includes(ri.type.toLowerCase());
      if (matchesHandler) {
        score += 3;
        reasons.push('exact event handler type match');
      }

      // Signal 3: Phase alignment
      let phaseAligned = false;
      if (!issue.operation) {
        phaseAligned = true;
      } else if (dominantPhase === 'Input Delay' && issue.operation === 'third-party') {
        phaseAligned = true;
      } else if (dominantPhase === 'Processing Duration' && (issue.operation === 'fetch' || issue.operation === 'computation' || issue.operation === 'async')) {
        phaseAligned = true;
      } else if (dominantPhase === 'Presentation Delay' && (issue.operation === 'reflow' || issue.operation === 'react-memo' || issue.operation === 'react-rendering')) {
        phaseAligned = true;
      }

      if (phaseAligned) {
        score += 2;
        reasons.push(`phase alignment with ${dominantPhase}`);
      } else if (issue.operation) {
        // Negative Correlation: subtract points if dominant phase doesn't match static issue's operation
        score -= 2;
      }

      // Signal 4: Function Call tracing resolved
      let tracedRes = null;
      if (issue.handlerFunction) {
        tracedRes = traceCallChain(issue.file, issue.handlerFunction);
        if (tracedRes && !tracedRes.external) {
          score += 2;
          reasons.push('function declaration traced in AST');
        }
      if (!isSelectorMatch && !matchesHandler) {
        score -= 4;
      }}

      if (score >= 3) {
        candidates.push({ issue, staticIdx, score, reasons, tracedRes });
      }
    });

    if (candidates.length > 0) {
      // Find the highest scoring candidate to form the root-cause mapping
      candidates.sort((a, b) => b.score - a.score);
      const primaryCandidate = candidates[0];

      // Merge all matching candidates on the same file/component to prevent duplicate cards (Root-Cause Deduplication)
      const mergedContributingFactors = [];
      const mergedStaticIndicesList = [];

      candidates.forEach(cand => {
        if (cand.issue.file === primaryCandidate.issue.file) {
          mergedContributingFactors.push(cand.issue.message);
          matchedInpStaticIndices.add(cand.staticIdx);
          mergedStaticIndicesList.push(cand.staticIdx);
        }
      });

      // Compute V5 confidence
      let confidence = 'LOW';
      if (primaryCandidate.score >= 6) confidence = 'HIGH';
      else if (primaryCandidate.score >= 3) confidence = 'MEDIUM';

      // Determine V5 Correlation State
      let correlationState = 'PARTIAL';
      const isThirdPartySel = ri.selector && (ri.selector.includes('google') || ri.selector.includes('facebook') || ri.selector.includes('gtm') || ri.selector.includes('analytics') || ri.selector.includes('ads'));
      const isHandlerResolved = primaryCandidate.tracedRes && !primaryCandidate.tracedRes.external;

      if (isThirdPartySel) {
        correlationState = 'PARTIAL';
      } else if (confidence === 'HIGH' && primaryCandidate.score >= 8 && isHandlerResolved) {
        correlationState = 'EXACT';
      } else if (confidence === 'HIGH' || confidence === 'MEDIUM') {
        if (primaryCandidate.score >= 6) {
          correlationState = 'STRONG';
        } else {
          correlationState = 'PARTIAL';
        }
      }

      const shortFile = path.basename(primaryCandidate.issue.file);
      
      // Target handler mapping precision variables
      const handlerName = primaryCandidate.issue.handler || 'unknown';
      const handlerFunc = primaryCandidate.issue.handlerFunction || 'inline';
      const finalLineNum = primaryCandidate.tracedRes?.finalLine || primaryCandidate.issue.line || 1;

      // Severity logic combining impact (INP latency) + confidence
      let severity = 'medium';
      if (ri.score >= 300 && (confidence === 'HIGH' || confidence === 'MEDIUM')) {
        severity = 'high';
      } else if (ri.score > 200) {
        severity = 'medium';
      } else {
        severity = 'low';
      }

      // Format programmatic explanation checklist for V5
      const hasSelectorSignal = primaryCandidate.reasons.includes('exact selector/component match');
      const hasEventSignal = primaryCandidate.reasons.includes('exact event handler type match');
      const hasTracedSignal = primaryCandidate.reasons.includes('function declaration traced in AST');
      const hasPhaseSignal = primaryCandidate.reasons.includes(`phase alignment with ${dominantPhase}`);

      const checklist = [
        `${hasSelectorSignal ? '✓' : '✗'} Runtime selector matched JSX element`,
        `${hasEventSignal ? '✓' : '✗'} Runtime event matched onClick`,
        `${hasTracedSignal ? '✓' : '✗'} Handler function resolved`,
        `${hasPhaseSignal ? '✓' : '✗'} ${dominantPhase} was dominant`,
        `✓ Static processing issue exists inside the handler call chain`
      ];
      const signalsExplanation = `Correlation: ${correlationState}\nWhy:\n` + checklist.map(line => `  ${line}`).join('\n');

      const chainTrace = primaryCandidate.tracedRes?.chain || [handlerFunc];
      const formattedChain = chainTrace.map(name => `${name}()`).join(' → ');

      processedInpIssues.push({
        type: 'correlated',
        cwv: 'inp',
        severity,
        file: primaryCandidate.issue.file,
        line: finalLineNum,
        message: `Slow ${ri.type || 'interaction'} Interaction in ${shortFile}`,
        impact: `Runtime Evidence: Interaction latency of ${ri.score}ms on ${ri.device} (${inpImpact} impact). Phase: ${dominantPhase}. [Details: ${inDelay}ms Input / ${procDur}ms Proc / ${presDelay}ms Pres. Root cause: ${phaseEx}]`,
        suggestion: `Static Analysis identified the following contributing factors: ${mergedContributingFactors.join('; ')}. Remediation: ${primaryCandidate.issue.suggestion}`,
        confidence,
        correlationState,
        evidence: primaryCandidate.reasons,
        confidenceExplanation: signalsExplanation,
        selector: ri.selector,
        device: ri.device,
        inpPhase: dominantPhase,
        handler: handlerName,
        handlerFunction: handlerFunc,
        inpImpact,
        callChain: chainTrace,
        callChainString: formattedChain
      });
    } else {
      // Unresolved Correlation: Lighthouse reported high INP, but we couldn't match it to any local AST files
      const isThirdPartyScript = ri.selector && (ri.selector.includes('google') || ri.selector.includes('facebook') || ri.selector.includes('gtm') || ri.selector.includes('analytics'));
      const unresolvedMsg = isThirdPartyScript
        ? 'High INP was observed during this interaction, but the dominant runtime activity appears to originate from a third-party script. Local source correlation could not establish causation.'
        : `Dynamic DOM, selector not found, or source mapping unavailable for "${ri.selector || 'unknown'}"`;

      processedInpIssues.push({
        type: 'lighthouse-unresolved',
        cwv: 'inp',
        severity: 'medium',
        file: 'Runtime Audit (Lighthouse)',
        line: '-',
        message: `Unresolved INP on selector "${ri.selector || 'unknown'}"`,
        impact: `Runtime Evidence: Lighthouse detected INP latency of ${ri.score}ms on ${ri.device} (${inpImpact} impact). Phase: ${dominantPhase}. Reason: ${unresolvedMsg}`,
        suggestion: isThirdPartyScript ? 'Defer or lazy load the associated third-party integrations.' : 'Review DOM elements matching this selector for slow dynamic behavior.',
        selector: ri.selector,
        device: ri.device,
        confidence: 'UNRESOLVED',
        correlationState: 'UNRESOLVED',
        evidence: [`Lighthouse INP: ${ri.score}ms`, `Phase: ${dominantPhase}`],
        confidenceExplanation: 'Signals: ✗ No matching local codebase component found',
        inpImpact
      });
    }
  });

  // Filter staticIssues to keep non-correlated static-only INP issues as LOW severity
  const remainingStaticIssues = cleanStaticIssues.filter((issue, idx) => {
    if (issue.cwv === 'inp') {
      return !matchedInpStaticIndices.has(idx);
    }
    return true;
  }).map(issue => {
    if (issue.cwv === 'inp') {
      return {
        ...issue,
        severity: 'low',
        confidence: 'LOW',
        correlationState: 'STATIC_ONLY',
        evidence: ['Static rule scanned; no runtime INP latency triggered for this component.'],
        confidenceExplanation: 'Signals: ✗ No corresponding runtime latency event registered',
        impact: `Static Evidence: ${issue.impact} [Static Only - No runtime INP correlation established]`
      };
    }
    return issue;
  });

  // Build final consolidated issues list
  const allIssues = [...remainingStaticIssues, ...processedInpIssues, ...correlatedIssues];

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
        correlationState: issue.correlationState || null,
        confidenceExplanation: issue.confidenceExplanation || null,
        evidence: issue.evidence || null,
        selector: issue.selector || null,
        device: issue.device || null,
        snippet: issue.snippet || null,
        score: issue.score || null,
        staticRule: issue.staticRule || null,
        inpImpact: issue.inpImpact || null,
        callChain: issue.callChain || null,
        callChainString: issue.callChainString || null,
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
      // Sort INP items first
      if (a.cwv === 'inp' && b.cwv !== 'inp') return -1;
      if (a.cwv !== 'inp' && b.cwv === 'inp') return 1;
      if (a.cwv === 'inp' && b.cwv === 'inp') {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        if (scoreB !== scoreA) return scoreB - scoreA;

        const stateWeight = { EXACT: 5, STRONG: 4, PARTIAL: 3, UNRESOLVED: 2, STATIC_ONLY: 1 };
        const weightA = stateWeight[a.correlationState] || 0;
        const weightB = stateWeight[b.correlationState] || 0;
        if (weightB !== weightA) return weightB - weightA;
      }
      const priority = { high: 3, medium: 2, low: 1 };
      const sevA = priority[a.severity] || 0;
      const sevB = priority[b.severity] || 0;
      return sevB - sevA;
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
