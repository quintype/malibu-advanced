export { generateFixesForIssues, checkIssueEligibility, applyValidatedFixes } from './fixGenerator.js';
export { validateCandidateFix, verifyHunkHeaderCounts, verifyDynamicEquivalence, verifySemanticResolution } from './diffValidator.js';
export { generateRuleBasedFix, diagnoseRuleBasedFix, getImageDimensions } from './ruleFixer.js';
export { requestFix, retryFix, setMockCopilotHandler, queueMockResponse, clearMockCopilot, parseAndValidateFix } from './copilotClient.js';
