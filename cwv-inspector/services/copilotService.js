import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CopilotClient } from '@github/copilot-sdk';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Resolves the path to the Copilot CLI binary/loader.
 * Prefers explicitly provided env variables, then falls back to the
 * npm-bundled loader in @github/copilot, and finally "copilot" on PATH.
 */
function resolveCliPath() {
  if (process.env.COPILOT_CLI_PATH && fs.existsSync(process.env.COPILOT_CLI_PATH)) {
    return process.env.COPILOT_CLI_PATH;
  }

  // Check the npm-loader bundled in @github/copilot package
  const bundledLoader = path.resolve(__dirname, '../node_modules/@github/copilot/npm-loader.js');
  if (fs.existsSync(bundledLoader)) {
    return bundledLoader;
  }

  // Fallback to system PATH binary
  return 'copilot';
}

/**
 * Sanitizes error messages to prevent any internal credential leakage.
 */
function sanitizeErrorMessage(error) {
  if (!error) return 'Unknown error occurred in Copilot service';
  const msg = typeof error === 'string' ? error : error.message || String(error);
  // Redact potential token patterns
  return msg
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/bearer\s+[A-Za-z0-9_.-]+/gi, 'Bearer [REDACTED_TOKEN]');
}

/**
 * Categorizes an error encountered during Copilot execution into a structured error type.
 *
 * @param {Error|string} error - The error to classify.
 * @returns {'TIMEOUT'|'AUTH_FAILURE'|'UNAVAILABLE'|'MALFORMED'|'ERROR'}
 */
export function categorizeCopilotError(error) {
  if (!error) return 'ERROR';
  const msg = (typeof error === 'string' ? error : error.message || String(error)).toLowerCase();
  if (msg.includes('timeout') || msg.includes('timed out')) {
    return 'TIMEOUT';
  }
  if (msg.includes('auth') || msg.includes('token') || msg.includes('unauthorized') || msg.includes('login') || msg.includes('credential')) {
    return 'AUTH_FAILURE';
  }
  if (msg.includes('not connected') || msg.includes('connection closed') || msg.includes('econnrefused') || msg.includes('enoent') || msg.includes('unavailable') || msg.includes('failed to initialize')) {
    return 'UNAVAILABLE';
  }
  if (msg.includes('malformed') || msg.includes('empty response') || msg.includes('json') || msg.includes('schema')) {
    return 'MALFORMED';
  }
  return 'ERROR';
}

export class CopilotService {
  constructor(options = {}) {
    this.cliPath = options.cliPath || resolveCliPath();
    this.timeoutMs = options.timeoutMs || 30000;
    this.client = null;
    this.isStarted = false;
    this._queue = Promise.resolve();
  }

  /**
   * Initializes and starts the CopilotClient process.
   */
  async start() {
    if (this.isStarted && this.client) {
      return;
    }

    try {
      const clientOptions = {
        cliPath: this.cliPath,
        useStdio: true,
        logLevel: process.env.COPILOT_LOG_LEVEL || 'error',
        useLoggedInUser: true
      };

      // Support optional token override if provided via environment
      if (process.env.COPILOT_GITHUB_TOKEN) {
        clientOptions.githubToken = process.env.COPILOT_GITHUB_TOKEN;
        clientOptions.useLoggedInUser = false;
      }

      this.client = new CopilotClient(clientOptions);
      await this.client.start();
      this.isStarted = true;
    } catch (err) {
      this.isStarted = false;
      this.client = null;
      const customErr = new Error(`Failed to initialize Copilot client: ${sanitizeErrorMessage(err)}`);
      customErr.errorType = categorizeCopilotError(err);
      throw customErr;
    }
  }

  /**
   * Retrieves sanitized authentication status from the Copilot CLI runtime.
   */
  async getAuthStatus() {
    if (!this.isStarted || !this.client) {
      await this.start();
    }

    try {
      const status = await this.client.getAuthStatus();
      return {
        isAuthenticated: !!status.isAuthenticated,
        authType: status.authType || 'unknown',
        login: status.login || null,
        statusMessage: status.statusMessage || null
      };
    } catch (err) {
      const customErr = new Error(`Failed to check Copilot auth status: ${sanitizeErrorMessage(err)}`);
      customErr.errorType = categorizeCopilotError(err);
      throw customErr;
    }
  }

