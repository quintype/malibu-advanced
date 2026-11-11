import fs from 'fs';
import path from 'path';
import { diagnoseRuleBasedFix, resolveFilePath } from './ruleFixer.js';
import { requestFix, retryFix } from './copilotClient.js';
import { validateCandidateFix } from './diffValidator.js';

/**
 * Checks whether an issue is eligible for fix generation:
 * - confidence must be >= 'medium' ('high' or 'medium')
 * - evidence_type must be 'measured'
 * - must not be third-party code (e.g. node_modules, vendor, or unmapped cdn)
 *
 * @param {Object} issue
 * @returns {{eligible: boolean, reason?: string}}
 */
export function checkIssueEligibility(issue) {
  if (!issue) return { eligible: false, reason: 'Issue is undefined' };

  const confidenceRank = { low: 1, medium: 2, high: 3 };
  const conf = (issue.confidence || 'low').toLowerCase();

  if ((confidenceRank[conf] || 0) < 2) {
    return { eligible: false, reason: `Confidence '${issue.confidence}' is below minimum threshold (medium)` };
  }

  if (issue.evidence_type !== 'measured') {
    return { eligible: false, reason: `Evidence type '${issue.evidence_type}' is not measured (e.g. static-only)` };
  }

  const file = issue.location?.file || '';
  if (file.includes('node_modules') || file.includes('vendor/') || file.startsWith('http://') || file.startsWith('https://')) {
    return { eligible: false, isThirdParty: true, reason: 'Issue originates from third-party or external dependency (skipped)' };
  }

  // Skip code fix generation if metric bottleneck is backend server wait (e.g. good LCP dominated by TTFB)
  if (issue.metric === 'LCP' && (issue.rootCauseCategory === 'server-response-wait' || issue.no_fix_reason)) {
    return { eligible: false, reason: issue.no_fix_reason || 'LCP is good and bottleneck is server TTFB/wait; client code fix not applicable.' };
  }

  return { eligible: true };
}

/**
 * Extracts source code around an issue's line range to provide context for Copilot.
 * @param {string} fullPath
 * @param {number} lineStart
 * @param {number} lineEnd
 * @param {number} contextPadding
 * @returns {string}
 */
export function extractSourceContext(fullPath, lineStart = 1, lineEnd = 1, contextPadding = 25) {
  if (!fs.existsSync(fullPath)) return '';
  const lines = fs.readFileSync(fullPath, 'utf-8').split('\n');
  const start = Math.max(0, lineStart - 1 - contextPadding);
  const end = Math.min(lines.length, lineEnd + contextPadding);
  return lines.slice(start, end).join('\n');
}

/**
 * Generates and validates concrete code fixes for all eligible performance issues.
 *
 * Deterministic rules run first. Issues without a rule (INP handlers) go to the Copilot client interface only when
 * options.copilot === 'on'; a fix returned by a mock response is labelled strategy "mock" and copilot "not run", and
 * only a real response is labelled "copilot". Without the option, such issues get no fix and copilot "not run".
 *
 * @param {Array<Object>} issues - Issues list from the deep analyzer
 * @param {Object} [options]
 * @param {string} [options.workspaceRoot] - Repository root; issue and diff paths are relative to it
 * @param {string} [options.searchRoot] - Directory searched for CSS rules (defaults to workspaceRoot)
 * @param {string} [options.pageFile] - HTML document the lab run loaded, relative to searchRoot
 * @param {'on'|'off'} [options.copilot='off'] - Whether the Copilot client interface may be consulted
 * @returns {Promise<Array<Object>>} Enriched issues with concrete validated fixes
 */
