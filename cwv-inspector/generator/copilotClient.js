import { z } from 'zod';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { CopilotService } from '../services/copilotService.js';

const thisDirectory = path.dirname(fileURLToPath(import.meta.url));
const bundledCopilotPath = path.resolve(thisDirectory, `../node_modules/@github/copilot-${process.platform}-${process.arch}/copilot`);
const copilotCliPath = process.env.COPILOT_CLI_PATH || (fs.existsSync(bundledCopilotPath) ? bundledCopilotPath : 'copilot');

/**
 * Strict Zod schema for fix generation responses.
 */
export const FixSchema = z.object({
  file: z.string().min(1, 'Target file is required'),
  fix_target_file: z.string().min(1).optional(),
  edits: z.array(z.object({
    original_snippet: z.string().min(1, 'original_snippet cannot be empty'),
    replacement_snippet: z.string()
  })).min(1, 'At least one edit is required'),
  description: z.string().min(1, 'description is required'),
  why_it_works: z.string().min(1, 'why_it_works is required'),
  tradeoffs: z.string().min(1, 'tradeoffs is required')
});

/**
 * Sanitizes input text to strip credentials, API keys, tokens, and absolute paths.
 * @param {string} text
 * @param {string} [workspaceRoot]
 * @returns {string}
 */
