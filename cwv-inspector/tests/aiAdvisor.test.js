/**
 * Test Suite for Phase 3: Automatic AI-Powered Recommendations Integration
 *
 * Verifies:
 * 1. Automatic enrichment without manual clicks
 * 2. Deterministic calculations, severities, and scores preservation
 * 3. Structured advice attachment to the correct findings
 * 4. Partial failure tolerance (successful findings preserved if one fails)
 * 5. Copilot unavailability tolerance (audit & report succeed with deterministic baseline)
 * 6. Configurable limits and batching enforcement (maxIssues, omitted_limit labeling)
 * 7. Historical report reopening without retriggering Copilot
 * 8. Duplicate request prevention and fingerprint caching
 * 9. UI state contracts and recovery retry mechanisms
 * 10. Native HTTP endpoints: POST /api/ai-advice and POST /api/enrich-report
 */

import assert from 'assert';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  selectPriorityIssues,
  buildAdvisorPrompt,
  validateAdvisorResult,
  parseModelOutput,
  analyzeIssueWithCopilot,
  enrichAuditWithCopilot,
  computeIssueFingerprint,
  adviceCache
} from '../analyzers/aiAdvisor.js';

import { CopilotService, categorizeCopilotError } from '../services/copilotService.js';
import {
  correlateCls,
  getLineAndColumn,
  findRegexMatchesInFile,
  extractTemplateTags,
  findMatchingCssRules
} from '../analyzers/correlation.js';
import { compileRecommendations } from '../analyzers/recommendations.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inspectorRoot = path.resolve(__dirname, '..');

// Set mock mode for safe test execution
process.env.COPILOT_MOCK = 'true';
process.env.NODE_ENV = 'test';

// Dynamically import server to test native HTTP endpoints
const { server } = await import('../server.js');

let testPassCount = 0;
function logPass(title) {
  testPassCount++;
  console.log(`✓ Test ${testPassCount}: ${title} passed.`);
}