export async function generateFixesForIssues(issues = [], options = {}) {
  const workspaceRoot = options.workspaceRoot || process.cwd();
  const copilotEnabled = options.copilot === 'on';
  const enrichedIssues = [];

  const fixRecord = (strategy, candidate, validation, relativeFile, extra = {}) => ({
    strategy,
    fix_target_file: candidate.fix_target_file || candidate.file || relativeFile,
    diff: validation.unifiedDiff,
    edits: candidate.edits,
    description: candidate.description,
    why_it_works: candidate.why_it_works,
    tradeoffs: candidate.tradeoffs,
    gitApplyEvidence: validation.gitApplyEvidence,
    gitApplyOutput: validation.gitApplyOutput,
    validation: validation.checks,
    fix_validated: true,
    ...extra
  });

  for (const issue of issues) {
    const enriched = { ...issue };

    const eligibility = checkIssueEligibility(issue);
    if (!eligibility.eligible) {
      if (eligibility.isThirdParty) {
        enriched.note = `Third-party code detected (${issue.location?.file}); automated modification skipped.`;
      }
      enriched.fix = null;
      enriched.no_fix_reason = eligibility.reason;
      enriched.fix_validated = false;
      enriched.measured_improvement = null;
      enrichedIssues.push(enriched);
      continue;
    }

    const relativeFile = issue.location?.file;
    const fullPath = resolveFilePath(relativeFile, workspaceRoot);

    // 1. Deterministic rule-based fix first (no LLM)
    const forceCopilotForIssue = options.forceCopilot || options.forceCopilotMetrics?.includes(issue.metric);
    const diagnosis = forceCopilotForIssue ? null : diagnoseRuleBasedFix(issue, workspaceRoot, { pageFile: options.pageFile, searchRoot: options.searchRoot });
    if (diagnosis && !diagnosis.fix) {
      // A rule applies but a required measurement or location is missing: report why, do not ask an LLM to guess.
      enriched.fix = null;
      enriched.no_fix_reason = diagnosis.no_fix_reason;
      enriched.fix_validated = false;
      enriched.measured_improvement = null;
      enrichedIssues.push(enriched);
      continue;
    }
    const ruleFix = diagnosis ? diagnosis.fix : null;
    if (ruleFix) {
      const validation = await validateCandidateFix({ issue, fix: ruleFix, workspaceRoot });
      if (validation.valid) {
        enriched.fix = fixRecord('rule-based', ruleFix, validation, relativeFile);
        enriched.copilot = 'not used (rule-based fix)';
        enriched.fix_validated = true;
        enriched.measured_improvement = null;
        enrichedIssues.push(enriched);
        continue;
      }
      enriched.fix = {
        strategy: 'rule-based',
        fix_target_file: ruleFix.fix_target_file || ruleFix.file || relativeFile,
        fix_validated: false,
        fix_unverified: true,
        validation_error: validation.error,
        validation: validation.checks,
        gitApplyEvidence: validation.gitApplyEvidence,
        description: ruleFix.description,
        edits: ruleFix.edits
      };
      enriched.copilot = 'not used (rule-based fix)';
      enriched.fix_validated = false;
      enriched.measured_improvement = null;
      enrichedIssues.push(enriched);
      continue;
    }

    // 2. No rule applies: only the Copilot client interface can produce a fix, and only when enabled
    if (!copilotEnabled) {
      enriched.fix = null;
      enriched.no_fix_reason = 'No deterministic rule applies to this issue.';
      enriched.copilot = 'not run: Copilot was not enabled (use --copilot, or --mock-copilot <file> for a stored response)';
      enriched.fix_validated = false;
      enriched.measured_improvement = null;
      enrichedIssues.push(enriched);
      continue;
    }

    const sourceCode = extractSourceContext(fullPath, issue.location?.line_start, issue.location?.line_end);

    try {
      let candidateFix = await requestFix({
        issue,
        sourceCode,
        workspaceRoot,
        onPrompt: options.onPrompt,
        onRawResponse: options.onRawResponse
      });
      let validation = await validateCandidateFix({ issue, fix: candidateFix, workspaceRoot });

      // If initial validation fails, attempt exactly ONE retry with Copilot
      if (!validation.valid) {
        try {
          const retryCandidate = await retryFix({
            issue,
            sourceCode,
            previousFix: candidateFix,
            validationError: validation.error,
            workspaceRoot,
            onPrompt: options.onPrompt,
            onRawResponse: options.onRawResponse
          });
          const retryValidation = await validateCandidateFix({ issue, fix: retryCandidate, workspaceRoot });

          if (retryValidation.valid) {
            candidateFix = retryCandidate;
            validation = retryValidation;
          }
        } catch (retryErr) {
          // Retry failed, keep initial validation error
        }
      }

      const isMock = candidateFix.copilot_source === 'mock';
      const strategy = isMock ? 'mock' : 'copilot';
      enriched.copilot = isMock ? 'not run: a stored mock response was used, no Copilot call was made' : 'live';

      if (validation.valid) {
        enriched.fix = fixRecord(strategy, candidateFix, validation, relativeFile);
        enriched.fix_validated = true;
        enriched.measured_improvement = null;
      } else {
        // Mark as fix_unverified: do NOT present diff as actionable
        enriched.fix = {
          strategy,
          fix_target_file: candidateFix.fix_target_file || candidateFix.file || relativeFile,
          fix_validated: false,
          fix_unverified: true,
          validation_error: validation.error,
          validation: validation.checks,
          gitApplyEvidence: validation.gitApplyEvidence,
          description: candidateFix?.description || 'Attempted fix failed automated diff validation',
          why_it_works: candidateFix?.why_it_works || '',
          tradeoffs: candidateFix?.tradeoffs || '',
          edits: candidateFix?.edits || []
        };
        enriched.fix_validated = false;
        enriched.measured_improvement = null;
      }
    } catch (err) {
      enriched.fix = {
        strategy: 'copilot',
        fix_target_file: relativeFile,
        fix_validated: false,
        fix_unverified: true,
        validation_error: err.message,
        description: 'Failed to generate automated fix'
      };
      enriched.copilot = `not run: ${err.message}`;
      enriched.fix_validated = false;
      enriched.measured_improvement = null;
    }

    enrichedIssues.push(enriched);
  }

  return enrichedIssues;
}
