import path from 'path';
import { correlateCls } from './correlation.js';
import { config } from '../config.js';
import { extractCodeContext } from '../utils/codeContext.js';

const METRIC_GOOD = { INP: 200, LCP: 2500, CLS: 0.1 };
const CONFIDENCE_FACTOR = { high: 1, medium: 0.7, low: 0.35 };

/**
 * Compute priority from gain fraction × confidence × ease; upstream priority labels are ignored.
 * Gain/current values come from collector issue fields. Confidence comes from source mapping and
 * cause attribution. Ease is 1 for validated fixes, 0.65 for a categorized cause, and 0.3 otherwise.
 */
export function prioritizeRuntimeIssues(issues = []) {
  const ranked = [];
  const hidden = [];
  for (const issue of issues) {
    const metric = String(issue.metric || '').toUpperCase();
    const metricValue = metric === 'INP'
      ? Number(issue.current_value ?? issue.currentValue ?? issue.duration?.median ?? issue.inp?.median)
      : metric === 'LCP'
        ? Number(issue.current_value ?? issue.currentValue ?? issue.lcpValue ?? issue.value)
        : metric === 'CLS'
          ? Number(issue.current_value ?? issue.currentValue ?? issue.shiftScore)
          : NaN;
    const rawGain = Number(issue.measured_improvement?.metric_delta ?? issue.measured_improvement?.delta ?? issue.estimated_gain?.metric_delta);
    const good = METRIC_GOOD[metric];
    const confidence = String(issue.confidence || 'low').toLowerCase();
    const isStatic = issue.evidence_type === 'static-only' || issue.correlationState === 'STATIC_ONLY';
    const severity = Number.isFinite(metricValue) && Number.isFinite(rawGain) && good
      ? Math.max(0, Math.min(1, rawGain / Math.max(Math.abs(metricValue - good), Number.EPSILON)))
      : 0;
    const ease = issue.fix?.fix_validated ? 1 : issue.rootCauseCategory ? 0.65 : 0.3;
    const score = severity * (CONFIDENCE_FACTOR[confidence] || 0.35) * ease;
    let reason = null;
    const gain = Number.isFinite(rawGain) ? rawGain : 0;
    if (issue.interactionSummary === 'below-threshold-majority' || issue.summary === 'below-threshold-majority') reason = 'interaction summary is below-threshold-majority';
    else if (metric !== 'CLS' && Number.isFinite(metricValue) && good && metricValue <= good && gain <= 100) reason = 'metric is already good and estimated gain is not above 100';
    else if (isStatic) reason = 'static-only finding';
    else if (metric === 'LCP' && gain < 100) reason = 'LCP gain below 100ms';
    else if (metric === 'CLS' && gain < 0.02) reason = 'CLS gain below 0.02';
    else if (metric === 'INP' && Number.isFinite(metricValue) && metricValue < 200) reason = 'INP is below the 200ms threshold';
    else if (metric === 'INP' && gain < 30) reason = 'INP gain below 30ms';
    else if (issue.isThirdParty || /node_modules|vendor\//.test(issue.location?.file || '')) reason = 'third-party finding';
    else if (confidence === 'low' && severity < 0.2) reason = 'low confidence and low impact';
    if (reason) {
      const thirdParty = reason === 'third-party finding';
      hidden.push({ ...issue, priority: 'HIDDEN', hidden_reason: reason, ...(thirdParty ? { note: 'Third-party finding; reported without suggesting a code change.' } : {}), source: issue.source || 'live-run' });
      continue;
    }
    const priority = isStatic ? 'LOW' : score >= 0.55 ? 'HIGH' : score >= 0.2 ? 'MEDIUM' : 'LOW';
    ranked.push({
      ...issue,
      priority,
      priority_score: score,
      priority_factors: { gain_fraction: severity, confidence_factor: CONFIDENCE_FACTOR[confidence] || 0.35, ease_factor: ease },
      source: issue.source || 'live-run',
      estimate_vs_measured: { estimated_gain: issue.estimated_gain ?? null, measured_improvement: issue.measured_improvement ?? null }
    });
  }
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  const metricOrder = { INP: 0, LCP: 1, CLS: 2 };
  ranked.sort((a, b) => order[a.priority] - order[b.priority] || (metricOrder[String(a.metric).toUpperCase()] ?? 9) - (metricOrder[String(b.metric).toUpperCase()] ?? 9));
  return { issues: ranked, hiddenIssues: hidden, hiddenCount: hidden.length };
}

function getFileCodeContext(filePath, line, allFiles = []) {
  if (!filePath || !line || typeof line !== 'number') return null;
  const match = allFiles.find(f => 
    f.filePath === filePath || 
    f.relativePath === filePath || 
    (f.filePath && path.resolve(f.filePath) === path.resolve(filePath))
  );
  if (match && match.content) {
    return extractCodeContext(match.content, line);
  }
  return null;
}

function summarizeOpportunityTargets(resourceEvidence = []) {
  return resourceEvidence
    .map(item => item.url || item.origin || item.selector || item.nodeLabel)
    .filter(Boolean)
    .slice(0, 3)
    .join(', ');
}

function recommendationForOpportunity(opp) {
  const targets = summarizeOpportunityTargets(opp.resourceEvidence);
  const targetContext = targets ? ` Lighthouse identified: ${targets}.` : '';

  switch (opp.id) {
    case 'largest-contentful-paint-element':
      return `Inspect the identified LCP DOM node. If it is an image, verify the selected src/srcset request and its discovery, priority, and render timing; map it to source through the asset manifest or source maps.${targetContext}`;
    case 'unused-javascript':
      return `Review the listed script requests and defer, split, or remove code only after confirming it is not needed for the initial route.${targetContext}`;
    case 'unused-css-rules':
      return `Inspect the listed stylesheets for rules unused on this route; split or defer non-critical styles while preserving dynamic and above-the-fold styles.${targetContext}`;
    case 'uses-webp-images':
    case 'modern-image-formats':
      return `Serve the listed images in WebP or AVIF when supported, retain a compatible fallback, and verify the selected responsive variant.${targetContext}`;
    case 'duplicated-javascript':
      return `Use the listed script assets with a bundle/module analyzer to identify duplicate package copies, then deduplicate compatible versions.${targetContext}`;
    case 'legacy-javascript':
      return `Inspect the listed scripts and build target. Reduce unnecessary transforms only after confirming the supported browser matrix; Lighthouse has not identified a source file.${targetContext}`;
    case 'uses-rel-preconnect':
      return `Keep preconnect hints only for origins required early in this page's critical path; remove speculative origins or use dns-prefetch for secondary services.${targetContext}`;
    case 'uses-rel-preload':
    case 'preload-lcp-image':
      return `Preload only resources confirmed to be critical to the first viewport, with a URL and request mode that match the eventual request.${targetContext}`;
    default:
      return targets
        ? `Inspect the Lighthouse request evidence below and address the listed resources that contribute to this opportunity.${targetContext}`
        : `Lighthouse reported this opportunity but returned no request-level evidence. Re-run Lighthouse with its JSON report to identify affected resources before changing code.`;
  }
}

/**
 * Consolidates and groups all scanner findings to keep the report compact and clear.
 * Additionally runs the CLS Correlation Engine to map layout shifts to source coordinates.
 * 
 * @param {Array<object>} staticIssues Issues found by code inspection.
 * @param {Array<object>} lighthouseIssues Issues found by running lighthouse (optional).
 * @param {Array<object>} astElements JSX elements parsed from project files.
 * @returns {object} Categorized, prioritized, and scored recommendations.
 */
export function compileRecommendations(staticIssues, lighthouseIssues = null, astElements = [], allFiles = [], fieldInpData = null) {
  // A Lighthouse-backed report should be scoped to evidence observed on the
  // requested page. Static scans still provide source details for correlated
  // CLS/INP findings, but unrelated repository-wide patterns are not page
  // findings and should not be presented alongside that URL's results.
  const hasRuntimeAudit = Boolean(
    lighthouseIssues && (lighthouseIssues.mobile || lighthouseIssues.desktop)
  );
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
  const correlatedClsResult = correlateCls(lhClsElements, astElements, allFiles);
  
  // Track matched static issues to exclude them from standard listing
  const matchedStaticIndices = new Set();
  const correlatedIssues = [];

  // Custom Observer Fallback
  const observerCorrelatedResult = [];
  if (lighthouseIssues && Array.isArray(lighthouseIssues.customShifts)) {
    const observerElements = [];
    lighthouseIssues.customShifts.forEach(shift => {
      if (Array.isArray(shift.sources) && shift.sources.length > 0) {
        const validSources = shift.sources.filter(src => src.selector && src.selector !== 'Unknown/Removed' && src.selector !== '');
        
        if (validSources.length > 0) {
          // Select the most specific source (longest selector generally implies deepest DOM node)
          const sortedSources = [...validSources].sort((a, b) => b.selector.length - a.selector.length);
          const primarySrc = sortedSources[0];
          const relatedSources = sortedSources.slice(1).map(src => ({
            selector: src.selector,
            snippet: src.snippet,
            previousRect: src.previousRect,
            currentRect: src.currentRect,
            isDetached: src.isDetached
          }));

          observerElements.push({
            selector: primarySrc.selector,
            snippet: primarySrc.snippet,
            score: shift.value,
            time: shift.time,
            device: 'Diagnostic Observer',
            previousRect: primarySrc.previousRect,
            currentRect: primarySrc.currentRect,
            isFallback: true,
            relatedSources: relatedSources
          });
        }
      }
    });
    const tempCorrelated = correlateCls(observerElements, astElements, allFiles);
    observerCorrelatedResult.push(...tempCorrelated);
  }

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

      const targetLineNum = typeof srcLine === 'number' ? srcLine : (parseInt(srcLine, 10) || 1);
      const fallbackWhy = `Element <${item.source.tagName}> at line ${targetLineNum} was captured shifting layout on ${item.lhEl.device} (Shift Score: ${item.lhEl.score.toFixed(3)}). Unreserved element space causes surrounding content to abruptly move upon render.`;
      const fallbackFix = isImg ? {
        before: `<${item.source.tagName} src="..." />`,
        after: `<${item.source.tagName} src="..." width="800" height="450" />`,
        description: 'Provide explicit width and height or CSS aspect-ratio on this element to reserve layout space.'
      } : null;

      correlatedIssues.push({
        type: 'correlated',
        cwv: 'cls',
        severity: 'high',
        file: srcFile,
        line: srcLine,
        message,
        impact,
        suggestion,
        whyExplanation: staticDetails?.whyExplanation || fallbackWhy,
        codeContext: staticDetails?.codeContext || getFileCodeContext(srcFile, targetLineNum, allFiles),
        fixCode: staticDetails?.fixCode || fallbackFix,
        confidence: item.confidence,
        evidence: item.evidence,
        selector: item.lhEl.selector,
        device: item.lhEl.device,
        snippet: item.lhEl.snippet,
        score: item.lhEl.score,
        staticRule: staticDetails ? staticDetails.message : null,
        ambiguousSources: item.ambiguousSources
      });
    } else {
      // Unresolved or Ambiguous: Keep as runtime-only CLS issue
      let suggestionText = `Check elements matching "${item.lhEl.selector}" in your compiled layouts.`;
      if (item.lhEl.selector.includes('Global/Unknown')) {
        suggestionText = `Lighthouse trace parsing crashed natively. We have automatically launched a secondary Throttled Diagnostic Pass (emulating Slow 4G & 4x CPU slowdown) to capture the missing shifts. Please review the "Observer Fallback" entries below for the automatically extracted elements!`;
      }
      
      let severity = 'medium';
      if (item.lhEl.score >= config.thresholds.clsNeedsImprovement) severity = 'high';
      else if (item.lhEl.score < config.thresholds.cls) severity = 'low';

      correlatedIssues.push({
        type: 'lighthouse-unresolved',
        cwv: 'cls',
        severity: severity,
        file: `Runtime Audit (Lighthouse ${item.lhEl.device})`,
        line: '-',
        message: `Layout Shift on selector "${item.lhEl.selector}"`,
        impact: `Lighthouse detected this element shifting on ${item.lhEl.device} but it could not be mapped to a unique source element.`,
        suggestion: suggestionText,
        selector: item.lhEl.selector,
        device: item.lhEl.device,
        snippet: item.lhEl.snippet,
        score: item.lhEl.score,
        confidence: item.confidence,
        evidence: item.evidence,
        ambiguousSources: item.ambiguousSources
      });
    }
  });

  // Process Observer Fallback results
  observerCorrelatedResult.forEach(item => {
    let suggestion = 'Investigate this element, as it was captured shifting during an unthrottled diagnostic run.';
    let impact = `Unthrottled diagnostic observer captured a shift of ${item.lhEl.score.toFixed(4)} on "${item.lhEl.selector}".`;
    
    let severity = 'low';
    if (item.lhEl.score >= config.thresholds.clsNeedsImprovement) severity = 'high';
    else if (item.lhEl.score >= config.thresholds.cls) severity = 'medium';

    // Analyze geometry deltas
    const prev = item.lhEl.previousRect;
    const curr = item.lhEl.currentRect;
    let rectDetails = '';
    let isCollapsed = false;
    let isExpanded = false;
    let isPushed = false;

    if (prev && curr) {
      const yDelta = curr.y - prev.y;
      const xDelta = curr.x - prev.x;
      const wDelta = curr.width - prev.width;
      const hDelta = curr.height - prev.height;
      
      const movements = [];
      if (Math.abs(yDelta) > 0.1) movements.push(`Y: ${prev.y.toFixed(1)} -> ${curr.y.toFixed(1)}`);
      if (Math.abs(xDelta) > 0.1) movements.push(`X: ${prev.x.toFixed(1)} -> ${curr.x.toFixed(1)}`);
      if (Math.abs(wDelta) > 0.1) movements.push(`Width: ${prev.width.toFixed(1)} -> ${curr.width.toFixed(1)}`);
      if (Math.abs(hDelta) > 0.1) movements.push(`Height: ${prev.height.toFixed(1)} -> ${curr.height.toFixed(1)}`);
      
      if (movements.length > 0) {
        rectDetails = ` (Movement: ${movements.join(', ')})`;
      } else {
        rectDetails = ` (Movement: none / sub-pixel rounding)`;
      }

      if ((prev.width > 0 || prev.height > 0) && (curr.width === 0 && curr.height === 0)) {
        isCollapsed = true;
      } else if (prev.width === 0 && prev.height === 0 && (curr.width > 0 || curr.height > 0)) {
        isExpanded = true;
      } else if (Math.abs(yDelta) > 5 && Math.abs(wDelta) < 2 && Math.abs(hDelta) < 2) {
        isPushed = true;
      }
    }

    const hasFontClass = item.lhEl.selector.includes('.fonts-loaded') ||
                         item.lhEl.selector.includes('.wf-active') ||
                         item.lhEl.selector.includes('.font-loaded');

    let suspectedCause = null;
    if (isCollapsed) {
      suspectedCause = 'Element Removal / Collapsed to 0x0';
      suggestion = 'Element dimensions collapsed from non-zero to 0x0 (width/height became 0). This indicates DOM element removal, client-side React unmounting/hydration replacement, or "display: none" toggling rather than a font metric swap. Check client-side hydration handlers and dynamic component unmounting.';
      if (hasFontClass) {
        suggestion += ' Note: Ancestor selector contains font-loading class, but 0x0 collapse geometry indicates element removal/unmount rather than FOIT/FOUT.';
      }
    } else if (isExpanded) {
      suspectedCause = 'Late Element Insertion';
      suggestion = 'Element expanded from 0x0 to non-zero dimensions without reserved container space. Reserve layout space using CSS min-height or aspect-ratio.';
    } else if (isPushed) {
      suspectedCause = 'Pushed by Content Above';
      suggestion = 'Element moved vertically without changing its own dimensions. Investigate dynamic elements or banners inserted above this container.';
    } else if (hasFontClass && prev && curr && prev.width > 0 && curr.width > 0) {
      suspectedCause = 'Web Font Loading';
      suggestion = 'Note: The DOM path contains font-loading indicator classes (e.g. .fonts-loaded). This indicates FOIT/FOUT caused a layout shift. To fix: 1. Preload the critical web font in the <head> (<link rel="preload" as="font"...>). 2. Use "font-display: optional" or "swap" in your @font-face CSS. 3. Configure fallback font metrics (size-adjust) to match the web font width/height.';
    }

    if (suspectedCause) {
      impact += ` (Suspected Cause: ${suspectedCause})`;
    }
    impact += rectDetails;
    
    if (item.lhEl.time) {
      impact += ` [Timestamp: ${item.lhEl.time.toFixed(1)}ms]`;
    }

    if (item.confidence !== 'UNRESOLVED' && item.confidence !== 'AMBIGUOUS' && item.source) {
      const srcFile = item.source.filePath;
      const isParent = Boolean(item.source.isParentContainer);
      const isSingle = Boolean(item.source.isSingleLine);
      
      // When target is a child inside a parent container, target element source line is unknown!
      // Report the candidate parent container line separately, and set target line to null so we don't
      // falsely label the parent container line as the exact offending line of the child.
      const srcLine = isParent || isSingle ? null : item.source.line;
      const srcCol = isParent || isSingle ? null : item.source.column;
      const containerLine = isSingle ? null : (item.source.containerLine || item.source.line);
      const containerCol = isSingle ? null : (item.source.containerColumn || item.source.column);
      const shortFile = path.basename(srcFile);

      let message = `[Observer Fallback] Shift associated with <${item.source.tagName}> in ${shortFile}`;
      if (item.source.isParentContainer) {
        const containerLabel = `<${item.source.containerTag || 'container'}${item.source.containerId ? '#' + item.source.containerId : ''}>`;
        message = `[Observer Fallback] Shift on "${item.source.targetSelector || item.source.targetTag || 'element'}" (inside ${containerLabel} in ${shortFile})`;
      }

      // Parent container fallback must not report EXACT confidence
      const effectiveConfidence = (item.source.isParentContainer && item.confidence === 'EXACT') ? 'PROBABLE' : item.confidence;

      const obsTargetLine = typeof srcLine === 'number' ? srcLine : (typeof containerLine === 'number' ? containerLine : 1);
      correlatedIssues.push({
        type: 'observer-fallback-correlated',
        cwv: 'cls',
        severity: severity,
        file: srcFile,
        line: srcLine,
        column: srcCol,
        containerLine,
        containerColumn: containerCol,
        containerTag: item.source.containerTag,
        containerId: item.source.containerId,
        isParentContainer: isParent,
        isSingleLine: isSingle,
        message: message,
        impact: impact,
        suggestion: suggestion + ' While the selector matched a source element, verify that this is the actual cause of the Lighthouse shift.',
        whyExplanation: `Diagnostic observer captured a layout shift of ${item.lhEl.score.toFixed(4)} on "${item.lhEl.selector}". The element's bounding geometry moved during runtime without pre-allocated container boundaries.`,
        codeContext: getFileCodeContext(srcFile, obsTargetLine, allFiles),
        fixCode: {
          before: `<${item.source.tagName || 'div'} className="..." />`,
          after: `<${item.source.tagName || 'div'} style={{ minHeight: '...' }} />`,
          description: 'Reserve layout space with min-height or aspect-ratio on this element or its parent container.'
        },
        confidence: effectiveConfidence,
        evidence: item.evidence,
        selector: item.lhEl.selector,
        device: item.lhEl.device,
        snippet: item.lhEl.snippet,
        score: item.lhEl.score,
        previousRect: item.lhEl.previousRect,
        currentRect: item.lhEl.currentRect,
        ambiguousSources: item.ambiguousSources,
        relatedSources: item.lhEl.relatedSources,
        relatedCss: item.source.relatedCss || []
      });
    } else {
      correlatedIssues.push({
        type: 'observer-fallback-unresolved',
        cwv: 'cls',
        severity: severity,
        file: `Diagnostic Run (${item.lhEl.device})`,
        line: '-',
        message: `[Observer Fallback] Shift on "${item.lhEl.selector}"`,
        impact: impact,
        suggestion: suggestion,
        selector: item.lhEl.selector,
        device: item.lhEl.device,
        snippet: item.lhEl.snippet,
        score: item.lhEl.score,
        confidence: item.confidence,
        evidence: item.evidence,
        previousRect: item.lhEl.previousRect,
        currentRect: item.lhEl.currentRect,
        ambiguousSources: item.ambiguousSources,
        relatedSources: item.lhEl.relatedSources
      });
    }
  });

  // --- BEGIN CLS MERGE LOGIC ---
  const clsLhValid = correlatedIssues.filter(i => 
    (i.type === 'correlated' || i.type === 'lighthouse-unresolved') && !i.selector.includes('Global/Unknown')
  );
  
  const clsLhDummies = correlatedIssues.filter(i => 
    i.type === 'lighthouse-unresolved' && i.selector.includes('Global/Unknown')
  );
  
  const clsObsCorrelated = correlatedIssues.filter(i => 
    i.type === 'observer-fallback-correlated'
  );
  
  const clsObsUnresolved = correlatedIssues.filter(i => 
    i.type === 'observer-fallback-unresolved'
  );
  
  // Deduplicate observer correlated against valid lighthouse AND within itself
  const seenObsCorrelated = new Map();
  clsObsCorrelated.forEach(obs => {
    const isDuplicateLh = clsLhValid.some(lh => {
      // 1. file + line exact match (excluding runtime generic files)
      const hasValidFile = lh.file && lh.file !== 'Runtime Audit (Lighthouse Mobile)' && lh.file !== 'Runtime Audit (Lighthouse Desktop)' && !lh.file.includes('Diagnostic Run');
      if (hasValidFile && lh.file === obs.file && lh.line === obs.line) {
        return true;
      }
      // 2. Exact selector + file match
      if (hasValidFile && lh.selector === obs.selector && lh.file === obs.file) {
        return true;
      }
      // 3. Exact selector match as fallback
      if (lh.selector === obs.selector) {
        return true;
      }
      return false;
    });

    if (!isDuplicateLh) {
      // Deduplicate within observer fallback shifts pointing to same source
      const key = `${obs.file}:${obs.line !== null ? obs.line : (obs.containerLine ? 'container:' + obs.containerLine + ':' + obs.selector : obs.selector)}`;
      if (seenObsCorrelated.has(key)) {
        const existing = seenObsCorrelated.get(key);
        existing.score = (existing.score || 0) + (obs.score || 0);
        if (existing.score >= config.thresholds.clsNeedsImprovement) existing.severity = 'high';
        else if (existing.score >= config.thresholds.cls) existing.severity = 'medium';
        else existing.severity = 'low';
        
        // Upgrade confidence if the newer match is stronger (do not upgrade parent container matches to EXACT)
        if (obs.confidence === 'EXACT' && !obs.source?.isParentContainer) existing.confidence = 'EXACT';
        else if (obs.confidence === 'PROBABLE' && existing.confidence !== 'EXACT') existing.confidence = 'PROBABLE';
      } else {
        seenObsCorrelated.set(key, { ...obs });
      }
    }
  });
  const uniqueObsCorrelated = Array.from(seenObsCorrelated.values());

  // Deduplicate observer unresolved
  const seenObsUnresolved = new Map();
  clsObsUnresolved.forEach(obs => {
     const isDuplicateLh = clsLhValid.some(lh => lh.selector === obs.selector);
     if (!isDuplicateLh) {
       const key = obs.selector;
       if (seenObsUnresolved.has(key)) {
         const existing = seenObsUnresolved.get(key);
         existing.score = (existing.score || 0) + (obs.score || 0);
         if (existing.score >= config.thresholds.clsNeedsImprovement) existing.severity = 'high';
         else if (existing.score >= config.thresholds.cls) existing.severity = 'medium';
         else existing.severity = 'low';
       } else {
         seenObsUnresolved.set(key, { ...obs });
       }
     }
  });
  const uniqueObsUnresolved = Array.from(seenObsUnresolved.values());

  // Rebuild the correlatedIssues array for CLS
  correlatedIssues.length = 0;
  
  // 1. Valid Lighthouse (always keep)
  correlatedIssues.push(...clsLhValid);
  
  // 2. Unique Observer Correlated (always keep)
  correlatedIssues.push(...uniqueObsCorrelated);
  
  // 3. Observer Unresolved (always keep)
  correlatedIssues.push(...uniqueObsUnresolved);
  
  // 4. Dummies (only keep if no useful observer correlation or valid lighthouse findings exist)
  if (clsLhDummies.length > 0) {
    if (uniqueObsCorrelated.length === 0 && clsLhValid.length === 0) {
      correlatedIssues.push(...clsLhDummies);
    }
  }
  // --- END CLS MERGE LOGIC ---

  // Filter staticIssues to remove combined ones
  const cleanStaticIssues = staticIssues.filter((_, idx) => !matchedStaticIndices.has(idx));

  // Extract runtime INP interactions
  const mobileInps = (lighthouseIssues?.mobile?.inpInteractions || []).map(item => ({ ...item, device: 'Mobile', score: item.score || lighthouseIssues?.mobile?.inp?.value || 0 }));
  const desktopInps = (lighthouseIssues?.desktop?.inpInteractions || []).map(item => ({ ...item, device: 'Desktop', score: item.score || lighthouseIssues?.desktop?.inp?.value || 0 }));
  const runtimeInps = [...mobileInps, ...desktopInps];
  const hasRuntimeInpEvidence = runtimeInps.length > 0;

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
    if (ri.score <= config.thresholds.inp) return; // Do not correlate if INP is within the configured Good limit

    // Classify impact bucket
    const inpImpact = ri.score > config.thresholds.inpNeedsImprovement ? 'Poor' : 'Needs Improvement';

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
      } else if (ri.score > config.thresholds.inp) {
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
        whyExplanation: primaryCandidate.issue.whyExplanation || `Event handler "${handlerName}" at line ${finalLineNum} contributes to ${ri.score}ms INP delay during ${dominantPhase}. Long-running tasks on the main thread prevent the browser from presenting the next frame promptly.`,
        codeContext: primaryCandidate.issue.codeContext || getFileCodeContext(primaryCandidate.issue.file, finalLineNum, allFiles),
        fixCode: primaryCandidate.issue.fixCode || null,
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

  // Correlate elevated field INP observations (e.g. from CrUX API or PSI)
  // When real users experience elevated INP (>200ms), correlate this evidence directly with
  // the codebase's interactive event handlers and layout calculations so developers get
  // actionable WHERE, WHY, WHAT, and CODE recommendations.
  const elevatedFieldInps = (fieldInpData?.observations || [])
    .filter(item => Number.isFinite(Number(item.value)) && Number(item.value) > config.thresholds.inp);

  if (elevatedFieldInps.length > 0 && aggregatedInps.length === 0) {
    const primaryField = elevatedFieldInps[0];
    const fieldVal = Number(primaryField.value);
    const fieldSev = fieldVal > config.thresholds.inpNeedsImprovement ? 'high' : 'medium';
    const fieldSrc = primaryField.source || 'CrUX field data';
    const fieldScope = primaryField.scope || 'reported page or origin';
    const fieldDevice = primaryField.device || 'Mobile';

    // Prioritize static INP candidates in the codebase:
    // 1. Direct interactive handlers (onClick, onChange, onSubmit, etc.) with state updates, fetch, or heavy computation
    // 2. Forced synchronous layout / Layout Thrashing (reflow)
    // 3. Large un-memoized list renders / render loops
    // 4. Other INP issues (context providers, heavy dependencies)
    const inpCandidates = [];
    cleanStaticIssues.forEach((issue, idx) => {
      if (issue.cwv !== 'inp' || matchedInpStaticIndices.has(idx)) return;
      let weight = 0;
      if (issue.handler || issue.operation === 'react-rendering' || issue.operation === 'fetch' || issue.operation === 'computation' || issue.operation === 'async') {
        weight = 10;
      } else if (issue.operation === 'reflow' || issue.message?.includes('Layout Thrashing')) {
        weight = 9;
      } else if (issue.operation === 'react-memo' || issue.message?.includes('list layout render')) {
        weight = 8;
      } else if (issue.type === 'dependency') {
        weight = 6;
      } else {
        weight = 5;
      }
      inpCandidates.push({ issue, idx, weight });
    });

    inpCandidates.sort((a, b) => b.weight - a.weight);

    inpCandidates.forEach(({ issue, idx }, candIndex) => {
      matchedInpStaticIndices.add(idx);
      const shortFile = path.basename(issue.file);
      const lineNum = issue.line && issue.line !== '-' ? issue.line : 1;
      const handlerName = issue.handler || (issue.message?.includes('onClick') ? 'onClick' : issue.message?.includes('onChange') ? 'onChange' : 'interaction');

      const correlationState = 'STRONG';
      const confidence = 'HIGH';

      let whyReason = issue.whyExplanation;
      if (!whyReason) {
        if (issue.operation === 'reflow') {
          whyReason = `Line ${lineNum} triggers layout thrashing by reading geometric properties right after DOM mutations. Synchronous layout recalculation freezes the browser frame, contributing to the ${Math.round(fieldVal)}ms real-user INP delay.`;
        } else if (issue.operation === 'react-memo') {
          whyReason = `At line ${lineNum}, an un-memoized component maps over a collection. When user interaction triggers state changes, every item re-renders synchronously, delaying the next frame (CrUX p75 INP: ${Math.round(fieldVal)}ms).`;
        } else if (issue.type === 'dependency') {
          whyReason = `Package "${issue.name || 'dependency'}" adds heavy main-thread JavaScript execution during initialization and event handling, directly inflating interaction response times.`;
        } else {
          whyReason = `Event handler "${handlerName}" at line ${lineNum} performs synchronous operations that block the main thread. This prevents the browser from presenting the next frame within the 200ms Core Web Vitals threshold (real users experience ${Math.round(fieldVal)}ms p75 INP in CrUX).`;
        }
      }

      let fixCode = issue.fixCode;
      if (!fixCode) {
        if (issue.handler || issue.message?.includes('handler')) {
          fixCode = {
            before: `const ${issue.handlerFunction || 'handleAction'} = (e) => {\n  // Synchronous state updates or heavy processing\n  setData(e.target.value);\n};`,
            after: `const [isPending, startTransition] = useTransition();\nconst ${issue.handlerFunction || 'handleAction'} = (e) => {\n  startTransition(() => {\n    setData(e.target.value);\n  });\n};`,
            description: 'Wrap non-urgent state updates inside startTransition() to let the browser immediately paint input feedback.'
          };
        } else if (issue.type === 'dependency') {
          fixCode = {
            before: `"${issue.name}": "${issue.version}"`,
            after: `// Replace with lightweight tree-shakeable alternative\n// or import specific submodules instead of the full library`,
            description: `Replace heavy dependency "${issue.name}" with a lightweight modern alternative.`
          };
        }
      }

      const codeCtx = issue.codeContext || getFileCodeContext(issue.file, lineNum, allFiles);
      const candidateScore = fieldVal - (candIndex * 0.1);

      processedInpIssues.push({
        type: 'correlated',
        cwv: 'inp',
        severity: fieldSev,
        file: issue.file,
        line: lineNum,
        message: issue.message,
        impact: `Real-user ${fieldSrc} reports elevated INP of ${Math.round(fieldVal)}ms (p75) for ${fieldScope}. In this codebase, ${issue.message.toLowerCase()} directly blocks the JavaScript main thread, delaying user interaction responsiveness.`,
        suggestion: issue.suggestion,
        whyExplanation: whyReason,
        codeContext: codeCtx,
        fixCode,
        confidence,
        correlationState,
        evidence: [
          `CrUX field data: ${Math.round(fieldVal)}ms p75 INP (${fieldSrc})`,
          `Interactive event handler/code identified at ${shortFile}:${lineNum}`,
          issue.operation ? `Identified bottleneck: ${issue.operation}` : 'Main-thread execution delaying frame presentation'
        ],
        confidenceExplanation: `Signals: ✓ Real-user CrUX field data confirms elevated INP (${Math.round(fieldVal)}ms p75); ✓ AST analysis pinpointed exact event handler and blocking source line.`,
        selector: issue.selector || null,
        device: fieldDevice,
        score: candidateScore,
        inpImpact: fieldVal > config.thresholds.inpNeedsImprovement ? 'Poor' : 'Needs Improvement',
        handler: issue.handler || null,
        handlerFunction: issue.handlerFunction || null,
        operation: issue.operation || null
      });
    });

    // If static analysis had zero INP issues, check AST elements for candidate interactive elements
    if (inpCandidates.length === 0 && Array.isArray(astElements) && astElements.length > 0) {
      const interactiveAstElements = astElements.filter(el => {
        if (!el || !Array.isArray(el.attributes)) return false;
        return el.attributes.some(attr => 
          ['onClick', 'onChange', 'onKeyDown', 'onSubmit'].includes(attr.name)
        );
      });

      if (interactiveAstElements.length > 0) {
        const primaryEl = interactiveAstElements[0];
        const attr = primaryEl.attributes.find(a => ['onClick', 'onChange', 'onKeyDown', 'onSubmit'].includes(a.name));
        const handlerName = attr ? attr.name : 'onClick';
        const lineNum = primaryEl.line || 1;
        const shortFile = path.basename(primaryEl.filePath);

        const codeCtx = getFileCodeContext(primaryEl.filePath, lineNum, allFiles);
        const fixCode = {
          before: `const handleAction = () => {\n  // synchronous state setter\n  setData(result);\n};`,
          after: `const [isPending, startTransition] = useTransition();\nconst handleAction = () => {\n  startTransition(() => {\n    setData(result);\n  });\n};`,
          description: 'Wrap interactive state transitions in startTransition to prevent main thread blocking.'
        };

        processedInpIssues.push({
          type: 'correlated',
          cwv: 'inp',
          severity: fieldSev,
          file: primaryEl.filePath,
          line: lineNum,
          message: `Elevated field INP (${Math.round(fieldVal)}ms p75) — optimize interactive handler "${handlerName}" in <${primaryEl.tagName || 'element'}>`,
          impact: `Real-user ${fieldSrc} reports elevated INP of ${Math.round(fieldVal)}ms (p75) for ${fieldScope}. The interactive element <${primaryEl.tagName || 'element'}> at ${shortFile}:${lineNum} handles user interactions and should be optimized with transition wrappers.`,
          suggestion: 'Ensure all state updates inside this handler are wrapped in startTransition() or debounced to keep the main thread responsive.',
          whyExplanation: `Real-user field data confirms elevated INP (${Math.round(fieldVal)}ms). User clicks and taps on <${primaryEl.tagName || 'element'}> at line ${lineNum} trigger synchronous state updates or re-renders that delay the next frame paint.`,
          codeContext: codeCtx,
          fixCode,
          confidence: 'HIGH',
          correlationState: 'STRONG',
          evidence: [
            `${fieldSrc}: ${Math.round(fieldVal)}ms p75 INP (${fieldScope})`,
            `Interactive element <${primaryEl.tagName || 'element'}> with "${handlerName}" identified at ${shortFile}:${lineNum}`
          ],
          confidenceExplanation: `Signals: ✓ Real-user CrUX field data confirms elevated INP (${Math.round(fieldVal)}ms p75); ✓ AST analysis pinpointed candidate interaction handler at line ${lineNum}.`,
          selector: null,
          device: fieldDevice,
          score: fieldVal,
          inpImpact: fieldVal > config.thresholds.inpNeedsImprovement ? 'Poor' : 'Needs Improvement',
          handler: handlerName
        });
      }
    }
  }

  // Create general CrUX field observation card
  const fieldInpIssues = (fieldInpData?.observations || [])
    .filter(item => Number.isFinite(Number(item.value)) && Number(item.value) > config.thresholds.inp)
    .map(item => {
      const value = Number(item.value);
      const severity = value > config.thresholds.inpNeedsImprovement ? 'high' : 'medium';
      const source = item.source || 'CrUX field data';
      const scope = item.scope || 'reported page or origin';
      // When actionable code issues exist, set score to 0 so the exact code issue is ranked #01!
      const score = processedInpIssues.length > 0 ? 0 : value;
      return {
        type: 'field',
        cwv: 'inp',
        severity,
        file: 'Runtime Audit (CrUX Field Data)',
        line: '-',
        message: `Elevated field INP (${Math.round(value)}ms p75)`,
        impact: `${source} reports p75 INP of ${Math.round(value)}ms for ${scope} over its field-data collection period. This is above the 200ms good threshold.`,
        suggestion: 'Use real-user INP attribution or a configured interaction test to identify the slow selector and dominant phase, then optimize the measured handler or rendering work. Static INP findings below may provide source-level leads, but are not proven causes of this field result.',
        whyExplanation: 'This value comes from real-user field data, not a Lighthouse page-load simulation. Field INP establishes that users experience slow interactions, but does not identify which interaction or source function caused them.',
        confidence: 'UNRESOLVED',
        correlationState: 'UNRESOLVED',
        evidence: [
          `Source: ${source}`,
          `p75 INP: ${Math.round(value)}ms`,
          `Scope: ${scope}`,
          'Field data does not include the event-level source location needed to attribute this value to a local handler.'
        ],
        confidenceExplanation: 'Field metric confirms slow real-user responsiveness; no event-level source attribution is available.',
        selector: null,
        device: item.device || null,
        score,
        inpImpact: value > config.thresholds.inpNeedsImprovement ? 'Poor' : 'Needs Improvement'
      };
    });

  // Keep static-only findings for repository audits; URL-backed runs surface
  // runtime findings and attached static evidence. Lighthouse does not replay
  // user interactions in a normal page audit, so preserve static INP findings
  // as explicitly low-confidence when it returned no interaction rows.
  const remainingStaticIssues = cleanStaticIssues.filter((issue, idx) => {
    if (hasRuntimeAudit) {
      if (issue.cwv === 'inp' && !hasRuntimeInpEvidence) return !matchedInpStaticIndices.has(idx);
      return false;
    }
    if (issue.cwv === 'inp') {
      return !matchedInpStaticIndices.has(idx);
    }
    return true;
  }).map(issue => {
    if (issue.cwv === 'inp') {
      const runtimeNote = hasRuntimeAudit && !hasRuntimeInpEvidence
        ? 'Static code pattern scanned; the Lighthouse page audit did not capture interaction-level INP evidence.'
        : 'Static code pattern scanned without runtime interaction measurement.';
      return {
        ...issue,
        severity: 'low',
        confidence: 'LOW',
        correlationState: 'STATIC_ONLY',
        evidence: [runtimeNote],
        confidenceExplanation: 'Signals: ✗ No corresponding runtime interaction evidence was available',
        impact: `Static Evidence: ${issue.impact} [Static Only - No runtime INP correlation established]`
      };
    }
    if (issue.cwv === 'cls') {
      const isLhRun = !!lighthouseIssues;
      const mobileCls = Number(lighthouseIssues?.mobile?.cls?.value ?? 0);
      const desktopCls = Number(lighthouseIssues?.desktop?.cls?.value ?? 0);
      const maxCls = Math.max(mobileCls, desktopCls);
      const isRuntimeClean = isLhRun && maxCls < config.thresholds.cls;

      return {
        ...issue,
        severity: isRuntimeClean ? 'low' : (issue.severity || 'medium'),
        confidence: 'LOW',
        correlationState: 'STATIC_ONLY',
        evidence: isLhRun
          ? [`Static code pattern scanned; no runtime layout shift detected for this element (Runtime CLS: ${maxCls.toFixed(3)}).`]
          : ['Static code pattern scanned without runtime measurement.'],
        confidenceExplanation: 'Signals: ✗ No corresponding runtime layout shift registered',
        impact: `Static Opportunity: ${issue.impact} [Static Only - No runtime layout shift observed]`
      };
    }
    return issue;
  });

  // Build final consolidated issues list
  const allIssues = [...remainingStaticIssues, ...processedInpIssues, ...fieldInpIssues, ...correlatedIssues];

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

        const suggestion = recommendationForOpportunity(opp);
        const resourceEvidence = (opp.resourceEvidence || []).map(item => ({
          ...item,
          device: modeLabel
        }));
        const savings = [];
        if (Number.isFinite(opp.overallSavingsBytes) && opp.overallSavingsBytes > 0) {
          savings.push(`estimated ${Math.round(opp.overallSavingsBytes / 1024)} KiB potential byte savings`);
        }
        if (Number.isFinite(opp.overallSavingsMs) && opp.overallSavingsMs > 0) {
          savings.push(`estimated ${Math.round(opp.overallSavingsMs)} ms potential time savings`);
        }
        const evidenceSummary = resourceEvidence.length
          ? `${resourceEvidence.length} Lighthouse request row(s) captured for ${modeLabel}.`
          : `No request-level rows were returned by Lighthouse for ${modeLabel}.`;

        allIssues.push({
          type: 'lighthouse',
          file: `Runtime Audit (Lighthouse ${modeLabel})`,
          line: '-',
          cwv,
          device: modeLabel,
          severity: opp.score < 50 ? 'high' : 'medium',
          message: `${opp.title}${opp.displayValue ? ` (${opp.displayValue})` : ''}`,
          impact: [opp.description, savings.length ? `Lighthouse estimate: ${savings.join(' and ')}.` : '', evidenceSummary]
            .filter(Boolean)
            .join(' '),
          suggestion,
          evidence: resourceEvidence.map(item => [item.device, item.url || item.origin, item.resourceType, item.wastedBytes ? `${item.wastedBytes} wasted bytes` : '', item.wastedMs ? `${item.wastedMs} ms` : ''].filter(Boolean).join(': ')),
          resourceEvidence,
          evidenceCount: opp.evidenceCount || resourceEvidence.length,
          evidenceTruncated: Boolean(opp.evidenceTruncated),
          auditId: opp.id,
          auditDetailsType: opp.detailsType || null,
          overallSavingsMs: opp.overallSavingsMs ?? null,
          overallSavingsBytes: opp.overallSavingsBytes ?? null
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
        column: issue.column || null,
        whyExplanation: issue.whyExplanation || null,
        codeContext: issue.codeContext || null,
        fixCode: issue.fixCode || null,
        handler: issue.handler || null,
        handlerFunction: issue.handlerFunction || null,
        operation: issue.operation || null,
        source: issue.source || null,
        containerLine: issue.containerLine || null,
        containerColumn: issue.containerColumn || null,
        containerTag: issue.containerTag || null,
        containerId: issue.containerId || null,
        isParentContainer: Boolean(issue.isParentContainer),
        isSingleLine: Boolean(issue.isSingleLine),
        previousRect: issue.previousRect || null,
        currentRect: issue.currentRect || null,
        relatedCss: issue.relatedCss || [],
        confidence: issue.confidence || null,
        correlationState: issue.correlationState || null,
        confidenceExplanation: issue.confidenceExplanation || null,
        evidence: issue.evidence || null,
        devices: issue.device ? [issue.device] : [],
        selector: issue.selector || null,
        device: issue.device || null,
        snippet: issue.snippet || null,
        score: issue.score || null,
        staticRule: issue.staticRule || null,
        inpImpact: issue.inpImpact || null,
        callChain: issue.callChain || null,
        callChainString: issue.callChainString || null,
        relatedSources: issue.relatedSources || [],
        resourceEvidence: issue.resourceEvidence || [],
        evidenceCount: issue.evidenceCount || (issue.resourceEvidence || []).length,
        evidenceTruncated: Boolean(issue.evidenceTruncated),
        auditId: issue.auditId || null,
        auditDetailsType: issue.auditDetailsType || null,
        overallSavingsMs: issue.overallSavingsMs ?? null,
        overallSavingsBytes: issue.overallSavingsBytes ?? null,
        occurrences: []
      };
    } else {
      if (!grouped[key].codeContext && issue.codeContext) {
        grouped[key].codeContext = issue.codeContext;
      }
      if (!grouped[key].fixCode && issue.fixCode) {
        grouped[key].fixCode = issue.fixCode;
      }
      if (!grouped[key].whyExplanation && issue.whyExplanation) {
        grouped[key].whyExplanation = issue.whyExplanation;
      }
    }
    if (issue.type === 'lighthouse') {
      if (issue.device && !grouped[key].devices.includes(issue.device)) {
        grouped[key].devices.push(issue.device);
      }
      if (grouped[key].devices.length > 1) grouped[key].device = null;
      const currentEvidence = grouped[key].resourceEvidence;
      const knownEvidence = new Set(currentEvidence.map(item => `${item.device || ''}|${item.url || item.origin || ''}|${item.resourceType || ''}`));
      (issue.resourceEvidence || []).forEach(item => {
        const evidenceKey = `${item.device || ''}|${item.url || item.origin || ''}|${item.resourceType || ''}`;
        if (!knownEvidence.has(evidenceKey)) {
          knownEvidence.add(evidenceKey);
          currentEvidence.push(item);
        }
      });
      grouped[key].evidenceCount = Math.max(grouped[key].evidenceCount, issue.evidenceCount || 0);
      grouped[key].evidenceTruncated = grouped[key].evidenceTruncated || Boolean(issue.evidenceTruncated);
      const allEvidenceText = [...(grouped[key].evidence || []), ...(issue.evidence || [])];
      grouped[key].evidence = [...new Set(allEvidenceText)];
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

    if (group.type !== 'correlated' && group.type !== 'lighthouse-unresolved' && group.type !== 'lighthouse') {
      if (uniqueOccurrences.length === 1) {
        group.file = uniqueOccurrences[0].file;
        group.line = uniqueOccurrences[0].line;
      } else {
        group.file = `${uniqueOccurrences.length} files affected`;
        group.line = '-';
        if (!group.codeContext && uniqueOccurrences[0]?.file) {
          group.codeContext = getFileCodeContext(uniqueOccurrences[0].file, uniqueOccurrences[0].line, allFiles);
        }
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