  /**
   * Internal session prompt executor that subscribes to both assistant.message and
   * session.idle to prevent dropped completion signals or hung requests.
   *
   * @param {string} prompt - Prompt text to send.
   * @param {number} timeout - Effective timeout in ms.
   * @param {object} options - Options (model).
   * @returns {Promise<string>}
   */
  async _executePromptInSession(prompt, timeout, options = {}) {
    let session = null;
    let unsubscribe = null;
    let timeoutTimer = null;
    let settlingTimer = null;

    try {
      session = await this.client.createSession({
        model: options.model || undefined
      });

      let lastAssistantMessage = null;
      let isDone = false;
      let finishResolve = null;
      let finishReject = null;

      const completionPromise = new Promise((resolve, reject) => {
        finishResolve = resolve;
        finishReject = reject;
      });

      unsubscribe = session.on((event) => {
        if (event.type === 'assistant.message') {
          const text = event.data?.content;
          if (text && typeof text === 'string' && text.trim().length > 0) {
            lastAssistantMessage = event;
            // Assistant has emitted a non-empty response. Start a short grace settling window for session.idle
            if (!settlingTimer) {
              settlingTimer = setTimeout(() => {
                if (!isDone && lastAssistantMessage) {
                  isDone = true;
                  finishResolve(lastAssistantMessage);
                }
              }, 800);
            }
          }
        } else if (event.type === 'session.idle') {
          if (settlingTimer) clearTimeout(settlingTimer);
          if (!isDone && lastAssistantMessage && lastAssistantMessage.data?.content?.trim()) {
            isDone = true;
            finishResolve(lastAssistantMessage);
          }
        } else if (event.type === 'session.error') {
          if (settlingTimer) clearTimeout(settlingTimer);
          if (!isDone) {
            isDone = true;
            finishReject(new Error(event.data?.message || 'Session error reported by Copilot CLI'));
          }
        }
      });

      const timeoutPromise = new Promise((_, reject) => {
        timeoutTimer = setTimeout(() => {
          if (settlingTimer) clearTimeout(settlingTimer);
          // If assistant.message arrived before timeout, return it rather than failing
          if (lastAssistantMessage) {
            isDone = true;
            finishResolve(lastAssistantMessage);
          } else {
            isDone = true;
            reject(new Error(`Timeout after ${timeout}ms waiting for session.idle`));
          }
        }, timeout);
      });

      await session.send({ prompt: prompt.trim() });
      const result = await Promise.race([completionPromise, timeoutPromise]);
      const content = result?.data?.content;
      if (!content || typeof content !== 'string' || content.trim() === '') {
        throw new Error('Copilot returned an empty response.');
      }

      return content.trim();
    } finally {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      if (settlingTimer) clearTimeout(settlingTimer);
      if (unsubscribe) {
        try { unsubscribe(); } catch (_) {}
      }
      if (session) {
        try { await session.destroy(); } catch (_) {}
      }
    }
  }

  /**
   * Submits a prompt to a single-use session, waits for the response,
   * serializes requests to protect the CLI process, and cleanly destroys the session.
   *
   * @param {string} prompt - Prompt text to send.
   * @param {object} [options] - Optional prompt settings (model, timeoutMs, retries).
   * @returns {Promise<string>} - Text generated by the model.
   */
  async generateResponse(prompt, options = {}) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim() === '') {
      throw new Error('Prompt must be a non-empty string');
    }

    // Explicit Mock Mode for automated tests/CI (never used during real connection runs)
    if (process.env.COPILOT_MOCK === 'true') {
      if (prompt.includes('REQUIRED JSON SCHEMA')) {
        return JSON.stringify({
          issue: "Optimized Image Dimensions and Layout Space",
          metric: "CLS",
          explanation: "Image elements rendered without fixed dimensions trigger visual shifts when assets load asynchronously.",
          rootCause: "Browser cannot determine the aspect ratio prior to asset loading.",
          evidence: ["Static check detected missing width/height attributes", "Synthetic lab recorded shift score 0.12"],
          recommendations: [
            "Add explicit width and height attributes to the image tag",
            "Define CSS aspect-ratio on the container"
          ],
          whyItHelps: "Reserving layout bounds before assets load avoids browser reflows and eliminates visual shifts.",
          verificationProcedure: "Verify in Chrome DevTools Performance panel under Layout Shifts.",
          alternativeHypotheses: ["Late stylesheet application causing container reflow"],
          confidence: "HIGH",
          confidenceReason: "Direct AST code coordinates matched the layout shift element.",
          affectedFiles: [{ file: "src/components/Hero.jsx", line: 25 }],
          proposedChanges: "<img width={1200} height={600} src=\"/images/banner.jpg\" />",
          limitations: ["Assumes 16:9 banner aspect ratio."]
        });
      }
      return `[MOCK COPILOT RESPONSE] Synthesized analysis for: "${prompt.slice(0, 60)}..."`;
    }

    const run = async () => {
      if (!this.isStarted || !this.client) {
        await this.start();
      }

      const timeout = options.timeoutMs || this.timeoutMs;
      const maxRetries = options.retries !== undefined ? options.retries : 1;
      let lastError = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await this._executePromptInSession(prompt, timeout, options);
        } catch (err) {
          lastError = err;
          const errType = categorizeCopilotError(err);
          // Only retry transient failures (e.g. TIMEOUT or UNAVAILABLE)
          const isTransient = (errType === 'TIMEOUT' || errType === 'UNAVAILABLE');
          if (attempt < maxRetries && isTransient) {
            await new Promise(r => setTimeout(r, 600));
            continue;
          }
          break;
        }
      }

      const sanitized = sanitizeErrorMessage(lastError);
      const customErr = new Error(`Copilot request failed: ${sanitized}`);
      customErr.errorType = categorizeCopilotError(lastError);
      throw customErr;
    };

    // Serialize requests through sequential queue to prevent stdio pipe contention
    const queued = this._queue.then(run, run);
    this._queue = queued.catch(() => {});
    return queued;
  }

  /**
   * Gracefully shuts down the client and CLI subprocess.
   */
  async stop() {
    if (!this.client) {
      this.isStarted = false;
      return;
    }

    try {
      await this.client.stop();
    } catch (err) {
      // If graceful stop fails, fallback to force stop
      try {
        await this.client.forceStop();
      } catch (_) {
        // Suppress secondary cleanup error
      }
    } finally {
      this.client = null;
      this.isStarted = false;
    }
  }
}

/**
 * Convenience helper to execute a one-shot Copilot prompt with automatic lifecycle management.
 */
export async function askCopilot(prompt, options = {}) {
  const service = new CopilotService(options);
  try {
    await service.start();
    return await service.generateResponse(prompt, options);
  } finally {
    await service.stop();
  }
}
