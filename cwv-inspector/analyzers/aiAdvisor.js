import { categorizeCopilotError } from '../services/copilotService.js';

/**
 * AI Advisor Module for Core Web Vitals
 *
 * Consumes existing deterministic findings from compiledResult and uses
 * GitHub Copilot to produce contextual explanations, root-cause analyses,
 * and actionable recommendations without re-running Lighthouse or AST scans.
 */

/**
 * Filters and ranks the highest-priority actionable issues from an audit result,
 * prioritizing Core Web Vitals (CLS, LCP, INP) and HIGH/MEDIUM severities.
 *
 * @param {Array<object>} issues - The array of issues from compiledResult.
 * @param {number|object} [maxCount=20] - Maximum number of issues to return (or options object).
 * @param {object} [options] - Optional settings (severities: ['high', 'medium']).
 * @returns {Array<object>}
 */
export function selectPriorityIssues(issues = [], maxCount = 20, options = {}) {
  if (!Array.isArray(issues)) return [];

  if (typeof maxCount === 'object' && maxCount !== null) {
    options = maxCount;
    maxCount = options.maxCount || 20;
  }

  const cwvWeights = { cls: 3, inp: 3, lcp: 2 };
  const severityWeights = { high: 3, medium: 2, low: 1 };
  const correlationWeights = { EXACT: 4, PROBABLE: 3, PARTIAL: 2, STATIC_ONLY: 1, UNRESOLVED: 1 };

  const allowedSeverities = options.severities
    ? new Set(options.severities.map(s => String(s).toLowerCase()))
    : null;

  return [...issues]
    .filter(issue => {
      if (!issue || typeof issue !== 'object' || !issue.message) return false;
      if (allowedSeverities) {
        const sev = String(issue.severity || 'medium').toLowerCase();
        if (!allowedSeverities.has(sev)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      // Prioritize verified runtime/correlated issues over unconfirmed static-only code scans
      const corrA = correlationWeights[a.correlationState] || (a.type === 'correlated' ? 3 : (a.correlationState === 'STATIC_ONLY' ? 1 : 2));
      const corrB = correlationWeights[b.correlationState] || (b.type === 'correlated' ? 3 : (b.correlationState === 'STATIC_ONLY' ? 1 : 2));
      if (corrB !== corrA) return corrB - corrA;

      const cwvA = cwvWeights[String(a.cwv).toLowerCase()] || 0;
      const cwvB = cwvWeights[String(b.cwv).toLowerCase()] || 0;
      if (cwvB !== cwvA) return cwvB - cwvA;

      const sevA = severityWeights[String(a.severity).toLowerCase()] || 0;
      const sevB = severityWeights[String(b.severity).toLowerCase()] || 0;
      if (sevB !== sevA) return sevB - sevA;

      const scoreA = Number(a.score) || 0;
      const scoreB = Number(b.score) || 0;
      return scoreB - scoreA;
    })
    .slice(0, maxCount);
}

/**
 * Builds a strictly bounded prompt for Copilot containing only verified audit evidence.
 * Explicitly instructs the model not to invent file paths, lines, or DOM selectors.
 *
 * @param {object} issue - An individual issue finding.
 * @param {object} [context] - Additional optional project metadata (clientName, url).
 * @returns {string} Prompt text.
 */
export function buildAdvisorPrompt(issue, context = {}) {
  const cwvMetric = (issue.cwv || 'General Performance').toUpperCase();
  const severity = (issue.severity || 'medium').toUpperCase();
  const findingType = issue.type || 'code';
  const file = issue.file || 'Unknown file';
  const line = issue.line !== undefined && issue.line !== null ? issue.line : '-';

  // Format evidence points
  let evidenceText = 'None recorded';
  if (Array.isArray(issue.evidence) && issue.evidence.length > 0) {
    evidenceText = issue.evidence.join('; ');
  } else if (issue.evidence && typeof issue.evidence === 'string') {
    evidenceText = issue.evidence;
  }

  // Format affected occurrences
  let occurrencesText = 'Single location';
  if (Array.isArray(issue.occurrences) && issue.occurrences.length > 1) {
    occurrencesText = issue.occurrences
      .slice(0, 5)
      .map(o => `${o.file}:${o.line}`)
      .join(', ') + (issue.occurrences.length > 5 ? ` (+${issue.occurrences.length - 5} more)` : '');
  }

  // Geometry details and collapse diagnosis
  let geometryText = '';
  let geometryCaveat = '';
  if (issue.previousRect && issue.currentRect) {
    const prev = issue.previousRect;
    const curr = issue.currentRect;
    geometryText = `\n- Observed Geometry Before: X=${prev.x.toFixed(1)}, Y=${prev.y.toFixed(1)}, Width=${prev.width.toFixed(1)}, Height=${prev.height.toFixed(1)}` +
                   `\n- Observed Geometry After:  X=${curr.x.toFixed(1)}, Y=${curr.y.toFixed(1)}, Width=${curr.width.toFixed(1)}, Height=${curr.height.toFixed(1)}`;
    if ((prev.width > 0 || prev.height > 0) && (curr.width === 0 && curr.height === 0)) {
      geometryCaveat = `\nCRITICAL GEOMETRY NOTE: The element collapsed to 0x0 dimensions (width: ${prev.width.toFixed(1)} -> 0, height: ${prev.height.toFixed(1)} -> 0). Do NOT hypothesize web font loading simply because ".fonts-loaded" is in the selector. Font swaps adjust text metrics by a few pixels; they NEVER collapse elements to 0x0. Focus on client-side React unmounting/hydration replacement, dynamic DOM node removal, or "display: none" toggling.`;
    }
  }

  let attributionCaveat = '';
  if (issue.source?.isParentContainer || issue.isParentContainer) {
    const containerTag = issue.containerTag || issue.source?.containerTag || 'container';
    const containerId = issue.containerId || issue.source?.containerId;
    const containerLine = issue.containerLine || issue.source?.containerLine || 'unknown';
    const containerCol = issue.containerColumn || issue.source?.containerColumn;
    attributionCaveat = `\nATTRIBUTION NOTE: The target shifting element was not found directly in AST or unbuilt templates due to dynamically generated bundler classes. The candidate source match (${file}) refers to a candidate parent container (<${containerTag}${containerId ? '#' + containerId : ''}>) located at line ${containerLine}${containerCol ? ':' + containerCol : ''}. The target child element's exact line is UNKNOWN and unresolvable without build source maps. Ground your advice on this uncertainty. DO NOT claim the parent container declaration line is the exact offending line.`;
  }

  return `You are an expert Core Web Vitals AI Advisor. Analyze the following verified finding from an automated performance inspection and provide technical guidance.

AUDIT FINDING DETAILS:
- Metric: ${cwvMetric}
- Severity: ${severity}
- Finding Title: ${issue.message}
- Deterministic Impact: ${issue.impact || 'N/A'}
- Deterministic Suggestion: ${issue.suggestion || 'N/A'}
- Classification Type: ${findingType}
- Primary Source Location: ${file}:${line}
- Affected Locations: ${occurrencesText}
- DOM Selector: ${issue.selector || 'None / Not a DOM shift'}
- HTML Snippet: ${issue.snippet || 'None'}
- Shift / Latency Score: ${issue.score !== undefined && issue.score !== null ? issue.score : 'N/A'}
- Correlation Confidence: ${issue.confidence || 'STATIC_ONLY'}
- Correlation State: ${issue.correlationState || 'N/A'}
- Supporting Evidence: ${evidenceText}${geometryText}${issue.time ? `\n- Event Timestamp: ${issue.time.toFixed(1)}ms` : ''}${issue.inpPhase ? `\n- Dominant INP Phase: ${issue.inpPhase}` : ''}${issue.callChainString ? `\n- Traced Call Chain: ${issue.callChainString}` : ''}${context.url ? `\n- Target URL: ${context.url}` : ''}${geometryCaveat}${attributionCaveat}

STRICT INSTRUCTIONS:
1. Base explanation and recommendation ONLY on verified facts above. DO NOT invent, assume, or hallucinate file paths, line numbers, or DOM element selectors not present in the finding.
2. Distinguish verified authoritative findings from diagnostic fallbacks or static-only rules. State limitations if evidence is incomplete. Propose safe, non-destructive code edits only.
3. Response MUST be valid JSON conforming strictly to the schema below. Do not wrap in markdown or include conversational text.
4. THREE-QUESTION STRUCTURE (MANDATORY & TOKEN-EFFICIENT):
   - "rootCause": 1-2 dense technical sentences on the browser layout/runtime mechanism causing regression.
   - "recommendations": 1-2 minimal, direct actionable code steps applied directly to existing elements without extra wrapper nodes.
   - "whyItHelps": 1-2 sentences explaining why this specific solution works and why alternative workarounds (dummy spacers, extra wrappers, premature memoization) fail or bloat DOM depth.
5. TOKEN ECONOMY & DOM INTEGRITY:
   - Maximum brevity: keep explanations dense (1-2 sentences each). No filler or repetition.
   - NEVER suggest dummy wrapper <div>s ("DIV soup") or ternary fallback empty spacer divs. Reserve dimensions in CSS on existing elements or use semantic skeleton.
   - NEVER suggest wrapping presentation cards in React.memo/useMemo/useCallback or adding startTransition without proven lag. Respect framework primitives (<ResponsiveImage>, <Image>).

REQUIRED JSON SCHEMA:
{
  "issue": "${issue.message.replace(/"/g, '\\"')}",
  "metric": "${cwvMetric}",
  "explanation": "<Concise 1-2 sentence plain-language summary of user experience impact>",
  "rootCause": "<Pillar 1: What's the reason for it? Concise 1-2 sentence technical diagnosis of the underlying browser/code mechanism>",
  "evidence": ["<Specific evidence point 1>", "<Specific evidence point 2>"],
  "recommendations": ["<Pillar 2: How are we solving it? Actionable step 1>", "<Actionable step 2>"],
  "whyItHelps": "<Pillar 3: Why only this way to solve it? Concise explanation of why this specific solution works and why alternative workarounds (dummy spacers, extra wrappers, etc.) fail or cause regressions>",
  "verificationProcedure": "<Concrete steps the developer can take in Chrome DevTools / Lighthouse to verify the fix>",
  "alternativeHypotheses": ["<Alternative hypothesis if evidence is inconclusive>"],
  "confidence": "HIGH" | "MEDIUM" | "LOW" | "UNRESOLVED",
  "confidenceReason": "<Why this confidence level was determined based on evidence>",
  "affectedFiles": [{"file": "${file.replace(/"/g, '\\"')}", "line": "${line}"}],
  "proposedChanges": "<Optional unified diff or code snippet, or null if uncertain>",
  "limitations": ["<Hypotheses, missing field data, or caveats>"]
}`;
}

/**
 * Validates and normalizes the parsed model output against the required schema.
 *
 * @param {object} parsed - The parsed JSON object.
 * @param {object} originalIssue - The original issue for baseline fallback data.
 * @returns {object} Validated structured advice.
 */
export function validateAdvisorResult(parsed, originalIssue = {}) {
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Parsed result must be an object');
  }

  const validMetric = (parsed.metric || originalIssue.cwv || 'GENERAL').toUpperCase();
  const validConfidenceLevels = ['HIGH', 'MEDIUM', 'LOW', 'UNRESOLVED'];
  let confidence = String(parsed.confidence || originalIssue.confidence || 'MEDIUM').toUpperCase();
  if (!validConfidenceLevels.includes(confidence)) {
    confidence = 'MEDIUM';
  }

  // Normalize evidence
  let evidence = [];
  if (Array.isArray(parsed.evidence)) {
    evidence = parsed.evidence.map(String).filter(Boolean);
  } else if (parsed.evidence) {
    evidence = [String(parsed.evidence)];
  } else if (originalIssue.evidence) {
    evidence = Array.isArray(originalIssue.evidence) ? originalIssue.evidence : [String(originalIssue.evidence)];
  }

  // Normalize recommendations
  let recommendations = [];
  if (Array.isArray(parsed.recommendations)) {
    recommendations = parsed.recommendations.map(String).filter(Boolean);
  } else if (parsed.recommendations) {
    recommendations = [String(parsed.recommendations)];
  } else if (originalIssue.suggestion) {
    recommendations = [originalIssue.suggestion];
  }

  // Normalize limitations
  let limitations = [];
  if (Array.isArray(parsed.limitations)) {
    limitations = parsed.limitations.map(String).filter(Boolean);
  } else if (parsed.limitations) {
    limitations = [String(parsed.limitations)];
  }

  // Normalize affectedFiles and ground strictly against verified evidence
  let affectedFiles = [];
  if (Array.isArray(parsed.affectedFiles)) {
    affectedFiles = parsed.affectedFiles.map(af => {
      if (af && typeof af === 'object' && af.file) {
        let l = af.line;
        if (l === '-' || l === 'Unknown' || l === 'unknown' || l === null || l === undefined) l = null;
        return { file: String(af.file), line: l };
      }
      if (typeof af === 'string') {
        const parts = af.split(':');
        const l = parts[1] && parts[1] !== '-' ? parts[1] : null;
        return { file: parts[0], line: l };
      }
      return null;
    }).filter(Boolean);
  }

  // Filter against verified audit files to eliminate any hallucinated paths
  const verifiedFiles = new Set();
  if (originalIssue.file && originalIssue.file !== 'Unknown file') {
    verifiedFiles.add(originalIssue.file);
  }
  if (Array.isArray(originalIssue.occurrences)) {
    originalIssue.occurrences.forEach(occ => {
      if (occ && occ.file) verifiedFiles.add(occ.file);
    });
  }

  const origLine = (originalIssue.line !== undefined && originalIssue.line !== null && originalIssue.line !== '-') ? originalIssue.line : null;
  if (verifiedFiles.size > 0 && affectedFiles.length > 0) {
    const grounded = affectedFiles.filter(af => verifiedFiles.has(af.file));
    affectedFiles = grounded.length > 0
      ? grounded
      : [{ file: originalIssue.file || 'Unknown file', line: origLine }];
  } else if (affectedFiles.length === 0 && originalIssue.file) {
    affectedFiles = [{ file: originalIssue.file, line: origLine }];
  }

  // Normalize verificationProcedure
  let verificationProcedure = String(
    parsed.verificationProcedure ||
    'Verify in Chrome DevTools Performance panel under Layout Shifts / Interactions.'
  );

  // Normalize alternativeHypotheses
  let alternativeHypotheses = [];
  if (Array.isArray(parsed.alternativeHypotheses)) {
    alternativeHypotheses = parsed.alternativeHypotheses.map(String).filter(Boolean);
  } else if (parsed.alternativeHypotheses) {
    alternativeHypotheses = [String(parsed.alternativeHypotheses)];
  }

  return {
    issue: String(parsed.issue || originalIssue.message || 'Performance Finding'),
    metric: validMetric,
    explanation: String(parsed.explanation || originalIssue.impact || 'No explanation provided.'),
    rootCause: String(parsed.rootCause || 'Root cause could not be determined definitively.'),
    evidence: evidence.length > 0 ? evidence : ['Derived from automated scanner output.'],
    recommendations: recommendations.length > 0 ? recommendations : ['Follow general Core Web Vitals optimization guidelines.'],
    whyItHelps: String(parsed.whyItHelps || 'Directly mitigates metric degradation by eliminating render-blocking or layout instability.'),
    verificationProcedure,
    alternativeHypotheses,
    confidence,
    confidenceReason: String(parsed.confidenceReason || 'Determined from correlation engine classification.'),
    affectedFiles,
    proposedChanges: parsed.proposedChanges ? String(parsed.proposedChanges) : null,
    limitations: limitations.length > 0 ? limitations : ['Based on synthetic lab measurements; field verification recommended.']
  };
}

/**
 * Extracts and parses JSON from raw model text output, tolerating markdown fences
 * or leading/trailing conversational text.
 *
 * @param {string} rawText - Raw string from model.
 * @param {object} originalIssue - The source issue.
 * @returns {object} Validated advice object.
 */
export function parseModelOutput(rawText, originalIssue = {}) {
  if (!rawText || typeof rawText !== 'string' || rawText.trim() === '') {
    return validateAdvisorResult({
      issue: originalIssue.message,
      explanation: 'Copilot returned an empty response.',
      rootCause: 'Service did not return diagnostic text.',
      confidence: 'LOW',
      confidenceReason: 'Empty response fallback',
      verificationProcedure: 'Inspect element in browser devtools and profile layout shifts during reload.',
      alternativeHypotheses: [],
      limitations: ['Model response was empty.']
    }, originalIssue);
  }

  let cleaned = rawText.trim();

  // Strip markdown code fences if present: ```json ... ``` or ``` ... ```
  const jsonBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (jsonBlockMatch) {
    cleaned = jsonBlockMatch[1].trim();
  }

  // Try parsing exact JSON
  try {
    const parsed = JSON.parse(cleaned);
    return validateAdvisorResult(parsed, originalIssue);
  } catch (directErr) {
    // If exact parse fails, attempt to locate the outermost { ... }
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      try {
        const substring = cleaned.slice(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(substring);
        return validateAdvisorResult(parsed, originalIssue);
      } catch (_) {
        // Fall through to structured text fallback
      }
    }

    // Graceful fallback for non-JSON text output
    return validateAdvisorResult({
      issue: originalIssue.message,
      metric: (originalIssue.cwv || 'GENERAL').toUpperCase(),
      explanation: cleaned.slice(0, 1000),
      rootCause: originalIssue.impact || 'Extracted from automated analyzer output.',
      evidence: Array.isArray(originalIssue.evidence) ? originalIssue.evidence : [String(originalIssue.evidence || 'Scanner rule match')],
      recommendations: originalIssue.suggestion ? [originalIssue.suggestion] : ['Review performance report.'],
      whyItHelps: 'Directly mitigates metric degradation by eliminating render-blocking or layout instability.',
      verificationProcedure: 'Inspect element in browser devtools and profile layout shifts during reload.',
      alternativeHypotheses: [],
      confidence: 'LOW',
      confidenceReason: 'Model produced unstructured text; normalized into advice schema.',
      affectedFiles: originalIssue.file ? [{ file: originalIssue.file, line: originalIssue.line || '-' }] : [],
      proposedChanges: null,
      limitations: ['Model output could not be strictly parsed as JSON; review advice manually.']
    }, originalIssue);
  }
}

/**
 * Analyzes a single finding using the provided CopilotService.
 *
 * @param {object} issue - The issue finding from compiledResult.
 * @param {object} copilotService - Instance of CopilotService.
 * @param {object} [options] - Options (timeoutMs, model, context).
 * @returns {Promise<object>} Structured AI advice.
 */
export async function analyzeIssueWithCopilot(issue, copilotService, options = {}) {
  if (!issue || typeof issue !== 'object') {
    throw new Error('Invalid issue: must be a non-null object');
  }
  if (!issue.message) {
    throw new Error('Invalid issue: missing required "message" property');
  }

  // Check if mock mode is requested via env or options
  if (process.env.COPILOT_MOCK === 'true' || options.mock === true) {
    return validateAdvisorResult({
      issue: issue.message,
      metric: (issue.cwv || 'GENERAL').toUpperCase(),
      explanation: `[MOCK AI ADVICE] Analyzing ${issue.cwv || 'performance'} issue: "${issue.message}". This layout or interaction behavior impacts user experience.`,
      rootCause: `[MOCK ROOT CAUSE] Deterministic rule "${issue.type || 'code'}" identified potential bottleneck in ${issue.file || 'runtime layout'}.`,
      evidence: Array.isArray(issue.evidence) && issue.evidence.length > 0 ? issue.evidence : ['Mock synthetic correlation match.'],
      recommendations: [
        issue.suggestion || 'Apply standard Core Web Vitals optimization.',
        'Validate performance changes with a follow-up Lighthouse scan.'
      ],
      whyItHelps: 'Reserving layout bounds before assets load avoids browser reflows and eliminates visual shifts.',
      verificationProcedure: 'Verify layout bounds and dimensions in Chrome DevTools Elements and Performance panels.',
      alternativeHypotheses: ['Late CSS stylesheet injection', 'Dynamic component mounting'],
      confidence: issue.confidence || 'MEDIUM',
      confidenceReason: 'Mock advisor generated response conforming to test schema.',
      affectedFiles: issue.file ? [{ file: issue.file, line: (issue.line !== undefined && issue.line !== null && issue.line !== '-') ? issue.line : null }] : [],
      proposedChanges: issue.snippet ? `// Recommended update for:\n// ${issue.snippet}` : null,
      limitations: ['Generated under test mock mode.']
    }, issue);
  }

  if (!copilotService || typeof copilotService.generateResponse !== 'function') {
    throw new Error('CopilotService instance with generateResponse() is required');
  }

  const prompt = buildAdvisorPrompt(issue, options.context || {});
  try {
    const rawResponse = await copilotService.generateResponse(prompt, {
      timeoutMs: options.timeoutMs || 60000,
      model: options.model
    });
    return parseModelOutput(rawResponse, issue);
  } catch (err) {
    const rawMsg = err?.message || String(err);
    const sanitizedMsg = rawMsg
      .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, '[REDACTED_GITHUB_TOKEN]')
      .replace(/bearer\s+[A-Za-z0-9_.-]+/gi, 'Bearer [REDACTED_TOKEN]');
    const error = new Error(`AI Advisor failed: ${sanitizedMsg}`);
    error.errorType = err?.errorType || categorizeCopilotError(err);
    throw error;
  }
}

