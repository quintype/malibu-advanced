import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, exec } from 'child_process';
import { CopilotService } from './services/copilotService.js';
import { analyzeIssueWithCopilot, enrichAuditWithCopilot } from './analyzers/aiAdvisor.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let currentPort = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
};

// In-flight report enrichment tracking for deduplication
const inFlightEnrichments = new Map();

const server = http.createServer((req, res) => {
  // 1. Enforce local loopback connections by default
  const remoteAddress = req.socket?.remoteAddress;
  const isLoopback = remoteAddress === '127.0.0.1' ||
                     remoteAddress === '::1' ||
                     remoteAddress === '::ffff:127.0.0.1';

  if (!isLoopback && process.env.ALLOW_REMOTE_ACCESS !== 'true') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Forbidden: Local loopback connections only. Set ALLOW_REMOTE_ACCESS=true to enable remote access.' }));
    return;
  }

  // 2. Enforce local-origin access control: block non-local or opaque origins
  const origin = req.headers.origin;
  if (origin) {
    if (origin === 'null') {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Forbidden: Null or opaque origin is not permitted' }));
      return;
    }
    try {
      const originUrl = new URL(origin);
      if (originUrl.hostname !== 'localhost' && originUrl.hostname !== '127.0.0.1') {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Forbidden: Cross-origin access blocked' }));
        return;
      }
    } catch (_) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Invalid Origin header');
      return;
    }
  }

  // 3. Block cross-site requests via Sec-Fetch-Site (modern browsers)
  if (req.headers['sec-fetch-site'] === 'cross-site') {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Forbidden: Cross-site request blocked' }));
    return;
  }

  // 4. Validate Host header to guard against DNS rebinding attacks
  const host = req.headers.host;
  if (host && !process.env.ALLOW_REMOTE_HOSTS && process.env.ALLOW_REMOTE_ACCESS !== 'true') {
    const hostName = host.split(':')[0].toLowerCase();
    if (hostName !== 'localhost' && hostName !== '127.0.0.1' && !hostName.endsWith('.localhost')) {
      res.writeHead(403, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Forbidden: Untrusted Host header' }));
      return;
    }
  }

  const decodedUrl = decodeURIComponent(req.url);
  const parsedUrl = new URL(decodedUrl, `http://localhost:${currentPort}`);
  const pathname = parsedUrl.pathname;

  // Handle run-audit EventSource stream
  if (pathname === '/run-audit') {
    const rawProject = parsedUrl.searchParams.get('project');
    const auditUrlInput = parsedUrl.searchParams.get('url');

    const parentDir = getProjectsParentDir(rawProject);
    const project = normalizeProjectInput(rawProject, parentDir);

    if (!project || !isSafeProjectName(project, parentDir)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid or unsafe project parameter' }));
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const absoluteProjectPath = path.resolve(parentDir, project);
    
    // Spawn the audit.js script
    const scriptPath = path.join(__dirname, 'audit.js');
    const args = [scriptPath, absoluteProjectPath];
    if (auditUrlInput && auditUrlInput.trim() !== '') {
      args.push('--url', auditUrlInput.trim());
    }

    const child = spawn('node', args, {
      env: { ...process.env, FORCE_COLOR: '1' }
    });

    child.stdout.on('data', (data) => {
      res.write(`data: ${data.toString()}\n\n`);
    });

    child.stderr.on('data', (data) => {
      res.write(`data: ${data.toString()}\n\n`);
    });

    child.on('close', (code) => {
      // Find the latest generated HTML report in the project's reports folder
      const reportsDir = path.join(absoluteProjectPath, 'reports');
      let latestReport = '';
      if (fs.existsSync(reportsDir)) {
        const files = fs.readdirSync(reportsDir)
          .filter(f => f.endsWith('.html'))
          .sort((a, b) => b.localeCompare(a));
        if (files.length > 0) {
          latestReport = `/reports-view?project=${encodeURIComponent(project)}&file=${encodeURIComponent(files[0])}`;
        }
      }
      res.write(`data: [COMPLETE]${latestReport}\n\n`);
      res.end();
    });

    return;
  }

  // Handle reports-view mapping
  if (pathname === '/reports-view') {
    const rawProject = parsedUrl.searchParams.get('project');
    const filename = parsedUrl.searchParams.get('file');

    const parentDir = getProjectsParentDir(rawProject);
    const project = normalizeProjectInput(rawProject, parentDir);

    if (!project || !filename || !isSafeProjectName(project, parentDir) || !isSafeReportFile(filename)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Invalid project or report file parameter' }));
      return;
    }

    const absoluteProjectPath = path.resolve(parentDir, project);
    const reportsDir = path.join(absoluteProjectPath, 'reports');
    const filePath = path.join(reportsDir, filename);

    try {
      const realFilePath = fs.realpathSync(filePath);
      const realReportsDir = fs.realpathSync(reportsDir);
      if (!realFilePath.startsWith(realReportsDir)) {
        res.writeHead(403, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Access denied: File escapes reports directory' }));
        return;
      }
    } catch (_) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      
      res.writeHead(200, { 'Content-Type': contentType });
      fs.createReadStream(filePath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
    return;
  }

  // API Endpoint: /api/select-folder
  if (pathname === '/api/select-folder') {
    // Execute AppleScript to open directory chooser on macOS
    const script = `osascript -e 'POSIX path of (choose folder with prompt "Select a project folder:")'`;
    exec(script, (err, stdout, stderr) => {
      if (err) {
        // If user cancels or if we are not on macOS, return cancelled
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ cancelled: true }));
        return;
      }
      const selectedPath = stdout.trim().replace(/\/+$/, '');
      const parentDir = getProjectsParentDir(selectedPath);
      const projectName = (selectedPath.startsWith(parentDir) ? path.relative(parentDir, selectedPath) : null) || path.basename(selectedPath);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ path: projectName, fullPath: selectedPath }));
    });
    return;
  }

  // API Endpoint: /api/projects
  if (pathname === '/api/projects') {
    const parentDir = getProjectsParentDir();
    try {
      const directories = fs.readdirSync(parentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ projects: directories }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
    return;
  }

  // API Endpoint: /api/reports
  if (pathname === '/api/reports') {
    const parentDir = getProjectsParentDir();
    const reportsList = [];
    try {
      const directories = fs.readdirSync(parentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);

      directories.forEach(proj => {
        const reportsDir = path.join(parentDir, proj, 'reports');
        if (fs.existsSync(reportsDir) && fs.statSync(reportsDir).isDirectory()) {
          const files = fs.readdirSync(reportsDir)
            .filter(f => (f.endsWith('.html') || f.endsWith('.pdf')) && !f.startsWith('e2e'))
            .sort((a, b) => b.localeCompare(a));

          if (files.length > 0) {
            const runsMap = {};
            files.forEach(file => {
              const match = file.match(/report-(\d+)\.(html|pdf)/);
              if (match) {
                const timestamp = match[1];
                const type = match[2];
                if (!runsMap[timestamp]) {
                  runsMap[timestamp] = {
                    timestamp: parseInt(timestamp),
                    html: null,
                    pdf: null,
                    pdfAiEnriched: false
                  };
                }
                runsMap[timestamp][type] = `/reports-view?project=${encodeURIComponent(proj)}&file=${encodeURIComponent(file)}`;

                // Inspect companion JSON to determine if PDF includes AI advice or reflects initial baseline
                const compJsonPath = path.join(reportsDir, `report-${timestamp}.json`);
                if (fs.existsSync(compJsonPath)) {
                  try {
                    const parsedJson = JSON.parse(fs.readFileSync(compJsonPath, 'utf8'));
                    runsMap[timestamp].pdfAiEnriched = Boolean(parsedJson?.pdfStatus?.aiEnriched);
                  } catch (_) {}
                }
              }
            });
            const runs = Object.values(runsMap).sort((a, b) => b.timestamp - a.timestamp);
            if (runs.length > 0) {
              reportsList.push({
                project: proj,
                runs: runs
              });
            }
          }
        }
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ reports: reportsList }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
    return;
  }

  // API Endpoint: /api/ai-advice (GitHub Copilot CWV Advisor)
  if (pathname === '/api/ai-advice') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed' });
      return;
    }

    let body = '';
    const MAX_PAYLOAD_BYTES = 64 * 1024; // 64 KB safety bound
    let exceeded = false;

    req.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_PAYLOAD_BYTES) {
        exceeded = true;
        sendJsonResponse(res, 413, { success: false, error: 'Payload Too Large (maximum 64KB)' });
        req.destroy();
      }
    });

    req.on('end', async () => {
      if (exceeded) return;

      let payload;
      try {
        payload = JSON.parse(body || '{}');
      } catch (_) {
        sendJsonResponse(res, 400, { success: false, error: 'Invalid JSON payload' });
        return;
      }

      if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        sendJsonResponse(res, 400, { success: false, error: 'Request body must be a JSON object' });
        return;
      }

      const parentDir = path.dirname(__dirname);
      let issueToAnalyze = null;
      let targetContext = {};

      if (payload.context && typeof payload.context === 'object') {
        if (typeof payload.context.url === 'string') {
          targetContext.url = payload.context.url.slice(0, 500);
        }
      }

      // Approach 1: Reuse existing audit result via project + reportFile + issueIndex
      if (payload.project || payload.reportFile || payload.issueIndex !== undefined) {
        const { project: rawProject, reportFile, issueIndex } = payload;
        const parentDir = getProjectsParentDir(rawProject);
        const project = normalizeProjectInput(rawProject, parentDir);

        if (!isSafeProjectName(project, parentDir)) {
          sendJsonResponse(res, 400, { success: false, error: 'Invalid or unsafe project parameter' });
          return;
        }

        if (!isSafeReportFile(reportFile)) {
          sendJsonResponse(res, 400, { success: false, error: 'Invalid reportFile format (expected report-<timestamp>.json or .html)' });
          return;
        }

        const idx = Number(issueIndex);
        if (!Number.isInteger(idx) || idx < 0 || idx > 1000) {
          sendJsonResponse(res, 400, { success: false, error: 'Invalid issueIndex: must be an integer between 0 and 1000' });
          return;
        }

        const jsonFilename = reportFile.endsWith('.html') ? reportFile.replace(/\.html$/, '.json') : reportFile;
        const reportPath = path.join(parentDir, project, 'reports', jsonFilename);

        if (fs.existsSync(reportPath)) {
          try {
            const fileData = fs.readFileSync(reportPath, 'utf8');
            const parsedReport = JSON.parse(fileData);
            const issuesList = parsedReport.issues || (parsedReport.compiledResult && parsedReport.compiledResult.issues);

            if (Array.isArray(issuesList) && idx < issuesList.length) {
              issueToAnalyze = issuesList[idx];
              if (parsedReport.url && !targetContext.url) {
                targetContext.url = parsedReport.url;
              }
            } else {
              sendJsonResponse(res, 404, { success: false, error: `Issue index ${idx} out of range in report` });
              return;
            }
          } catch (readErr) {
            sendJsonResponse(res, 500, { success: false, error: 'Failed to read existing report file' });
            return;
          }
        } else if (payload.issue) {
          // If the .json companion wasn't created yet for an older report, fallback to validated issue in payload
          issueToAnalyze = validateIssueInput(payload.issue);
          if (!issueToAnalyze) {
            sendJsonResponse(res, 400, { success: false, error: 'Report file not found and issue payload is invalid' });
            return;
          }
        } else {
          sendJsonResponse(res, 404, { success: false, error: `Report file "${jsonFilename}" not found for project "${project}"` });
          return;
        }
      } else if (payload.issue) {
        // Approach 2: Directly analyzed validated issue object
        issueToAnalyze = validateIssueInput(payload.issue);
        if (!issueToAnalyze) {
          sendJsonResponse(res, 400, { success: false, error: 'Invalid issue object: missing required "message" property' });
          return;
        }
      } else {
        sendJsonResponse(res, 400, {
          success: false,
          error: 'Must provide either a valid issue object or (project, reportFile, issueIndex) reference.'
        });
        return;
      }

      // Invoke Copilot AI Advisor
      try {
        const copilot = getCopilotService();
        const advice = await analyzeIssueWithCopilot(issueToAnalyze, copilot, {
          timeoutMs: 35000,
          context: targetContext
        });

        if (payload.project && payload.reportFile && payload.issueIndex !== undefined) {
          try {
            const jsonFilename = payload.reportFile.endsWith('.html') ? payload.reportFile.replace(/\.html$/, '.json') : payload.reportFile;
            const rPath = path.join(parentDir, payload.project, 'reports', jsonFilename);
            if (fs.existsSync(rPath)) {
              const fileData = fs.readFileSync(rPath, 'utf8');
              const reportJson = JSON.parse(fileData);
              const list = reportJson.issues || (reportJson.compiledResult && reportJson.compiledResult.issues);
              if (Array.isArray(list) && list[payload.issueIndex]) {
                list[payload.issueIndex].aiAdvice = advice;
                list[payload.issueIndex].aiStatus = 'completed';

                // Preserve existing aiEnriched state if initial PDF contained synchronous advice,
                // but mark synchronization as false since JSON/HTML now has subsequent changes
                const wasPdfInitiallyEnriched = Boolean(reportJson.pdfStatus?.aiEnriched);
                reportJson.pdfStatus = {
                  generated: true,
                  aiEnriched: wasPdfInitiallyEnriched,
                  synchronized: false,
                  notice: wasPdfInitiallyEnriched
                    ? 'Saved PDF includes initial AI recommendations, but is not synchronized with later single-issue updates. Use browser Print to PDF to export latest advice.'
                    : 'Saved PDF reflects the initial audit baseline without AI advice. Use browser Print to PDF to export updated advice.'
                };
                if (reportJson.aiAdvisor) {
                  reportJson.aiAdvisor.pdfSynchronized = false;
                }

                fs.writeFileSync(rPath, JSON.stringify(reportJson, null, 2));
              }
            }
          } catch (_) {
            // Non-critical background save error
          }
        }

        sendJsonResponse(res, 200, {
          success: true,
          advice
        });
      } catch (err) {
        const sanitizedMsg = sanitizeServiceError(err);
        const isClientFailure = sanitizedMsg.includes('initialize') || sanitizedMsg.includes('auth');
        const isTimeout = sanitizedMsg.includes('timed out');
        const statusCode = isClientFailure || isTimeout ? 503 : 500;

        sendJsonResponse(res, statusCode, {
          success: false,
          error: 'Failed to generate Copilot advice',
          message: sanitizedMsg
        });
      }
    });

    return;
  }

  // API Endpoint: /api/enrich-report (Auto-enrich entire report with Copilot advice)
  if (pathname === '/api/enrich-report') {
    if (req.method !== 'POST') {
      sendJsonResponse(res, 405, { success: false, error: 'Method Not Allowed' });
      return;
    }

    let body = '';
    const MAX_PAYLOAD_BYTES = 64 * 1024;
    let exceeded = false;

    req.on('data', chunk => {
      body += chunk;
      if (body.length > MAX_PAYLOAD_BYTES) {
        exceeded = true;
        sendJsonResponse(res, 413, { success: false, error: 'Payload Too Large (maximum 64KB)' });
        req.destroy();
      }
    });

    req.on('end', async () => {
      if (exceeded) return;

      let payload;
      try {
        payload = JSON.parse(body || '{}');
      } catch (_) {
        sendJsonResponse(res, 400, { success: false, error: 'Invalid JSON payload' });
        return;
      }

      const { project: rawProject, reportFile } = payload || {};
      const parentDir = getProjectsParentDir(rawProject);
      const project = normalizeProjectInput(rawProject, parentDir);

      if (!isSafeProjectName(project, parentDir)) {
        sendJsonResponse(res, 400, { success: false, error: 'Invalid or unsafe project parameter' });
        return;
      }

      if (!isSafeReportFile(reportFile)) {
        sendJsonResponse(res, 400, { success: false, error: 'Invalid reportFile format (expected report-<timestamp>.json or .html)' });
        return;
      }

      const jsonFilename = reportFile.endsWith('.html') ? reportFile.replace(/\.html$/, '.json') : reportFile;
      const reportPath = path.join(parentDir, project, 'reports', jsonFilename);

      if (!fs.existsSync(reportPath)) {
        sendJsonResponse(res, 404, { success: false, error: `Report file "${jsonFilename}" not found` });
        return;
      }

      // Check if enrichment for this report is already running (deduplication)
      const enrichmentKey = `${project}:${jsonFilename}`;
      if (inFlightEnrichments.has(enrichmentKey)) {
        try {
          const result = await inFlightEnrichments.get(enrichmentKey);
          sendJsonResponse(res, 200, result);
        } catch (err) {
          sendJsonResponse(res, 500, { success: false, error: 'In-flight enrichment failed' });
        }
        return;
      }

      const enrichmentPromise = (async () => {
        const fileContent = fs.readFileSync(reportPath, 'utf8');
        const parsedReport = JSON.parse(fileContent);

        // Check if report is already fully completed
        if (parsedReport.aiAdvisor && parsedReport.aiAdvisor.status === 'completed') {
          return {
            success: true,
            aiAdvisor: parsedReport.aiAdvisor,
            pdfStatus: parsedReport.pdfStatus,
            issues: parsedReport.issues || (parsedReport.compiledResult && parsedReport.compiledResult.issues) || []
          };
        }

        const issuesList = parsedReport.issues || (parsedReport.compiledResult && parsedReport.compiledResult.issues) || [];
        const compiledResult = {
          scores: parsedReport.scores,
          issues: issuesList,
          summary: parsedReport.summary
        };

        const copilot = getCopilotService();
        const maxIssues = Math.min(10, Math.max(1, Number(payload.maxIssues) || 5));
        const enriched = await enrichAuditWithCopilot(compiledResult, {
          copilotService: copilot,
          url: parsedReport.url,
          maxIssues
        });

        // Update JSON file on disk with clear PDF status distinction
        parsedReport.issues = enriched.issues;
        parsedReport.aiAdvisor = {
          ...enriched.aiAdvisor,
          pdfSynchronized: false
        };
        const wasPdfInitiallyEnriched = Boolean(parsedReport.pdfStatus?.aiEnriched);
        parsedReport.pdfStatus = {
          generated: true,
          aiEnriched: wasPdfInitiallyEnriched,
          synchronized: false,
          notice: wasPdfInitiallyEnriched
            ? 'Saved PDF includes initial AI recommendations, but is not synchronized with post-audit enrichment. Use browser Print to PDF to export latest advice.'
            : 'Saved PDF reflects the initial audit baseline without AI advice. Use browser Print to PDF to export updated advice.'
        };
        fs.writeFileSync(reportPath, JSON.stringify(parsedReport, null, 2));

        return {
          success: true,
          aiAdvisor: parsedReport.aiAdvisor,
          pdfStatus: parsedReport.pdfStatus,
          issues: enriched.issues
        };
      })();

      inFlightEnrichments.set(enrichmentKey, enrichmentPromise);

      try {
        const result = await enrichmentPromise;
        sendJsonResponse(res, 200, result);
      } catch (err) {
        const sanitizedMsg = sanitizeServiceError(err);
        sendJsonResponse(res, 500, { success: false, error: sanitizedMsg });
      } finally {
        inFlightEnrichments.delete(enrichmentKey);
      }
    });

    return;
  }

  // Serve static dashboard assets from cwv-inspector/dashboard/
  let targetPath = pathname === '/' || pathname === '/index.html' ? '/index.html' : pathname;
  const localFilePath = path.join(__dirname, 'dashboard', targetPath);

  if (fs.existsSync(localFilePath) && fs.statSync(localFilePath).isFile()) {
    const ext = path.extname(localFilePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(localFilePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

/**
 * Shared Copilot Service singleton instance
 */
let copilotServiceInstance = null;
export function getCopilotService() {
  if (!copilotServiceInstance) {
    copilotServiceInstance = new CopilotService();
  }
  return copilotServiceInstance;
}

export function resetCopilotService() {
  if (copilotServiceInstance) {
    copilotServiceInstance.stop().catch(() => {});
    copilotServiceInstance = null;
  }
}

/**
 * Helper to safely send JSON response with standard security headers
 */
function sendJsonResponse(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'X-Content-Type-Options': 'nosniff'
  });
  res.end(JSON.stringify(data));
}

/**
 * Resolves the root directory containing project folders.
 * Checks PROJECTS_DIR env var, enclosing workspace root (if inside subproject),
 * or falls back to one level up.
 */
function getProjectsParentDir(project = null) {
  if (process.env.PROJECTS_DIR && fs.existsSync(process.env.PROJECTS_DIR)) {
    return path.resolve(process.env.PROJECTS_DIR);
  }
  const oneUp = path.dirname(__dirname);
  const twoUp = path.dirname(oneUp);

  if (project && typeof project === 'string') {
    const clean = project.trim().replace(/\/+$/, '');
    if (path.isAbsolute(clean)) {
      if (clean.startsWith(twoUp) && fs.existsSync(clean)) return twoUp;
      if (clean.startsWith(oneUp) && fs.existsSync(clean)) return oneUp;
    } else if (!clean.includes('..')) {
      if (fs.existsSync(path.resolve(twoUp, clean))) return twoUp;
      if (fs.existsSync(path.resolve(oneUp, clean))) return oneUp;
    }
  }

  // If oneUp is a project itself (e.g. malibu-advanced with a package.json)
  if (fs.existsSync(path.join(oneUp, 'package.json')) && path.basename(oneUp) !== 'cwv-inspector') {
    return twoUp;
  }
  return oneUp;
}

/**
 * Normalizes project input (supports absolute paths inside parentDir and relative project names).
 */
function normalizeProjectInput(project, parentDir) {
  if (!project || typeof project !== 'string') return '';
  const clean = project.trim().replace(/\/+$/, '');
  if (path.isAbsolute(clean)) {
    if (clean.startsWith(parentDir)) {
      return path.relative(parentDir, clean);
    }
  }
  return clean;
}

/**
 * Validates that project directory name is safe and exists within parent directory
 */
function isSafeProjectName(project, parentDir) {
  if (typeof project !== 'string' || !project.trim()) return false;
  if (project.includes('..') || project.includes('/') || project.includes('\\') || project.includes('\0')) {
    return false;
  }
  const resolved = path.resolve(parentDir, project);
  if (!resolved.startsWith(parentDir)) return false;
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) return false;
  try {
    const realTarget = fs.realpathSync(resolved);
    const realParent = fs.realpathSync(parentDir);
    if (!realTarget.startsWith(realParent)) {
      return false;
    }
  } catch (_) {
    return false;
  }
  return true;
}