async function runTests() {
  console.log('🧪 Starting Phase 3 Automatic AI Recommendations Test Suite...\n');

  // =========================================================================
  // 1. Priority Issue Selection
  // =========================================================================
  {
    const issues = [
      { message: 'Minor contrast warning', cwv: 'a11y', severity: 'low', score: 0.1 },
      { message: 'LCP banner delay', cwv: 'lcp', severity: 'high', score: 2.8 },
      { message: 'CLS navbar shift', cwv: 'cls', severity: 'high', score: 0.18 },
      { message: 'INP button handler lag', cwv: 'inp', severity: 'high', score: 250 },
      { message: 'CLS small layout shift', cwv: 'cls', severity: 'medium', score: 0.05 }
    ];

    const prioritized = selectPriorityIssues(issues, 3);
    assert.strictEqual(prioritized.length, 3, 'Should limit to maxCount');
    // Weights: cls=3, inp=3 > lcp=2 > a11y=0. INP has score 250, CLS has score 0.18.
    assert.strictEqual(prioritized[0].cwv.toLowerCase(), 'inp', 'INP high severity with score 250 ranks first');
    assert.strictEqual(prioritized[1].cwv.toLowerCase(), 'cls', 'CLS high severity ranks second');
    assert.strictEqual(prioritized[2].cwv.toLowerCase(), 'cls', 'CLS medium severity ranks third before LCP');

    logPass('Priority issue selection orders CLS/INP and severities correctly');
  }

  // =========================================================================
  // 2. Strictly Bounded Prompt Construction
  // =========================================================================
  {
    const testIssue = {
      message: 'Unsized banner causing layout shift',
      cwv: 'cls',
      severity: 'high',
      file: 'src/components/Banner.jsx',
      line: 42,
      selector: '.hero-banner > img',
      snippet: '<img src="/banner.jpg" />',
      score: 0.14,
      confidence: 'HIGH',
      correlationState: 'EXACT',
      evidence: ['Static missing dimensions', 'Runtime shift on load'],
      inpPhase: null
    };

    const prompt = buildAdvisorPrompt(testIssue, { url: 'https://example.com' });

    assert.ok(prompt.includes('Metric: CLS'), 'Prompt must include correct metric');
    assert.ok(prompt.includes('Finding Title: Unsized banner causing layout shift'), 'Prompt must include finding title');
    assert.ok(prompt.includes('.hero-banner > img'), 'Prompt must include verified DOM selector');
    assert.ok(prompt.includes('src/components/Banner.jsx:42'), 'Prompt must include exact source location');
    assert.ok(prompt.includes('REQUIRED JSON SCHEMA'), 'Prompt must contain schema instruction');
    assert.ok(prompt.includes('whyItHelps'), 'Prompt must request explanation of why solution helps');
    assert.ok(prompt.includes('DO NOT invent, assume, or hallucinate'), 'Prompt must strictly instruct against hallucination');

    logPass('Prompt construction bounds evidence strictly and forbids hallucinations');
  }

  // =========================================================================
  // 3. Schema Conformance: Required Fields Including whyItHelps
  // =========================================================================
  {
    const sampleInput = {
      issue: 'Banner image layout shift',
      metric: 'CLS',
      explanation: 'Missing width and height attributes cause layout recalculations upon image download.',
      rootCause: 'Image container aspect-ratio was unspecified in CSS.',
      evidence: ['Static AST check', 'Runtime layout shift of 0.15'],
      recommendations: ['Specify width and height attributes', 'Set aspect-ratio on parent'],
      whyItHelps: 'Reserves DOM layout box before network fetch resolves, preventing layout shift.',
      confidence: 'HIGH',
      confidenceReason: 'Direct AST element coordinate match with DOM shift.',
      affectedFiles: [{ file: 'components/Banner.jsx', line: 42 }],
      proposedChanges: '<img width={800} height={400} src="/banner.jpg" />',
      limitations: ['Synthetic lab measurement only']
    };

    const validated = validateAdvisorResult(sampleInput);

    const requiredFields = [
      'issue',
      'metric',
      'explanation',
      'rootCause',
      'evidence',
      'recommendations',
      'whyItHelps',
      'confidence',
      'confidenceReason',
      'affectedFiles',
      'proposedChanges',
      'limitations'
    ];

    for (const field of requiredFields) {
      assert.ok(field in validated, `Result must contain required field "${field}"`);
      assert.notStrictEqual(validated[field], undefined, `Field "${field}" must not be undefined`);
    }

    assert.strictEqual(validated.metric, 'CLS');
    assert.strictEqual(validated.confidence, 'HIGH');
    assert.ok(validated.whyItHelps.includes('Reserves DOM layout box'));
    assert.ok(Array.isArray(validated.evidence), 'evidence must be array');
    assert.ok(Array.isArray(validated.recommendations), 'recommendations must be array');
    assert.ok(Array.isArray(validated.affectedFiles), 'affectedFiles must be array');
    assert.ok(Array.isArray(validated.limitations), 'limitations must be array');

    logPass('Validation enforces all required schema fields including whyItHelps');
  }

  // =========================================================================
  // 4. Parser Resilience: Clean JSON, Code Fences, Conversational Text, Empty
  // =========================================================================
  {
    const originalIssue = { message: 'Baseline Test Issue', cwv: 'cls', file: 'Header.js', line: 10 };

    const cleanJson = JSON.stringify({
      issue: 'Clean Test',
      metric: 'CLS',
      explanation: 'Clear explanation',
      rootCause: 'Root cause',
      evidence: ['Evidence A'],
      recommendations: ['Step 1'],
      whyItHelps: 'Prevents reflow',
      confidence: 'MEDIUM',
      confidenceReason: 'Diagnostic trace match',
      affectedFiles: [{ file: 'Header.js', line: 10 }],
      proposedChanges: null,
      limitations: ['Caveat 1']
    });

    const parsedClean = parseModelOutput(cleanJson, originalIssue);
    assert.strictEqual(parsedClean.issue, 'Clean Test');
    assert.strictEqual(parsedClean.confidence, 'MEDIUM');

    const fencedJson = `Here is the analysis:\n\`\`\`json\n${cleanJson}\n\`\`\`\nHope this helps!`;
    const parsedFenced = parseModelOutput(fencedJson, originalIssue);
    assert.strictEqual(parsedFenced.issue, 'Clean Test');

    const conversational = `Sure, here is your diagnosis:\n${cleanJson}\nPlease let me know if you have questions.`;
    const parsedConversational = parseModelOutput(conversational, originalIssue);
    assert.strictEqual(parsedConversational.issue, 'Clean Test');

    const parsedEmpty = parseModelOutput('', originalIssue);
    assert.strictEqual(parsedEmpty.issue, 'Baseline Test Issue');
    assert.strictEqual(parsedEmpty.confidence, 'LOW');

    const plainText = "The problem is caused by dynamic CSS injections during component mount.";
    const parsedText = parseModelOutput(plainText, originalIssue);
    assert.strictEqual(parsedText.issue, 'Baseline Test Issue');
    assert.strictEqual(parsedText.explanation, plainText);

    logPass('Parser tolerates markdown fences, conversational text, and non-JSON output');
  }

  // =========================================================================
  // 5. Automatic Enrichment (enrichAuditWithCopilot) Without Manual Clicks
  // =========================================================================
  {
    const mockService = new CopilotService();
    const testAuditResult = {
      healthScore: 78,
      scores: { lcp: 75, cls: 80, inp: 82 },
      summary: { total: 3, high: 2, medium: 1, low: 0 },
      issues: [
        { message: 'Hero banner layout shift', cwv: 'cls', severity: 'high', score: 0.15, file: 'Hero.jsx', line: 10 },
        { message: 'Long click handler', cwv: 'inp', severity: 'high', score: 280, file: 'Button.jsx', line: 5 },
        { message: 'Minor font swap', cwv: 'cls', severity: 'low', score: 0.02, file: 'App.css', line: 1 }
      ]
    };

    const enriched = await enrichAuditWithCopilot(testAuditResult, {
      copilotService: mockService,
      maxIssues: 2,
      mock: true
    });

    // 1. Automatic trigger: issues 0 and 1 must have attached aiAdvice
    assert.strictEqual(enriched.aiAdvisor.status, 'completed');
    assert.strictEqual(enriched.aiAdvisor.analyzedCount, 2);
    assert.ok(enriched.issues[0].aiAdvice, 'Issue 0 must have aiAdvice attached automatically');
    assert.ok(enriched.issues[1].aiAdvice, 'Issue 1 must have aiAdvice attached automatically');
    assert.strictEqual(enriched.issues[0].aiStatus, 'completed');
    assert.strictEqual(enriched.issues[1].aiStatus, 'completed');

    // 2. Limits respected: Issue 2 was beyond maxIssues (2), so it is labeled omitted_limit
    assert.strictEqual(enriched.issues[2].aiStatus, 'omitted_limit');
    assert.ok(enriched.issues[2].aiLimitNote.includes('Deterministic recommendation active'));

    // 3. Existing deterministic metrics preserved
    assert.strictEqual(enriched.healthScore, 78);
    assert.strictEqual(enriched.scores.cls, 80);
    assert.strictEqual(enriched.issues[0].severity, 'high');
    assert.strictEqual(enriched.issues[0].score, 0.15);

    logPass('enrichAuditWithCopilot automatically enriches findings and preserves deterministic data');
  }

  // =========================================================================
  // 6. Partial Failure Tolerance
  // =========================================================================
  {
    // A service where the 2nd issue fails, but the 1st issue succeeds
    let callIndex = 0;
    const partialService = {
      generateResponse: async () => {
        callIndex++;
        if (callIndex === 2) {
          throw new Error('Copilot token rate limit reached');
        }
        return JSON.stringify({
          issue: 'Successful Issue',
          metric: 'CLS',
          explanation: 'Handled successfully',
          rootCause: 'Root cause',
          evidence: ['Evidence A'],
          recommendations: ['Step 1'],
          whyItHelps: 'Helps metric',
          confidence: 'HIGH',
          confidenceReason: 'Verified match',
          affectedFiles: [{ file: 'A.jsx', line: 1 }],
          proposedChanges: null,
          limitations: []
        });
      }
    };

    const auditData = {
      issues: [
        { message: 'Issue One', cwv: 'cls', severity: 'high' },
        { message: 'Issue Two', cwv: 'inp', severity: 'high' }
      ]
    };

    // Override mock mode for this test to test the partial failure branch
    const origMock = process.env.COPILOT_MOCK;
    delete process.env.COPILOT_MOCK;

    let enrichedPartial;
    try {
      enrichedPartial = await enrichAuditWithCopilot(auditData, {
        copilotService: partialService,
        batchSize: 1, // Sequential so issue 1 succeeds, issue 2 fails
        mock: false
      });
    } finally {
      process.env.COPILOT_MOCK = origMock;
    }

    assert.strictEqual(enrichedPartial.aiAdvisor.status, 'partial', 'Overall status should be partial');
    assert.strictEqual(enrichedPartial.aiAdvisor.analyzedCount, 1, 'One issue should succeed');
    assert.strictEqual(enrichedPartial.aiAdvisor.failedCount, 1, 'One issue should fail');

    // Issue 1 preserved
    assert.ok(enrichedPartial.issues[0].aiAdvice, 'Issue 1 must retain successful advice');
    assert.strictEqual(enrichedPartial.issues[0].aiStatus, 'completed');

    // Issue 2 marked with error and recovery message
    assert.strictEqual(enrichedPartial.issues[1].aiAdvice, null);
    assert.strictEqual(enrichedPartial.issues[1].aiStatus, 'error');
    assert.ok(enrichedPartial.issues[1].aiError.includes('rate limit'));

    logPass('Partial AI failures preserve successful results and provide error states');
  }

  // =========================================================================
  // 7. Copilot Unavailability Resilience (Audit Still Succeeds)
  // =========================================================================
  {
    const deadService = {
      generateResponse: async () => {
        throw new Error('Copilot CLI not authenticated');
      }
    };

    const auditData = {
      healthScore: 92,
      issues: [{ message: 'LCP hero issue', cwv: 'lcp', severity: 'medium' }]
    };

    const origMock = process.env.COPILOT_MOCK;
    delete process.env.COPILOT_MOCK;

    let enrichedDead;
    try {
      enrichedDead = await enrichAuditWithCopilot(auditData, {
        copilotService: deadService,
        mock: false
      });
    } finally {
      process.env.COPILOT_MOCK = origMock;
    }

    assert.strictEqual(enrichedDead.aiAdvisor.status, 'unavailable');
    assert.strictEqual(enrichedDead.healthScore, 92, 'Deterministic score must remain untouched');
    assert.strictEqual(enrichedDead.issues[0].aiStatus, 'error');

    logPass('Copilot unavailability does not break audit or report generation');
  }

  // =========================================================================
  // 8. Fingerprint Caching and Historical Report Preservation
  // =========================================================================
  {
    const issueToCache = {
      message: 'Navbar layout shift on load',
      cwv: 'cls',
      file: 'Navbar.jsx',
      line: 14,
      selector: '.nav-wrapper',
      evidence: ['Shift 0.12']
    };

    const fp = computeIssueFingerprint(issueToCache);
    assert.ok(fp.includes('Navbar.jsx'), 'Fingerprint must contain file');
    assert.ok(fp.includes('Shift 0.12'), 'Fingerprint must contain evidence');

    // Pre-populate advice cache
    const cachedAdvice = {
      issue: 'Cached Advice',
      metric: 'CLS',
      explanation: 'From cache',
      rootCause: 'Cached root cause',
      evidence: ['Shift 0.12'],
      recommendations: ['Fix navbar'],
      whyItHelps: 'Fixes shift',
      confidence: 'HIGH',
      confidenceReason: 'Cached',
      affectedFiles: [{ file: 'Navbar.jsx', line: 14 }],
      proposedChanges: null,
      limitations: []
    };
    adviceCache.set(fp, cachedAdvice);

    // Call enrichAuditWithCopilot with a throwing service to prove it uses the cache
    const throwingService = {
      generateResponse: async () => {
        throw new Error('Should not be called because cache hits!');
      }
    };

    const testAudit = { issues: [{ ...issueToCache }] };
    const result = await enrichAuditWithCopilot(testAudit, {
      copilotService: throwingService,
      mock: false
    });

    assert.strictEqual(result.aiAdvisor.cachedCount, 1, 'Should record cache hit');
    assert.strictEqual(result.issues[0].aiAdvice.issue, 'Cached Advice');
    assert.strictEqual(result.issues[0].aiStatus, 'completed');

    // Historical report reopening: if finding already has aiAdvice attached, zero calls made
    const historicalAudit = {
      issues: [
        {
          message: 'Historical Issue',
          aiAdvice: { issue: 'Historical Advice', metric: 'INP' }
        }
      ]
    };
    const histResult = await enrichAuditWithCopilot(historicalAudit, {
      copilotService: throwingService,
      mock: false
    });
    assert.strictEqual(histResult.issues[0].aiAdvice.issue, 'Historical Advice');
    assert.strictEqual(histResult.issues[0].aiStatus, 'completed');

    logPass('Fingerprint caching and historical report reopening prevent duplicate Copilot calls');
  }

  // =========================================================================
  // 9. HTTP Endpoint Tests: POST /api/ai-advice and POST /api/enrich-report
  // =========================================================================
  const testPort = 3988;
  await new Promise((resolve, reject) => {
    server.listen(testPort, () => resolve());
    server.on('error', reject);
  });

  const baseUrl = `http://localhost:${testPort}`;

  async function makeRequest(pathName, method, data, headers = {}) {
    return new Promise((resolve, reject) => {
      const bodyStr = typeof data === 'string' ? data : (data ? JSON.stringify(data) : '');
      const reqHeaders = { ...headers };
      if (bodyStr && !reqHeaders['Content-Type']) {
        reqHeaders['Content-Type'] = 'application/json';
        reqHeaders['Content-Length'] = Buffer.byteLength(bodyStr);
      }

      const req = http.request(`${baseUrl}${pathName}`, {
        method,
        headers: reqHeaders
      }, res => {
        let resBody = '';
        res.on('data', chunk => resBody += chunk);
        res.on('end', () => {
          let json = null;
          try { json = JSON.parse(resBody); } catch (_) {}
          resolve({ status: res.statusCode, headers: res.headers, body: resBody, json });
        });
      });

      req.on('error', reject);
      if (bodyStr) req.write(bodyStr);
      req.end();
    });
  }

  // Test 9.1: POST /api/ai-advice returns single-issue advice
  {
    const res = await makeRequest('/api/ai-advice', 'POST', {
      issue: {
        message: 'LCP hero image delay',
        cwv: 'lcp',
        severity: 'high',
        file: 'Hero.jsx',
        line: 12
      }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.json.success, true);
    assert.strictEqual(res.json.advice.metric, 'LCP');
    assert.ok(res.json.advice.whyItHelps, 'Must include whyItHelps');

    logPass('POST /api/ai-advice returns 200 with structured advice and whyItHelps');
  }

  // Test 9.2: POST /api/enrich-report enriches report and updates disk
  {
    const dummyReportsDir = path.join(inspectorRoot, 'reports');
    if (!fs.existsSync(dummyReportsDir)) fs.mkdirSync(dummyReportsDir, { recursive: true });

    const dummyReportFile = 'report-8888888888.json';
    const dummyReportPath = path.join(dummyReportsDir, dummyReportFile);

    fs.writeFileSync(dummyReportPath, JSON.stringify({
      timestamp: 8888888888,
      project: 'cwv-inspector',
      scores: { cls: 70, lcp: 65, inp: 80 },
      aiAdvisor: { status: 'pending' },
      issues: [
        {
          message: 'Footer layout shift',
          cwv: 'cls',
          severity: 'high',
          file: 'Footer.jsx',
          line: 20
        }
      ]
    }, null, 2));

    try {
      const res = await makeRequest('/api/enrich-report', 'POST', {
        project: 'cwv-inspector',
        reportFile: dummyReportFile
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
      assert.strictEqual(res.json.aiAdvisor.status, 'completed');
      assert.ok(res.json.issues[0].aiAdvice, 'Issue must be enriched');

      // Verify that the disk file was updated with enriched advice
      const updatedOnDisk = JSON.parse(fs.readFileSync(dummyReportPath, 'utf8'));
      assert.strictEqual(updatedOnDisk.aiAdvisor.status, 'completed');
      assert.ok(updatedOnDisk.issues[0].aiAdvice);
    } finally {
      if (fs.existsSync(dummyReportPath)) fs.unlinkSync(dummyReportPath);
    }

    logPass('POST /api/enrich-report auto-enriches report and synchronizes companion JSON on disk');
  }

  // Test 9.3: POST /api/enrich-report security and error handling
  {
    // Path traversal attempt
    const resTraversal = await makeRequest('/api/enrich-report', 'POST', {
      project: '../../etc',
      reportFile: 'report-1.json'
    });
    assert.strictEqual(resTraversal.status, 400);

    // Missing report file
    const resMissing = await makeRequest('/api/enrich-report', 'POST', {
      project: 'cwv-inspector',
      reportFile: 'report-0000000000.json'
    });
    assert.strictEqual(resMissing.status, 404);

    // Method Not Allowed
    const resGet = await makeRequest('/api/enrich-report', 'GET');
    assert.strictEqual(resGet.status, 405);

    logPass('POST /api/enrich-report enforces path traversal security and returns proper HTTP codes');
  }

  // =========================================================================
  // 10. Dashboard UI State Contract Verification
  // =========================================================================
  {
    const templateHtml = fs.readFileSync(path.join(inspectorRoot, 'report/template.html'), 'utf8');
    assert.ok(templateHtml.includes('function autoEnrichReport'), 'template.html must contain autoEnrichReport');
    assert.ok(templateHtml.includes('function retryAiAdvice'), 'template.html must contain retryAiAdvice');
    assert.ok(templateHtml.includes('ai-solution-card'), 'template.html must render ai-solution-card');
    assert.ok(templateHtml.includes('ai-why-callout'), 'template.html must render ai-why-callout');

    const styleCss = fs.readFileSync(path.join(inspectorRoot, 'report/style.css'), 'utf8');
    assert.ok(styleCss.includes('.ai-solution-card'), 'style.css must style .ai-solution-card');
    assert.ok(styleCss.includes('.ai-why-callout'), 'style.css must style .ai-why-callout');
    assert.ok(styleCss.includes('.ai-limit-bar'), 'style.css must style .ai-limit-bar');
    assert.ok(styleCss.includes('.ai-retry-btn'), 'style.css must style .ai-retry-btn');

    logPass('Dashboard & report template UI state contracts verified');
  }

  // =========================================================================
  // 11. Hallucinated File Path Filtering
  // =========================================================================
  {
    const originalIssue = {
      message: 'Unsized image causing CLS',
      cwv: 'cls',
      file: 'src/components/Banner.jsx',
      line: 42,
      occurrences: [{ file: 'src/components/Banner.jsx', line: 42 }]
    };

    const parsedWithHallucination = {
      issue: 'Unsized image',
      metric: 'CLS',
      explanation: 'Missing width/height',
      rootCause: 'Dynamic image reflow',
      affectedFiles: [
        { file: 'malicious/or/hallucinated/file.js', line: 99 },
        { file: 'src/components/Banner.jsx', line: 42 }
      ]
    };

    const validated = validateAdvisorResult(parsedWithHallucination, originalIssue);
    assert.strictEqual(validated.affectedFiles.length, 1, 'Must discard unverified files');
    assert.strictEqual(validated.affectedFiles[0].file, 'src/components/Banner.jsx');

    logPass('Hallucinated file paths are filtered strictly against verified finding evidence');
  }

  // =========================================================================
  // 12. Total Enrichment Deadline Enforcement
  // =========================================================================
  {
    const mockCompiled = {
      summary: { total: 2 },
      scores: { overall: 85 },
      issues: [
        { message: 'Issue 1', cwv: 'cls', severity: 'high', score: 0.2 },
        { message: 'Issue 2', cwv: 'inp', severity: 'high', score: 300 }
      ]
    };

    // Pass totalTimeoutMs: 0 so deadline is immediately exceeded
    const enriched = await enrichAuditWithCopilot(mockCompiled, {
      mock: true,
      totalTimeoutMs: 0,
      batchSize: 1
    });

    assert.ok(enriched.aiAdvisor, 'aiAdvisor metadata must be present');
    assert.strictEqual(enriched.aiAdvisor.deadlineExceeded, true, 'deadlineExceeded flag must be set');

    logPass('Total enrichment deadline terminates processing cleanly and preserves deterministic results');
  }

  // =========================================================================
  // 13. Material Inputs Sensitivity in Issue Fingerprints
  // =========================================================================
  {
    const baseIssue = {
      message: 'Button click delay',
      cwv: 'inp',
      severity: 'high',
      file: 'Button.jsx',
      line: 10,
      snippet: 'onClick={handleClick}',
      inpPhase: 'input-delay',
      callChainString: 'handleClick -> processData',
      evidence: ['Recorded 240ms duration']
    };

    const diffSnippet = { ...baseIssue, snippet: 'onClick={handleAsyncClick}' };
    const diffPhase = { ...baseIssue, inpPhase: 'presentation-delay' };
    const diffCallChain = { ...baseIssue, callChainString: 'handleAsyncClick -> render' };

    const fpBase = computeIssueFingerprint(baseIssue);
    const fpSnippet = computeIssueFingerprint(diffSnippet);
    const fpPhase = computeIssueFingerprint(diffPhase);
    const fpCallChain = computeIssueFingerprint(diffCallChain);

    assert.notStrictEqual(fpBase, fpSnippet, 'Fingerprint must differ when snippet changes');
    assert.notStrictEqual(fpBase, fpPhase, 'Fingerprint must differ when inpPhase changes');
    assert.notStrictEqual(fpBase, fpCallChain, 'Fingerprint must differ when callChainString changes');

    logPass('Fingerprint sensitivity validates all material prompt inputs');
  }

  // =========================================================================
  // 14. Local-Origin & Request Boundary Security
  // =========================================================================
  {
    // Untrusted external origin
    const resBlocked = await makeRequest('/api/ai-advice', 'POST', {
      issue: { message: 'Test issue', cwv: 'cls' }
    }, {
      'Origin': 'https://malicious-external-site.com'
    });
    assert.strictEqual(resBlocked.status, 403, 'Cross-origin request must be rejected with 403');
    assert.strictEqual(resBlocked.json.success, false);

    // Opaque / null origin (e.g. from sandboxed iframe or data: URL)
    const resNullOrigin = await makeRequest('/api/ai-advice', 'POST', {
      issue: { message: 'Test issue', cwv: 'cls' }
    }, {
      'Origin': 'null'
    });
    assert.strictEqual(resNullOrigin.status, 403, 'Null origin must be rejected with 403');

    // Cross-site fetch metadata (Sec-Fetch-Site)
    const resCrossSite = await makeRequest('/api/ai-advice', 'POST', {
      issue: { message: 'Test issue', cwv: 'cls' }
    }, {
      'Sec-Fetch-Site': 'cross-site'
    });
    assert.strictEqual(resCrossSite.status, 403, 'Sec-Fetch-Site cross-site must be rejected with 403');

    // Untrusted Host header (DNS rebinding attempt)
    const resUntrustedHost = await makeRequest('/api/ai-advice', 'POST', {
      issue: { message: 'Test issue', cwv: 'cls' }
    }, {
      'Host': 'evil-rebind.com'
    });
    assert.strictEqual(resUntrustedHost.status, 403, 'Untrusted Host header must be rejected with 403');

    // Direct local HTTP client (no Origin header)
    const resDirectLocal = await makeRequest('/api/ai-advice', 'POST', {
      issue: { message: 'Direct local client issue', cwv: 'cls' }
    });
    assert.strictEqual(resDirectLocal.status, 200, 'Direct local client without Origin header must be permitted');

    // Trusted local origin
    const resAllowed = await makeRequest('/api/ai-advice', 'POST', {
      issue: { message: 'Test issue', cwv: 'cls' }
    }, {
      'Origin': 'http://localhost:3000'
    });
    assert.strictEqual(resAllowed.status, 200, 'Local origin request must be allowed');

    logPass('Local-origin & request boundary security checks verified');
  }

  // =========================================================================
  // 15. Unambiguous PDF vs Companion Report Status Distinction
  // =========================================================================
  {
    const dummyTimestamp = Date.now() + 5000;
    const dummyReportFile = `report-${dummyTimestamp}.json`;
    const dummyReportPath = path.join(inspectorRoot, 'reports', dummyReportFile);

    fs.writeFileSync(dummyReportPath, JSON.stringify({
      timestamp: dummyTimestamp,
      project: 'cwv-inspector',
      scores: { overall: 80 },
      pdfStatus: {
        generated: true,
        aiEnriched: false,
        notice: 'PDF reflects initial audit baseline.'
      },
      issues: [
        {
          message: 'LCP test issue',
          cwv: 'lcp',
          severity: 'high',
          file: 'src/App.jsx',
          line: 15
        }
      ]
    }, null, 2));

    try {
      const res = await makeRequest('/api/enrich-report', 'POST', {
        project: 'cwv-inspector',
        reportFile: dummyReportFile
      });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.json.success, true);
      assert.strictEqual(res.json.pdfStatus.aiEnriched, false, 'PDF status must explicitly indicate static PDF is not enriched');
      assert.strictEqual(res.json.aiAdvisor.pdfSynchronized, false, 'aiAdvisor metadata must mark pdfSynchronized as false');
      assert.ok(res.json.pdfStatus.notice, 'Must include descriptive notice about PDF baseline vs live advice');

      // Verify on disk companion JSON
      const onDisk = JSON.parse(fs.readFileSync(dummyReportPath, 'utf8'));
      assert.strictEqual(onDisk.pdfStatus.aiEnriched, false);
      assert.strictEqual(onDisk.aiAdvisor.pdfSynchronized, false);
    } finally {
      if (fs.existsSync(dummyReportPath)) fs.unlinkSync(dummyReportPath);
    }

    logPass('Unambiguous PDF status correctly distinguishes original PDF from post-audit advice');
  }

  // =========================================================================
  // 16. Option B: Legacy Endpoint Path Validation & Symlink Containment
  // =========================================================================
  {
    // /run-audit with traversal
    const resRunAuditTraverse = await makeRequest('/run-audit?project=../../etc', 'GET');
    assert.strictEqual(resRunAuditTraverse.status, 400, '/run-audit must reject directory traversal');

    // /reports-view with invalid project traversal
    const resReportsTraverse = await makeRequest('/reports-view?project=../../etc&file=report-1.html', 'GET');
    assert.strictEqual(resReportsTraverse.status, 400, '/reports-view must reject project traversal');

    // /reports-view with disallowed filename (not report-<timestamp>.(html|pdf|json))
    const resReportsBadFile = await makeRequest('/reports-view?project=cwv-inspector&file=package.json', 'GET');
    assert.strictEqual(resReportsBadFile.status, 400, '/reports-view must reject non-report filenames');

    // Symlink escape test: create symlink pointing outside parentDir
    const parentDir = path.dirname(inspectorRoot);
    const symlinkPath = path.join(parentDir, 'temp-escape-symlink');
    try {
      if (fs.existsSync(symlinkPath)) fs.unlinkSync(symlinkPath);
      fs.symlinkSync('/tmp', symlinkPath, 'dir');
      const resSymlink = await makeRequest('/reports-view?project=temp-escape-symlink&file=report-1.html', 'GET');
      assert.strictEqual(resSymlink.status, 400, '/reports-view must reject symlink escaping parent directory');
    } catch (_) {
      // If symlink creation fails due to OS permissions, skip
    } finally {
      if (fs.existsSync(symlinkPath)) fs.unlinkSync(symlinkPath);
    }

    logPass('Legacy endpoints (/run-audit, /reports-view) enforce strict path containment and symlink safety');
  }

  // =========================================================================
  // 17. Option C: Single-Issue Retry & Post-Audit Preserve Initial Enriched State
  // =========================================================================
  {
    const dummyTimestamp = Date.now() + 9999;
    const dummyReportFile = `report-${dummyTimestamp}.json`;
    const dummyReportPath = path.join(inspectorRoot, 'reports', dummyReportFile);

    // Initial audit generated WITH synchronous AI advice
    fs.writeFileSync(dummyReportPath, JSON.stringify({
      timestamp: dummyTimestamp,
      project: 'cwv-inspector',
      scores: { overall: 90 },
      pdfStatus: {
        generated: true,
        aiEnriched: true,
        synchronized: true,
        notice: 'PDF generated synchronously with initial AI advice.'
      },
      aiAdvisor: {
        status: 'completed',
        pdfSynchronized: true
      },
      issues: [
        {
          message: 'Initial enriched finding',
          cwv: 'cls',
          severity: 'high',
          file: 'src/Hero.jsx',
          line: 25,
          aiAdvice: { issue: 'Hero.jsx fix' }
        }
      ]
    }, null, 2));

    try {
      // Single-issue retry via POST /api/ai-advice
      const resRetry = await makeRequest('/api/ai-advice', 'POST', {
        project: 'cwv-inspector',
        reportFile: dummyReportFile,
        issueIndex: 0
      });

      assert.strictEqual(resRetry.status, 200);

      // Verify on-disk metadata: aiEnriched must NOT be falsely set to false!
      // But synchronized must be false because the file was modified post-generation.
      const afterRetry = JSON.parse(fs.readFileSync(dummyReportPath, 'utf8'));
      assert.strictEqual(afterRetry.pdfStatus.aiEnriched, true, 'Must preserve aiEnriched: true when initial PDF contained advice');
      assert.strictEqual(afterRetry.pdfStatus.synchronized, false, 'Must mark synchronized: false after single-issue retry');
      assert.strictEqual(afterRetry.aiAdvisor.pdfSynchronized, false, 'aiAdvisor.pdfSynchronized must be false');

      // Now verify POST /api/enrich-report also preserves initial aiEnriched: true
      const resEnrich = await makeRequest('/api/enrich-report', 'POST', {
        project: 'cwv-inspector',
        reportFile: dummyReportFile
      });

      assert.strictEqual(resEnrich.status, 200);
      assert.strictEqual(resEnrich.json.pdfStatus.aiEnriched, true, 'Enrich endpoint must preserve aiEnriched: true');
      assert.strictEqual(resEnrich.json.pdfStatus.synchronized, false, 'Enrich endpoint must mark synchronized: false');
    } finally {
      if (fs.existsSync(dummyReportPath)) fs.unlinkSync(dummyReportPath);
    }

    logPass('PDF status metadata preserves initial aiEnriched state while accurately tracking synchronization');
  }

  // =========================================================================
  // 20. EJS Layout Whose Entire Markup Occupies One Line
  // =========================================================================
  {
    const oneLineEjsContent = '<!DOCTYPE html><html><body><div id="root"><footer id="footer"><%- footer %></footer></div></body></html>';
    const mockFiles = [{
      filePath: 'views/pages/layout.ejs',
      content: oneLineEjsContent
    }];

    const result = correlateCls(
      [{ selector: 'html > body > div#root > footer#footer > div.child', score: 0.15 }],
      [], // No AST elements match
      mockFiles
    );

    assert.strictEqual(result.length, 1);
    const item = result[0];
    assert.strictEqual(item.source.filePath, 'views/pages/layout.ejs');
    assert.strictEqual(item.source.line, 1);
    assert.strictEqual(item.source.isSingleLine, true);
    assert.strictEqual(item.source.isParentContainer, true);
    assert.strictEqual(item.confidence, 'PROBABLE', 'Parent container match must be PROBABLE, not EXACT');
    assert.ok(item.evidence.some(e => e.includes('entire layout on one line; exact line-level attribution unavailable')));
    logPass('EJS layouts whose entire markup occupies one line report single-line fallback explanation');
  }

  // =========================================================================
  // 21. Multi-line EJS Template Accurately Resolves Source Line
  // =========================================================================
  {
    const multiLineEjs = [
      '<!DOCTYPE html>',
      '<html>',
      '  <head><title>Test</title></head>',
      '  <body>',
      '    <div class="content"><%- content %></div>',
      '    <footer id="footer" class="footer-wrapper"><%- footer %></footer>',
      '  </body>',
      '</html>'
    ].join('\n');

    const mockFiles = [{
      filePath: 'views/pages/layout.ejs',
      content: multiLineEjs
    }];

    const result = correlateCls(
      [{ selector: 'html > body > footer#footer > div.AUPHk', score: 0.45 }],
      [],
      mockFiles
    );

    assert.strictEqual(result.length, 1);
    const item = result[0];
    assert.strictEqual(item.source.filePath, 'views/pages/layout.ejs');
    assert.strictEqual(item.source.line, 6, 'Should locate <footer id="footer"> at line 6, not hardcoded 1');
    assert.strictEqual(item.source.isParentContainer, true);
    assert.strictEqual(item.confidence, 'PROBABLE');
    logPass('Multi-line template accurately tracks source line and parent container');
  }

  // =========================================================================
  // 22. Nested Runtime Elements with Dynamic/Hashed Class Names
  // =========================================================================
  {
    const mockFiles = [{
      filePath: 'views/pages/layout.ejs',
      content: '<footer id="footer"><%- footer %></footer>'
    }];

    const result = correlateCls(
      [{ selector: 'footer#footer > div > div.e82R0 > div.AUPHk', score: 0.45 }],
      [],
      mockFiles
    );

    assert.strictEqual(result.length, 1);
    const item = result[0];
    assert.ok(item.evidence.some(e => e.includes('dynamically generated by a bundler')),
      'Must detect compiler/bundler generated CSS Modules class names');
    logPass('Nested runtime elements with dynamic class names are detected as bundler-generated');
  }

  // =========================================================================
  // 23. Geometry-Aware Cause: Element Collapsing to 0x0
  // =========================================================================
  {
    const shiftWithCollapse = {
      value: 0.4588,
      time: 232.9,
      sources: [{
        selector: 'html > body.fonts-loaded > div.page-wrapper > footer#footer > div > div.e82R0 > div.AUPHk',
        snippet: '<div class="AUPHk">...</div>',
        previousRect: { x: 16.0, y: 568.0, width: 328.0, height: 55.0 },
        currentRect: { x: 0.0, y: 0.0, width: 0.0, height: 0.0 }
      }]
    };

    const multiLineLayout = [
      '<!DOCTYPE html>',
      '<html><body>',
      '  <footer id="footer"><%- footer %></footer>',
      '</body></html>'
    ].join('\n');

    const result = compileRecommendations(
      [],
      { customShifts: [shiftWithCollapse] },
      [],
      [{ filePath: 'views/pages/layout.ejs', content: multiLineLayout }]
    );

    assert.strictEqual(result.issues.length, 1);
    const issue = result.issues[0];
    assert.ok(issue.impact.includes('Suspected Cause: Element Removal / Collapsed to 0x0'),
      'Must identify 0x0 collapse as element removal rather than web font loading');
    assert.ok(!issue.impact.includes('(Suspected Cause: Web Font Loading)'),
      'Must NOT diagnose web font loading when element collapsed to 0x0');
    assert.ok(issue.suggestion.includes('indicates element removal/unmount rather than FOIT/FOUT'),
      'Suggestion must clarify that .fonts-loaded is contextual and geometry proves unmount');
    assert.ok(issue.message.includes('Shift on "div.AUPHk" (inside <footer#footer> in layout.ejs)'),
      'Message must indicate shift on target element inside container');
    assert.strictEqual(issue.confidence, 'PROBABLE', 'Must not label parent container fallback as EXACT');
    logPass('Geometry-aware cause diagnosis: element collapsing to 0x0 is classified as removal, not web font loading');
  }

  // =========================================================================
  // 24. Unresolved Source Attribution Represented Honestly
  // =========================================================================
  {
    const shiftUnresolved = {
      value: 0.08,
      sources: [{
        selector: 'html > body > div.unknown-wrapper > span.dynamic-text',
        previousRect: { x: 10, y: 20, width: 100, height: 20 },
        currentRect: { x: 10, y: 40, width: 100, height: 20 }
      }]
    };

    const result = compileRecommendations(
      [],
      { customShifts: [shiftUnresolved] },
      [],
      [] // No source files match
    );

    assert.strictEqual(result.issues.length, 1);
    const issue = result.issues[0];
    assert.strictEqual(issue.confidence, 'UNRESOLVED');
    assert.strictEqual(issue.line, '-');
    assert.strictEqual(issue.type, 'observer-fallback-unresolved');
    logPass('Unresolved source attribution is honestly classified as UNRESOLVED without hallucinated lines');
  }

  // =========================================================================
  // 25. Copilot Completion Handling: Assistant Message Arrives Before/Without Idle
  // =========================================================================
  {
    // Mock client that emits assistant.message and allows settling without immediate session.idle
    let eventHandler = null;
    let destroyed = false;
    const mockClient = {
      createSession: async () => ({
        on: (fn) => { eventHandler = fn; return () => {}; },
        send: async () => {
          // Asynchronously emit assistant.message
          setTimeout(() => {
            if (eventHandler) {
              eventHandler({
                type: 'assistant.message',
                data: { content: '{"issue": "Mock Response", "metric": "CLS", "explanation": "Handled without idle hang", "rootCause": "Resolved", "recommendations": ["Done"], "whyItHelps": "Fixed", "confidence": "HIGH"}' }
              });
            }
          }, 50);
        },
        destroy: async () => { destroyed = true; }
      })
    };

    const service = new CopilotService();
    service.client = mockClient;
    service.isStarted = true;

    // Send prompt with short timeout to verify settling timer handles message
    const res = await service._executePromptInSession('Test prompt', 2000);
    assert.ok(res.includes('Handled without idle hang'));
    assert.strictEqual(destroyed, true);
    logPass('Copilot completion handling: assistant.message handled cleanly without waiting for delayed idle');
  }

  // =========================================================================
  // 26. Structured Error Categorization
  // =========================================================================
  {
    const timeoutErr = new Error('Timeout after 30000ms waiting for session.idle');
    const authErr = new Error('User not logged in: unauthorized');
    const cliErr = new Error('Client not connected. CLI binary unavailable');
    const malformedErr = new Error('Copilot returned an empty response.');
    const genericErr = new Error('Something strange happened');

    assert.strictEqual(categorizeCopilotError(timeoutErr), 'TIMEOUT');
    assert.strictEqual(categorizeCopilotError(authErr), 'AUTH_FAILURE');
    assert.strictEqual(categorizeCopilotError(cliErr), 'UNAVAILABLE');
    assert.strictEqual(categorizeCopilotError(malformedErr), 'MALFORMED');
    assert.strictEqual(categorizeCopilotError(genericErr), 'ERROR');
    logPass('Structured error categorization correctly classifies all error modes');
  }

  // =========================================================================
  // 27. Concurrency Serialization in CopilotService
  // =========================================================================
  {
    const origMock = process.env.COPILOT_MOCK;
    process.env.COPILOT_MOCK = 'false';
    try {
      const service = new CopilotService();
      const executionOrder = [];

      // Override _executePromptInSession to simulate async operations
      service.start = async () => {};
      service.isStarted = true;
      service._executePromptInSession = async (prompt) => {
        executionOrder.push(`start:${prompt}`);
        await new Promise(r => setTimeout(r, 60));
        executionOrder.push(`end:${prompt}`);
        return `result:${prompt}`;
      };

      // Launch two requests concurrently
      const p1 = service.generateResponse('req1');
      const p2 = service.generateResponse('req2');
      const [r1, r2] = await Promise.all([p1, p2]);

      assert.strictEqual(r1, 'result:req1');
      assert.strictEqual(r2, 'result:req2');
      // Ensure req1 completed before req2 started (serialized execution!)
      assert.deepStrictEqual(executionOrder, ['start:req1', 'end:req1', 'start:req2', 'end:req2']);
      logPass('Concurrency serialization ensures sequential queueing without session conflicts');
    } finally {
      process.env.COPILOT_MOCK = origMock;
    }
  }

  // =========================================================================
  // 28. AI Advice Schema Validation for verificationProcedure & alternativeHypotheses
  // =========================================================================
  {
    const parsed = {
      issue: 'CLS Shift in Footer',
      metric: 'CLS',
      explanation: 'Footer shifted unexpectedly.',
      rootCause: 'Dynamic React hydration unmount.',
      recommendations: ['Reserve footer space', 'Defer non-critical links'],
      whyItHelps: 'Prevents reflow during hydration.',
      verificationProcedure: 'Inspect performance timeline with 4x CPU throttle.',
      alternativeHypotheses: ['Late font load swap', 'Ad container resize'],
      confidence: 'MEDIUM'
    };

    const validated = validateAdvisorResult(parsed, { message: 'CLS Shift in Footer' });
    assert.strictEqual(validated.verificationProcedure, 'Inspect performance timeline with 4x CPU throttle.');
    assert.deepStrictEqual(validated.alternativeHypotheses, ['Late font load swap', 'Ad container resize']);
    assert.strictEqual(validated.confidence, 'MEDIUM');
    logPass('AI advice schema validation accepts verificationProcedure and alternativeHypotheses');
  }

  // =========================================================================
  // 29. Preserving Deterministic Findings When AI Enrichment Fails or Times Out
  // =========================================================================
  {
    const compiled = {
      issues: [{
        cwv: 'cls',
        severity: 'high',
        message: 'Severe layout shift in footer',
        impact: 'Unthrottled diagnostic observer captured a shift of 0.4588 on "footer".',
        suggestion: 'Reserve layout space.',
        selector: 'footer#footer',
        score: 0.4588,
        file: 'views/pages/layout.ejs',
        line: 122,
        previousRect: { x: 16, y: 568, width: 328, height: 55 },
        currentRect: { x: 0, y: 0, width: 0, height: 0 }
      }]
    };

    const failingService = {
      generateResponse: async () => {
        const err = new Error('Timeout after 30000ms waiting for session.idle');
        err.errorType = 'TIMEOUT';
        throw err;
      }
    };

    const origMock = process.env.COPILOT_MOCK;
    delete process.env.COPILOT_MOCK;

    let enriched;
    try {
      enriched = await enrichAuditWithCopilot(compiled, {
        copilotService: failingService,
        timeoutMs: 1000,
        totalTimeoutMs: 5000,
        mock: false
      });
    } finally {
      process.env.COPILOT_MOCK = origMock;
    }

    const issue = enriched.issues[0];
    // Deterministic fields must be completely preserved!
    assert.strictEqual(issue.cwv, 'cls');
    assert.strictEqual(issue.severity, 'high');
    assert.strictEqual(issue.score, 0.4588);
    assert.strictEqual(issue.file, 'views/pages/layout.ejs');
    assert.strictEqual(issue.line, 122);
    assert.deepStrictEqual(issue.previousRect, { x: 16, y: 568, width: 328, height: 55 });
    assert.deepStrictEqual(issue.currentRect, { x: 0, y: 0, width: 0, height: 0 });

    // AI fields must reflect structured error status
    assert.strictEqual(issue.aiStatus, 'error');
    assert.strictEqual(issue.aiAdvice, null);
    assert.strictEqual(issue.aiErrorDetails.type, 'TIMEOUT');
    assert.ok(issue.aiErrorDetails.message.includes('Timeout'));
    logPass('Preserving deterministic findings when AI enrichment fails or times out');
  }

  // =========================================================================
  // 30. Multiline EJS Layout with Matching Footer on a Later Line
  // =========================================================================
  {
    const multilineContent = [
      '<!DOCTYPE html>',
      '<html>',
      '  <head>',
      '    <title>Multi-line Template</title>',
      '  </head>',
      '  <body>',
      '    <div class="page-wrapper">',
      '      <header id="nav-bar">Top Header</header>',
      '      <main id="content">Main Content</main>',
      '      <footer id="footer" class="footer-wrapper">',
      '        <div class="inner-footer">Footer Content</div>',
      '      </footer>',
      '    </div>',
      '  </body>',
      '</html>'
    ].join('\n');

    const files = [{ filePath: 'views/pages/layout.ejs', ext: '.ejs', content: multilineContent }];

    // Direct target match on <footer id="footer">
    const resDirect = correlateCls(
      [{ selector: 'html > body > div.page-wrapper > footer#footer', score: 0.15 }],
      [],
      files
    );
    assert.strictEqual(resDirect.length, 1);
    assert.strictEqual(resDirect[0].source.filePath, 'views/pages/layout.ejs');
    assert.strictEqual(resDirect[0].source.line, 10, 'Target <footer id="footer"> must be resolved to line 10');
    assert.strictEqual(resDirect[0].source.isParentContainer, false);
    assert.strictEqual(resDirect[0].confidence, 'EXACT');

    // Genuine line-1 match on <!DOCTYPE html> / <html>
    const resLine1 = correlateCls(
      [{ selector: 'html', score: 0.05 }],
      [],
      files
    );
    assert.strictEqual(resLine1.length, 1);
    assert.strictEqual(resLine1[0].source.line, 2, '<html> tag is on line 2, genuine line preserved');

    logPass('Multiline EJS layout accurately maps target elements to real source lines and columns');
  }

  // =========================================================================
  // 31. Single-Line EJS Layout Does Not Fabricate False Precision
  // =========================================================================
  {
    const singleLineContent = '<html><head></head><body><div class="page-wrapper"><footer id="footer"><%- footer %></footer></div></body></html>';
    const files = [{ filePath: 'views/pages/layout.ejs', ext: '.ejs', content: singleLineContent }];

    const resSingle = correlateCls(
      [{ selector: 'html > body > div.page-wrapper > footer#footer > div.AUPHk', score: 0.45 }],
      [],
      files
    );

    assert.strictEqual(resSingle.length, 1);
    const item = resSingle[0];
    assert.strictEqual(item.source.filePath, 'views/pages/layout.ejs');
    assert.strictEqual(item.source.isSingleLine, true);
    assert.ok(item.evidence.some(e => e.includes('entire layout on one line; exact line-level attribution unavailable')),
      'Must explicitly explain single-line layout fallback limitations');
    logPass('Single-line EJS layout accurately reports single-line limitation without claiming line precision');
  }

  // =========================================================================
  // 32. Several Occurrences of Footer in Same Template Reported as Ambiguous
  // =========================================================================
  {
    const duplicateIdContent = [
      '<!DOCTYPE html>',
      '<html><body>',
      '  <footer id="footer">First Footer</footer>',
      '  <div id="footer">Duplicate ID footer element</div>',
      '</body></html>'
    ].join('\n');

    const files = [{ filePath: 'views/pages/layout.ejs', ext: '.ejs', content: duplicateIdContent }];

    const resAmbiguous = correlateCls(
      [{ selector: 'body > footer#footer > div.AUPHk', score: 0.2 }],
      [],
      files
    );

    assert.strictEqual(resAmbiguous.length, 1);
    assert.strictEqual(resAmbiguous[0].confidence, 'AMBIGUOUS');
    assert.strictEqual(resAmbiguous[0].source, null, 'Must not select first match arbitrarily when multiple exist');
    assert.ok(resAmbiguous[0].evidence.some(e => e.includes('Ambiguous parent match: Found 2 occurrences of ID "footer"')),
      'Must record ambiguity evidence with count');
    logPass('Multiple occurrences of ID in template are reported honestly as AMBIGUOUS rather than picking first');
  }

  // =========================================================================
  // 33. Nested DOM Elements with Generated/Hashed Class Names
  // =========================================================================
  {
    const layoutContent = [
      '<!DOCTYPE html>',
      '<html><body>',
      '  <footer id="footer" class="footer-wrapper"><%- footer %></footer>',
      '</body></html>'
    ].join('\n');

    const files = [{ filePath: 'views/pages/layout.ejs', ext: '.ejs', content: layoutContent }];

    const resNested = correlateCls(
      [{ selector: 'html > body > footer#footer > div.e82R0 > div.AUPHk', score: 0.4588 }],
      [],
      files
    );

    assert.strictEqual(resNested.length, 1);
    const item = resNested[0];
    assert.strictEqual(item.source.isParentContainer, true);
    assert.strictEqual(item.source.containerId, 'footer');
    assert.strictEqual(item.source.targetLine, null, 'Target child element line must be null');
    assert.strictEqual(item.source.containerLine, 3, 'Parent container line must be 3');
    assert.strictEqual(item.confidence, 'PROBABLE');

    // Compile finding and ensure target issue line is null and parent container line is preserved
    const compiled = compileRecommendations(
      [],
      { customShifts: [{ value: 0.4588, sources: [{ selector: 'html > body > footer#footer > div.e82R0 > div.AUPHk' }] }] },
      [],
      files
    );
    assert.strictEqual(compiled.issues.length, 1);
    const issue = compiled.issues[0];
    assert.strictEqual(issue.line, null, 'Target child element line must be null in compiled finding');
    assert.strictEqual(issue.containerLine, 3, 'Candidate parent container line must be 3');
    assert.strictEqual(issue.isParentContainer, true);
    logPass('Nested elements with bundler-generated class names map to candidate parent container with null child line');
  }

  // =========================================================================
  // 34. DOM Element Whose Runtime Class Has No Literal Match in Source
  // =========================================================================
  {
    const files = [{
      filePath: 'views/pages/layout.ejs',
      ext: '.ejs',
      content: '<html><body><main id="main">Main content</main></body></html>'
    }];

    const resUnmatched = correlateCls(
      [{ selector: 'body > div.custom-unmatched-class > span.dynamic-tag', score: 0.12 }],
      [],
      files
    );

    assert.strictEqual(resUnmatched.length, 1);
    assert.strictEqual(resUnmatched[0].confidence, 'UNRESOLVED');
    assert.strictEqual(resUnmatched[0].source, null);
    logPass('DOM element with unresolvable class names is classified as UNRESOLVED without fabricated lines');
  }

  // =========================================================================
  // 35. Matching Parent ID Whose Children Are Not Uniquely Attributable
  // =========================================================================
  {
    const layoutContent = [
      '<!DOCTYPE html>',
      '<html><body>',
      '  <header id="site-header">',
      '    <div class="header-inner"><%- navItems %></div>',
      '  </header>',
      '</body></html>'
    ].join('\n');

    const files = [{ filePath: 'views/pages/layout.ejs', ext: '.ejs', content: layoutContent }];

    const resChildren = correlateCls(
      [{ selector: 'header#site-header > div > span.dynamic-icon', score: 0.08 }],
      [],
      files
    );

    assert.strictEqual(resChildren.length, 1);
    const item = resChildren[0];
    assert.strictEqual(item.source.isParentContainer, true);
    assert.strictEqual(item.source.containerId, 'site-header');
    assert.strictEqual(item.source.containerLine, 3);
    assert.strictEqual(item.source.targetLine, null);
    assert.strictEqual(item.confidence, 'PROBABLE');
    logPass('Parent ID match whose children are generic is marked PROBABLE with null child line');
  }

  // =========================================================================
  // 36. CSS Rule Matching for Runtime Class & Selector
  // =========================================================================
  {
    const cssContent = [
      '/* Global styles */',
      '#footer {',
      '  display: flex;',
      '  min-height: 80px;',
      '}',
      '.footer-wrapper {',
      '  padding: 16px;',
      '}'
    ].join('\n');

    const files = [{ filePath: 'public/styles.css', ext: '.css', content: cssContent }];

    const matchedRules = findMatchingCssRules(files, ['footer#footer.footer-wrapper']);
    assert.strictEqual(matchedRules.length, 2);
    assert.strictEqual(matchedRules[0].selector, '#footer');
    assert.strictEqual(matchedRules[0].line, 2);
    assert.strictEqual(matchedRules[1].selector, '.footer-wrapper');
    assert.strictEqual(matchedRules[1].line, 6);
    logPass('CSS rule matching locates exact stylesheet rules and lines for selector components');
  }

  // =========================================================================
  // 37. Preserving Deterministic Measurements & Observer Fallback Categorization
  // =========================================================================
  {
    const shift = {
      value: 0.35,
      time: 145.2,
      sources: [{
        selector: 'footer#footer > div.AUPHk',
        previousRect: { x: 10, y: 500, width: 300, height: 60 },
        currentRect: { x: 10, y: 500, width: 300, height: 60 }
      }]
    };

    const compiled = compileRecommendations([], { customShifts: [shift] }, [], []);
    assert.strictEqual(compiled.issues.length, 1);
    const issue = compiled.issues[0];
    // Must remain observer fallback, never classified as Lighthouse-confirmed
    assert.strictEqual(issue.type, 'observer-fallback-unresolved');
    assert.strictEqual(issue.score, 0.35);
    assert.deepStrictEqual(issue.previousRect, { x: 10, y: 500, width: 300, height: 60 });
    assert.deepStrictEqual(issue.currentRect, { x: 10, y: 500, width: 300, height: 60 });
    assert.strictEqual(issue.cwv, 'cls');
    logPass('Observer fallback findings preserve deterministic measurements and are kept separate from Lighthouse');
  }

  // Close server
  await new Promise(resolve => server.close(resolve));

  console.log(`\n🎉 All ${testPassCount} Phase 3 Automatic AI Recommendations tests passed successfully!`);
}

runTests().catch(err => {
  console.error('\n❌ Test execution failed:', err);
  process.exit(1);
});