/**
 * In-memory cache for validated advice keyed by stable issue fingerprint.
 */
export const adviceCache = new Map();

/**
 * Computes a stable fingerprint for an issue finding based on its core attributes and evidence.
 *
 * @param {object} issue - The finding.
 * @returns {string} Stable key string.
 */
export function computeIssueFingerprint(issue) {
  if (!issue || typeof issue !== 'object') return '';
  const evidenceKey = Array.isArray(issue.evidence)
    ? issue.evidence.join('|')
    : String(issue.evidence || '');
  const occurrencesKey = Array.isArray(issue.occurrences)
    ? issue.occurrences.map(o => `${o.file}:${o.line}`).join('|')
    : '';
  return [
    issue.cwv || 'general',
    issue.severity || 'medium',
    issue.type || 'code',
    issue.message || '',
    issue.file || '',
    issue.line !== undefined && issue.line !== null ? issue.line : '',
    issue.selector || '',
    issue.snippet || '',
    issue.inpPhase || '',
    issue.callChainString || '',
    occurrencesKey,
    evidenceKey
  ].join(':::');
}

/**
 * Automatically enriches an existing compiledResult with Copilot AI advice.
 *
 * - Preserves all existing deterministic calculations, severities, scores, and classifications.
 * - Prioritizes top actionable CLS, LCP, and INP findings up to maxIssues.
 * - Employs bounded batch concurrency and fingerprint caching to avoid redundant calls.
 * - Enforces both per-request timeoutMs and cumulative totalTimeoutMs deadline.
 * - Tolerates partial failures: successful advice is attached even if an individual issue fails.
 * - Marks non-analyzed findings clearly with omitted_limit status.
 *
 * @param {object} compiledResult - The deterministic compilation result.
 * @param {object} [options] - Options (copilotService, maxIssues, batchSize, timeoutMs, totalTimeoutMs, mock, url).
 * @returns {Promise<object>} The enriched compiledResult.
 */