/**
 * Validates report filename pattern
 */
function isSafeReportFile(filename) {
  if (typeof filename !== 'string') return false;
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..') || filename.includes('\0')) return false;
  return /^report-\d+\.(json|html|pdf)$/.test(filename);
}

/**
 * Validates and sanitizes issue payload to prevent arbitrary prompt injection or excess size
 */
function validateIssueInput(issue) {
  if (!issue || typeof issue !== 'object' || Array.isArray(issue)) return null;
  if (typeof issue.message !== 'string' || !issue.message.trim() || issue.message.length > 500) {
    return null;
  }

  const sanitized = {
    message: String(issue.message).trim().slice(0, 500),
    cwv: issue.cwv ? String(issue.cwv).trim().slice(0, 20) : 'General',
    severity: issue.severity ? String(issue.severity).trim().slice(0, 20) : 'medium',
    type: issue.type ? String(issue.type).trim().slice(0, 50) : 'code',
    file: issue.file ? String(issue.file).trim().slice(0, 500) : 'Unknown file',
    line: issue.line !== undefined && issue.line !== null ? issue.line : '-',
    impact: issue.impact ? String(issue.impact).slice(0, 2000) : '',
    suggestion: issue.suggestion ? String(issue.suggestion).slice(0, 2000) : '',
    selector: issue.selector ? String(issue.selector).slice(0, 1000) : null,
    snippet: issue.snippet ? String(issue.snippet).slice(0, 2000) : null,
    score: typeof issue.score === 'number' ? issue.score : null,
    confidence: issue.confidence ? String(issue.confidence).slice(0, 30) : null,
    correlationState: issue.correlationState ? String(issue.correlationState).slice(0, 30) : null,
    inpPhase: issue.inpPhase ? String(issue.inpPhase).slice(0, 50) : null,
    callChainString: issue.callChainString ? String(issue.callChainString).slice(0, 1000) : null
  };

  if (Array.isArray(issue.evidence)) {
    sanitized.evidence = issue.evidence.slice(0, 20).map(e => String(e).slice(0, 500));
  } else if (typeof issue.evidence === 'string') {
    sanitized.evidence = [issue.evidence.slice(0, 500)];
  }

  if (Array.isArray(issue.occurrences)) {
    sanitized.occurrences = issue.occurrences.slice(0, 20).map(o => ({
      file: String(o.file || '').slice(0, 500),
      line: o.line !== undefined ? o.line : '-'
    }));
  }

  return sanitized;
}

/**
 * Sanitizes errors to prevent credential or internal path leakage
 */
function sanitizeServiceError(err) {
  if (!err) return 'Unknown error occurred';
  const msg = typeof err === 'string' ? err : err.message || String(err);
  return msg
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, '[REDACTED_GITHUB_TOKEN]')
    .replace(/bearer\s+[A-Za-z0-9_.-]+/gi, 'Bearer [REDACTED_TOKEN]');
}

function startServer() {
  server.listen(currentPort);
}

server.on('listening', () => {
  console.log(`\n📶 Preview Server started successfully!`);
  console.log(`🌎 Open your browser and navigate to: http://localhost:${currentPort}\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`⚠️ Port ${currentPort} is already in use. Trying port ${currentPort + 1}...`);
    currentPort++;
    startServer();
  } else {
    console.error(`⚠️ Server error: ${err.message}`);
  }
});

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { server };

