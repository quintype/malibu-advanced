import fs from 'fs';
import path from 'path';
import { generateRuleBasedFix, resolveFilePath } from './ruleFixer.js';
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
 * @param {Array<Object>} issues - Issues list from Step 3 deep analyzer
 * @param {Object} [options]
 * @param {string} [options.workspaceRoot]
 * @returns {Promise<Array<Object>>} Enriched issues with concrete validated fixes
 */
export async function generateFixesForIssues(issues = [], options = {}) {
  const workspaceRoot = options.workspaceRoot || process.cwd();
  const enrichedIssues = [];

  for (const issue of issues) {
    const enriched = { ...issue };

    const eligibility = checkIssueEligibility(issue);
    if (!eligibility.eligible) {
      if (eligibility.isThirdParty) {
        enriched.note = `Third-party code detected (${issue.location?.file}); automated modification skipped.`;
      }
      enriched.fix = null;
      enriched.fix_validated = false;
      enriched.measured_improvement = null;
      enrichedIssues.push(enriched);
      continue;
    }

    const relativeFile = issue.location?.file;
    const fullPath = resolveFilePath(relativeFile, workspaceRoot);

    // 1. Attempt deterministic rule-based fix first (no LLM)
    const forceCopilotForIssue = options.forceCopilot || options.forceCopilotMetrics?.includes(issue.metric);
    const ruleFix = forceCopilotForIssue ? null : generateRuleBasedFix(issue, workspaceRoot);
    if (ruleFix) {
      const validation = await validateCandidateFix({ issue, fix: ruleFix, workspaceRoot });
      if (validation.valid) {
        enriched.fix = {
          strategy: 'rule-based',
          fix_target_file: ruleFix.fix_target_file || ruleFix.file || relativeFile,
          diff: validation.unifiedDiff,
          edits: ruleFix.edits,
          description: ruleFix.description,
          why_it_works: ruleFix.why_it_works,
          tradeoffs: ruleFix.tradeoffs,
          gitApplyEvidence: validation.gitApplyEvidence,
          gitApplyOutput: validation.gitApplyOutput,
          fix_validated: true
        };
        enriched.fix_validated = true;
        enriched.measured_improvement = null;
        enrichedIssues.push(enriched);
        continue;
      }
    }

    // 2. Fall back to Copilot for complex/restructuring fixes
    const sourceCode = extractSourceContext(
      fullPath,
      issue.location?.line_start,
      issue.location?.line_end
    );

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

      if (validation.valid) {
        enriched.fix = {
          strategy: 'copilot',
          fix_target_file: candidateFix.fix_target_file || candidateFix.file || relativeFile,
          diff: validation.unifiedDiff,
          edits: candidateFix.edits,
          description: candidateFix.description,
          why_it_works: candidateFix.why_it_works,
          tradeoffs: candidateFix.tradeoffs,
          gitApplyEvidence: validation.gitApplyEvidence,
          gitApplyOutput: validation.gitApplyOutput,
          fix_validated: true
        };
        enriched.fix_validated = true;
        enriched.measured_improvement = null;
      } else {
        // Mark as fix_unverified: do NOT present diff as actionable
        enriched.fix = {
          strategy: 'copilot',
          fix_target_file: candidateFix.fix_target_file || candidateFix.file || relativeFile,
          fix_validated: false,
          fix_unverified: true,
          validation_error: validation.error,
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
      enriched.fix_validated = false;
      enriched.measured_improvement = null;
    }

    enrichedIssues.push(enriched);
  }

  return enrichedIssues;
}