export async function enrichAuditWithCopilot(compiledResult, options = {}) {
  if (!compiledResult || !Array.isArray(compiledResult.issues)) {
    return compiledResult;
  }

  // Prioritize HIGH and MEDIUM severities by default to conserve AI tokens
  const severities = options.severities || (options.allSeverities ? null : ['high', 'medium']);
  const maxIssues = Math.max(1, Number(options.maxIssues || process.env.COPILOT_MAX_ISSUES) || 20);
  const copilotService = options.copilotService || options.copilot || null;
  const timeoutMs = options.timeoutMs || 60000;
  const totalTimeoutMs = options.totalTimeoutMs !== undefined
    ? Number(options.totalTimeoutMs)
    : (Number(process.env.COPILOT_TOTAL_TIMEOUT_MS) || 120000);
  const batchSize = Math.max(1, Number(options.batchSize) || 1);
  const deadline = Date.now() + totalTimeoutMs;

  const priorityIssues = selectPriorityIssues(compiledResult.issues, maxIssues, { severities });
  const prioritySet = new Set(priorityIssues);

  compiledResult.aiAdvisor = {
    status: 'in_progress',
    maxIssues,
    totalIssues: compiledResult.issues.length,
    priorityCount: priorityIssues.length,
    analyzedCount: 0,
    cachedCount: 0,
    failedCount: 0,
    deadlineExceeded: false
  };

  let hasFailures = false;
  let hasSuccesses = false;

  // Process priority issues in bounded sequential batches
  for (let i = 0; i < priorityIssues.length; i += batchSize) {
    // Check total enrichment deadline
    if (Date.now() >= deadline) {
      compiledResult.aiAdvisor.deadlineExceeded = true;
      for (let j = i; j < priorityIssues.length; j++) {
        const remainingIssue = priorityIssues[j];
        if (!remainingIssue.aiAdvice) {
          remainingIssue.aiStatus = 'omitted_limit';
          remainingIssue.aiLimitNote = 'AI enrichment total deadline reached; deterministic recommendation active.';
        }
      }
      break;
    }

    const chunk = priorityIssues.slice(i, i + batchSize);
    const remainingBudget = Math.max(1000, deadline - Date.now());
    const effectiveTimeout = Math.min(timeoutMs, remainingBudget);

    await Promise.all(chunk.map(async (issue) => {
      // 1. Check if issue already has valid AI advice attached (e.g. historical report)
      if (issue.aiAdvice && typeof issue.aiAdvice === 'object') {
        issue.aiStatus = 'completed';
        const fp = computeIssueFingerprint(issue);
        if (fp) adviceCache.set(fp, issue.aiAdvice);
        compiledResult.aiAdvisor.analyzedCount++;
        compiledResult.aiAdvisor.cachedCount++;
        hasSuccesses = true;
        return;
      }

      // 2. Check fingerprint cache
      const fingerprint = computeIssueFingerprint(issue);
      if (fingerprint && adviceCache.has(fingerprint)) {
        issue.aiAdvice = adviceCache.get(fingerprint);
        issue.aiStatus = 'completed';
        compiledResult.aiAdvisor.analyzedCount++;
        compiledResult.aiAdvisor.cachedCount++;
        hasSuccesses = true;
        return;
      }

      // 3. Invoke Copilot analysis
      try {
        const advice = await analyzeIssueWithCopilot(issue, copilotService, {
          timeoutMs: effectiveTimeout,
          mock: options.mock,
          context: { url: options.url }
        });
        issue.aiAdvice = advice;
        issue.aiStatus = 'completed';
        if (fingerprint) adviceCache.set(fingerprint, advice);
        compiledResult.aiAdvisor.analyzedCount++;
        hasSuccesses = true;
      } catch (err) {
        hasFailures = true;
        compiledResult.aiAdvisor.failedCount++;
        issue.aiAdvice = null;
        issue.aiStatus = 'error';
        issue.aiError = err?.message || 'Failed to generate Copilot advice';
        issue.aiErrorDetails = {
          type: err?.errorType || 'ERROR',
          message: err?.message || 'Failed to generate Copilot advice'
        };
      }
    }));
  }

  // Label issues outside priority limit
  compiledResult.issues.forEach(issue => {
    if (!prioritySet.has(issue)) {
      if (!issue.aiAdvice) {
        issue.aiStatus = 'omitted_limit';
        const sev = String(issue.severity || 'low').toLowerCase();
        if (sev === 'low' || sev === 'info') {
          issue.aiLimitNote = 'Deterministic recommendation active (low impact). Copilot advice auto-generated for high and medium findings.';
        } else {
          issue.aiLimitNote = `Deterministic recommendation active. Copilot advice auto-generated for top ${maxIssues} priority findings.`;
        }
      }
    }
  });

  // Final summary status
  if (hasSuccesses && !hasFailures) {
    compiledResult.aiAdvisor.status = compiledResult.aiAdvisor.deadlineExceeded ? 'partial' : 'completed';
  } else if (hasSuccesses && hasFailures) {
    compiledResult.aiAdvisor.status = 'partial';
  } else if (!hasSuccesses && hasFailures) {
    compiledResult.aiAdvisor.status = 'unavailable';
  } else {
    compiledResult.aiAdvisor.status = 'completed';
  }

  return compiledResult;
}

/**
 * Analyzes multiple top-priority findings from a compiledResult.
 *
 * @param {object} compiledResult - Full compiledResult object from recommendations.js.
 * @param {object} copilotService - Instance of CopilotService.
 * @param {object} [options] - Options (maxCount, timeoutMs, model).
 * @returns {Promise<Array<object>>} Array of structured advice items.
 */
export async function analyzeAuditWithCopilot(compiledResult, copilotService, options = {}) {
  if (!compiledResult || !Array.isArray(compiledResult.issues)) {
    throw new Error('Invalid compiledResult: missing issues array');
  }

  const priorityIssues = selectPriorityIssues(compiledResult.issues, options.maxCount || 3);
  const adviceResults = [];

  for (const issue of priorityIssues) {
    const advice = await analyzeIssueWithCopilot(issue, copilotService, options);
    adviceResults.push(advice);
  }

  return adviceResults;
}