export function sanitizePromptContext(text, workspaceRoot = process.cwd()) {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // Never emit account identifiers if a subprocess error or prompt context
  // contains a home-directory path or email address.
  sanitized = sanitized
    .replace(/(?:\/Users\/|\/home\/)[^\s:'"`]+/g, '[REDACTED_PATH]')
    .replace(/[A-Z]:\\Users\\[^\s:'"`]+/gi, '[REDACTED_PATH]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[REDACTED_ACCOUNT]')
    .replace(/(?:authenticated|logged\s+in)\s+as\s+[^\s,;]+/gi, '[REDACTED_AUTH_IDENTITY]');

  // 1. Strip absolute paths to avoid host filesystem leakage
  if (workspaceRoot) {
    const escapedRoot = workspaceRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    sanitized = sanitized.replace(new RegExp(escapedRoot, 'g'), '.');
  }
  // Generic Unix / Windows absolute path patterns
  sanitized = sanitized.replace(/(?<![a-zA-Z0-9._-])(?:\/[a-zA-Z0-9._-]+){3,}/g, (match) => {
    // If it's a repo-relative path starting with ./ or tests/, preserve it
    if (match.startsWith('/node_modules') || match.startsWith('/tests')) return '.' + match;
    const parts = match.split('/');
    return parts.slice(-3).join('/');
  });

  // 2. Redact sensitive patterns (tokens, keys, passwords)
  sanitized = sanitized
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/bearer\s+[A-Za-z0-9_.-]+/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/AKIA[0-9A-Z]{16}/g, '[REDACTED_AWS_KEY]')
    .replace(/(?:password|secret|apiKey|api_key)\s*[:=]\s*["'][^"']+["']/gi, '$1: "[REDACTED]"');

  return sanitized;
}

// In-memory mock response state for hermetic unit testing without network or credentials
let mockHandler = null;
const mockQueue = [];

/**
 * Sets a mock handler function or static response for testing.
 * @param {Function|Object|string} handler
 */
export function setMockCopilotHandler(handler) {
  mockHandler = handler;
}

/**
 * Queues a one-time mock response.
 * @param {Object|string} response
 */
export function queueMockResponse(response) {
  mockQueue.push(response);
}

/**
 * Clears any registered mock handlers and queues.
 */
export function clearMockCopilot() {
  mockHandler = null;
  mockQueue.length = 0;
}

/**
 * Parses and validates LLM response text against the strict Zod FixSchema.
 * @param {string|Object} rawResponse
 * @returns {Object} Validated fix object
 */
export function parseAndValidateFix(rawResponse) {
  let parsed;
  if (typeof rawResponse === 'object' && rawResponse !== null) {
    parsed = rawResponse;
  } else if (typeof rawResponse === 'string') {
    // Extract JSON block from markdown code fences if present
    let jsonText = rawResponse.trim();
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (fenceMatch) {
      jsonText = fenceMatch[1].trim();
    }
    try {
      parsed = JSON.parse(jsonText);
    } catch (err) {
      throw new Error(`Failed to parse fix JSON: ${err.message}. Raw output: ${rawResponse.slice(0, 200)}`);
    }
  } else {
    throw new Error(`Invalid response type from Copilot: ${typeof rawResponse}`);
  }

  // Validate against Zod schema
  const validation = FixSchema.safeParse(parsed);
  if (!validation.success) {
    const issues = validation.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`Fix response does not conform to required schema: ${issues}`);
  }

  return {
    ...validation.data,
    fix_target_file: validation.data.fix_target_file || validation.data.file
  };
}

/**
 * Requests a code fix for an identified performance issue.
 *
 * @param {Object} options
 * @param {Object} options.issue - Issue identified by Step 3 analyzer
 * @param {string} options.sourceCode - Context code around the bottleneck
 * @param {string} [options.workspaceRoot]
 * @returns {Promise<Object>} Validated fix object conforming to FixSchema, plus copilot_source: 'mock' | 'live'
 */
export async function requestFix({ issue, sourceCode, workspaceRoot = process.cwd(), onPrompt, onRawResponse }) {
  // Check mock queue first
  if (mockQueue.length > 0) {
    const nextMock = mockQueue.shift();
    return { ...parseAndValidateFix(nextMock), copilot_source: 'mock' };
  }

  // Check mock handler
  if (mockHandler) {
    const result = typeof mockHandler === 'function'
      ? await mockHandler({ issue, sourceCode, isRetry: false })
      : mockHandler;
    return { ...parseAndValidateFix(result), copilot_source: 'mock' };
  }

  // Build sanitized prompt for real Copilot execution
  const sanitizedCode = sanitizePromptContext(sourceCode, workspaceRoot);
  const causeGuidance = issue.metric === 'INP' && issue.rootCauseCategory === 'heavy-filter-loop'
    ? [
        `4. For this measured filter loop, prefer hoisting query.toLowerCase() out of the per-item/per-iteration loop; hoist repeated title normalization where equivalent.`,
        `5. Preserve the exact filtered output for identical input queries. Chunk/yield only if the event/result contract remains equivalent.`,
        `6. startTransition/useDeferredValue applies only if the measured target is implemented in React; do not introduce useMemo keyed to the changing query as the fix.`
      ]
    : [];
  const prompt = sanitizePromptContext([
    `You are a senior web performance engineer fixing a Core Web Vitals ${issue.metric} issue.`,
    `File: ${issue.location.file}`,
    `Metric: ${issue.metric}`,
    `Problem: ${issue.problem}`,
    `Root Cause: ${issue.root_cause}`,
    `Evidence: ${JSON.stringify(issue.evidence, null, 2)}`,
    ``,
    `Source Code to Fix:`,
    `\`\`\``,
    sanitizedCode,
    `\`\`\``,
    ``,
    `CRITICAL INSTRUCTIONS:`,
    `1. Return ONLY a single raw JSON object matching this schema:`,
    `   {`,
    `     "file": "${issue.location.file}",`,
    `     "fix_target_file": "${issue.location.file}",`,
    `     "edits": [`,
    `       {`,
    `         "original_snippet": "<exact substring to replace>",`,
    `         "replacement_snippet": "<replacement code>"`,
    `       }`,
    `     ],`,
    `     "description": "<one-sentence summary of fix>",`,
    `     "why_it_works": "<technical reason why this fix eliminates the CWV bottleneck>",`,
    `     "tradeoffs": "<architectural or UX tradeoffs>"`,
    `   }`,
    `2. "original_snippet" MUST match an EXACT character sequence in the source code.`,
    `3. For INP: fix the measured cause using cooperative yielding (scheduler.yield() or setTimeout), loop-invariant hoisting, or batching DOM reads/writes as appropriate.`,
    ...causeGuidance,
    `${4 + causeGuidance.length}. Do NOT wrap output in conversational text.`
  ].join('\n'), workspaceRoot);
  if (typeof onPrompt === 'function') onPrompt(prompt, issue);

  let client;
  try {
    client = new CopilotService({ cliPath: copilotCliPath, timeoutMs: 60000 });
    const rawContent = await client.generateResponse(prompt, { model: process.env.COPILOT_MODEL || undefined });
    if (typeof rawContent !== 'string' || !rawContent.trim()) throw new Error('Copilot returned no assistant JSON response.');
    if (typeof onRawResponse === 'function') onRawResponse(rawContent, issue);
    return { ...parseAndValidateFix(rawContent), copilot_source: 'live' };
  } catch (err) {
    throw new Error(`Copilot fix generation failed: ${sanitizePromptContext(err.message, workspaceRoot)}`);
  } finally {
    if (client) await client.stop().catch(() => {});
  }
}

/**
 * Sends a validation error back to Copilot for one retry attempt.
 *
 * @param {Object} options
 * @param {Object} options.issue
 * @param {string} options.sourceCode
 * @param {Object} options.previousFix
 * @param {string} options.validationError - Failure message from git apply, Babel parse, or AST analyzer
 * @param {string} [options.workspaceRoot]
 * @returns {Promise<Object>} Validated fix object conforming to FixSchema
 */
export async function retryFix({ issue, sourceCode, previousFix, validationError, workspaceRoot = process.cwd(), onPrompt, onRawResponse }) {
  if (mockQueue.length > 0) {
    const nextMock = mockQueue.shift();
    return { ...parseAndValidateFix(nextMock), copilot_source: 'mock' };
  }

  if (mockHandler) {
    const result = typeof mockHandler === 'function'
      ? await mockHandler({ issue, sourceCode, previousFix, validationError, isRetry: true })
      : mockHandler;
    return { ...parseAndValidateFix(result), copilot_source: 'mock' };
  }

  const prompt = sanitizePromptContext([
    `Your previous fix failed validation with error: ${validationError}`,
    `Previous Edits: ${JSON.stringify(previousFix?.edits, null, 2)}`,
    `File: ${issue.location.file}`,
    `Target Code:`,
    `\`\`\``,
    sanitizePromptContext(sourceCode, workspaceRoot),
    `\`\`\``,
    `Please correct the edit so that:`,
    `1. original_snippet matches the file exactly once.`,
    `2. The replacement code is syntactically valid and eliminates the CWV root cause without introducing new issues.`,
    `Return ONLY a valid JSON object matching the required schema.`
  ].join('\n'), workspaceRoot);
  if (typeof onPrompt === 'function') onPrompt(prompt, issue);

  let client;
  try {
    const { CopilotClient } = await import('@github/copilot-sdk');
    client = new CopilotClient({ cliPath: copilotCliPath, logLevel: 'error', autoRestart: false, useStdio: false, port: 0 });
    await client.start();
    const session = await client.createSession();
    const response = await session.sendAndWait({ prompt }, 60000);
    const rawContent = response?.data?.content;
    if (typeof rawContent !== 'string' || !rawContent.trim()) throw new Error('Copilot returned no assistant JSON response.');
    if (typeof onRawResponse === 'function') onRawResponse(rawContent, issue);
    return { ...parseAndValidateFix(rawContent), copilot_source: 'live' };
  } catch (err) {
    throw new Error(`Copilot fix retry failed: ${sanitizePromptContext(err.message, workspaceRoot)}`);
  } finally {
    if (client) await client.stop().catch(() => {});
  }
}

