#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { execSync } from 'child_process';
import nodeFetch from 'node-fetch';

if (typeof globalThis.fetch === 'undefined' && nodeFetch) {
  globalThis.fetch = nodeFetch;
}

function httpGet(urlStr, timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    try {
      const urlObj = new URL(urlStr);
      const mod = urlObj.protocol === 'http:' ? http : https;
      const req = mod.get(urlStr, { timeout: timeoutMs }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return resolve(httpGet(new URL(res.headers.location, urlStr).toString(), timeoutMs));
        }
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: () => Promise.resolve(data)
        }));
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('Request timed out')); });
    } catch (err) {
      reject(err);
    }
  });
}
import { scanFiles } from './scanners/scanFiles.js';
import { parseReactCode } from './scanners/parseReact.js';
import { scanDependencies } from './scanners/dependencyScanner.js';
import { runLighthouseAudit, extractScores } from './analyzers/lighthouse.js';

import { analyzeLcp } from './analyzers/lcp.js';
import { analyzeCls } from './analyzers/cls.js';
import { analyzeInp } from './analyzers/inp.js';
import { analyzeImages } from './analyzers/images.js';
import { analyzeFonts } from './analyzers/fonts.js';
import { analyzeCss } from './analyzers/css.js';
import { analyzeJavascript } from './analyzers/javascript.js';
import { analyzeReact } from './analyzers/react.js';
import { analyzeBundle } from './analyzers/bundle.js';
import readline from 'readline';
import { compileRecommendations } from './analyzers/recommendations.js';
import { generateReport } from './report/generatePdf.js';

function askQuestion(rl, query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  // Load environment variables manually
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1];
          let value = match[2] || '';
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
          }
          process.env[key] = value.trim();
        }
      });
    }
  } catch (err) {
    // Ignore
  }

  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Core Web Vitals (CWV) Inspector CLI
Usage:
  node audit.js <project-path> [options]

Options:
  --url <url>          Run Lighthouse performance audit against a live/local URL
  --branch <branch>    Override or specify Git branch name (default: auto-detected)
  --help, -h           Show this usage guide
    `);
    process.exit(0);
  }

  let targetPathInput = '';
  let url = null;
  let explicitBranch = null;

  if (args.length === 0) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    
    // Find sibling projects in the parent directory
    const parentDir = path.resolve(process.cwd(), '..');
    let directories = [];
    try {
      directories = fs.readdirSync(parentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !dirent.name.startsWith('.'))
        .map(dirent => dirent.name);
    } catch (err) {
      // ignore
    }

    console.log('\n==========================================');
    console.log('Core Web Vitals (CWV) Interactive Audit');
    console.log('==========================================');
    
    if (directories.length > 0) {
      console.log('\nAvailable projects in parent directory:');
      directories.forEach((dir, idx) => {
        console.log(`  [${idx + 1}] ${dir}`);
      });
    }

    const folderIndexStr = await askQuestion(rl, '\nSelect a folder number or enter a custom path (default is current folder \'.\'): ');
    const idx = parseInt(folderIndexStr, 10) - 1;
    if (directories[idx] && idx >= 0 && idx < directories.length) {
      targetPathInput = path.join(parentDir, directories[idx]);
    } else {
      targetPathInput = folderIndexStr.trim() || '.';
    }

    const urlInput = await askQuestion(rl, 'Enter website URL to audit (optional, e.g. https://example.com): ');
    url = urlInput.trim() || null;
    
    rl.close();
  } else {
    targetPathInput = args[0];
    const urlIndex = args.indexOf('--url');
    if (urlIndex !== -1 && args[urlIndex + 1]) {
      url = args[urlIndex + 1];
    }
    const branchIndex = args.indexOf('--branch');
    if (branchIndex !== -1 && args[branchIndex + 1]) {
      explicitBranch = args[branchIndex + 1].trim();
    }
  }

  if (url && !/^https?:\/\//i.test(url)) {
    url = url.startsWith('localhost') || url.startsWith('127.0.0.1') ? `http://${url}` : `https://${url}`;
  }

  const targetPath = path.resolve(targetPathInput);
  if (!fs.existsSync(targetPath)) {
    console.error(`Error: Target project path "${targetPath}" does not exist.`);
    process.exit(1);
  }

  // If a branch is explicitly requested, checkout the branch in the target repo before scanning
  if (explicitBranch && targetPath && fs.existsSync(path.join(targetPath, '.git'))) {
    try {
      const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: targetPath, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
      if (currentBranch !== explicitBranch) {
        console.log(`🌿 Switching ${path.basename(targetPath)} from branch "${currentBranch}" to "${explicitBranch}"...`);
        try {
          const out = execSync(`git checkout ${explicitBranch}`, { cwd: targetPath, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
          if (out && out.trim()) console.log(out.trim());
        } catch (initialErr) {
          // If local branch does not exist yet, try tracking remote branch
          const out = execSync(`git checkout -t origin/${explicitBranch}`, { cwd: targetPath, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
          if (out && out.trim()) console.log(out.trim());
        }
        console.log(`✓ Repository checked out to branch "${explicitBranch}".`);
      } else {
        console.log(`🌿 Target repository is on branch "${explicitBranch}".`);
      }
    } catch (checkoutErr) {
      console.warn(`⚠️ Could not switch git branch to "${explicitBranch}": ${checkoutErr.message}`);
    }
  }

  console.log(`\n==========================================`);
  console.log(`Starting Core Web Vitals Code Audit`);
  console.log(`Target: ${targetPath}`);
  if (url) console.log(`URL:    ${url}`);
  console.log(`==========================================\n`);

  // Step 1: Scan files
  console.log('Scanning workspace files...');
  const files = scanFiles(targetPath);
  console.log(`Found ${files.length} project files to inspect.`);

  // Step 2: Parse React/AST files
  console.log('Parsing JS/TS files for AST inspection...');
  const reactAsts = files
    .filter(f => ['.js', '.jsx', '.ts', '.tsx'].includes(f.ext))
    .map(f => ({
      file: f,
      ast: parseReactCode(f.content, f.filePath)
    }));

  // Step 3: Run Analyzers
  console.log('Running performance analyzers...');
  const staticIssues = [
    ...scanDependencies(targetPath),
    ...analyzeLcp(files, reactAsts),
    ...analyzeCls(files, reactAsts),
    ...analyzeInp(files, reactAsts),
    ...analyzeImages(files, reactAsts),
    ...analyzeFonts(files),
    ...analyzeCss(files),
    ...analyzeJavascript(files),
    ...analyzeReact(files, reactAsts),
    ...analyzeBundle(files, reactAsts)
  ];

  // Step 4: Run optional Lighthouse
  let lighthouseData = null;
  let remoteDeployment = null;
  if (url) {
    try {
      const parsedUrl = new URL(url);
      const rtRes = await httpGet(`${parsedUrl.origin}/round-table.txt?_ts=${Date.now()}`, 5000);
      if (rtRes.ok) {
        const text = await rtRes.text();
        const commitHashMatch = text.match(/^([0-9a-f]{7,40})\s+(.*)$/m);
        const deploymentMatch = text.match(/Deployment:\s*(\S+)/i);
        const buildDateMatch = text.match(/Build Date:\s*(.+)$/m);
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const messageLine = lines.find(l => 
          !l.startsWith('Commit Date') && 
          !l.startsWith('Build Date') && 
          !l.startsWith('Deployment') && 
          !l.match(/^[0-9a-f]{7,40}\s+/)
        );

        if (commitHashMatch) {
          remoteDeployment = {
            commit: commitHashMatch[1],
            author: commitHashMatch[2],
            deploymentId: deploymentMatch ? deploymentMatch[1] : 'N/A',
            buildDate: buildDateMatch ? buildDateMatch[1] : 'N/A',
            message: messageLine || ''
          };
          console.log(`🌐 Live Server Deployment Verified: Commit ${commitHashMatch[1]} (Build #${remoteDeployment.deploymentId})`);
          if (remoteDeployment.message) console.log(`   Commit Message: "${remoteDeployment.message}"`);
        }
      }
    } catch (_) {}

    lighthouseData = await runLighthouseAudit(url);
  }

  // Fetch optional Chrome UX Report (CrUX) Field Data and History Data
  let cruxData = null;
  let cruxHistoryData = null;
  const cruxApiKey = process.env.CRUX_API_KEY || 'AIzaSyCxH_Ch4j49NIzqjfYwPIKRLsTc13FS-Ek';
  if (url && cruxApiKey) {
    console.log('⚡ Fetching Field Data and History from Google CrUX API...');
    try {
      const parsedUrl = new URL(url);
      const origin = parsedUrl.origin;

      const fetchCruxQuery = async (endpoint, payload) => {
        try {
          const res = await fetch(`https://chromeuxreport.googleapis.com/v1/records:${endpoint}?key=${cruxApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (res.ok) return await res.json();
          return null;
        } catch (_) {
          return null;
        }
      };

      // 1. Attempt exact URL query
      let [cData, cHistory] = await Promise.all([
        fetchCruxQuery('queryRecord', { url: url }),
        fetchCruxQuery('queryHistoryRecord', { url: url })
      ]);

      // 2. Fall back to origin if exact URL has insufficient Chrome traffic (standard PSI behavior)
      if (!cData) {
        console.log(`⚡ CrUX exact URL record not found. Falling back to origin: "${origin}" (standard PSI behavior)...`);
        cData = await fetchCruxQuery('queryRecord', { origin: origin });
      }
      if (!cHistory) {
        cHistory = await fetchCruxQuery('queryHistoryRecord', { origin: origin });
      }

      if (cData) {
        cruxData = cData;
        console.log('CrUX Field Data fetched successfully.');
      } else {
        console.warn('CrUX Field Data unavailable for this URL and origin.');
      }

      if (cHistory) {
        cruxHistoryData = cHistory;
        console.log('CrUX History Data fetched successfully.');
      } else {
        console.warn('CrUX History Data unavailable for this URL and origin.');
      }
    } catch (err) {
      console.warn('CrUX Data fetch failed:', err.message);
    }
  }

  // Fetch PSI Data
  let psiData = null;
  if (url) {
    const psiApiKey = process.env.PSI_API_KEY || 'AIzaSyBlp2RAKJY40LUJPx-mrY93225m_9Q-h9Y';
    console.log('⚡ Fetching Performance Data from Google PageSpeed Insights API...');
    try {
      const psiUrl = `${url}${url.includes('?') ? '&' : '?'}_cwv_ts=${Date.now()}`;
      const psiMobileRes = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(psiUrl)}&key=${psiApiKey}&strategy=mobile`);
      const psiDesktopRes = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(psiUrl)}&key=${psiApiKey}&strategy=desktop`);
      
      if (psiMobileRes.ok && psiDesktopRes.ok) {
        const mobileJson = await psiMobileRes.json();
        const desktopJson = await psiDesktopRes.json();
        
        psiData = {
          mobile: extractScores(mobileJson.lighthouseResult),
          desktop: extractScores(desktopJson.lighthouseResult),
          mobileField: mobileJson.loadingExperience,
          desktopField: desktopJson.loadingExperience
        };
        console.log('PageSpeed Insights Data (including Field Data) fetched successfully.');
      } else {
        console.warn(`PSI API failed. Mobile: ${psiMobileRes.status}, Desktop: ${psiDesktopRes.status}`);
      }
    } catch (err) {
      console.warn('PSI API fetch failed:', err.message);
    }
  }

  // Step 5: Compile recommendations
  console.log('Compiling findings and calculations...');
  const astElements = [];
  reactAsts.forEach(ra => {
    if (ra.ast && Array.isArray(ra.ast.jsxTags)) {
      ra.ast.jsxTags.forEach(tag => {
        tag.fileFunctions = ra.ast.functions || {};
        tag.fileCalls = ra.ast.calls || {};
      });
      astElements.push(...ra.ast.jsxTags);
    }
  });
  const compiledResult = compileRecommendations(staticIssues, lighthouseData, astElements, files);

  // Step 6: Automatically enrich priority findings with GitHub Copilot AI Advisor
  let enrichedResult = compiledResult;
  if (!args.includes('--no-ai')) {
    let copilot = null;
    try {
      console.log('🤖 Generating automatic AI-powered recommendations with GitHub Copilot...');
      const { CopilotService } = await import('./services/copilotService.js');
      const { enrichAuditWithCopilot } = await import('./analyzers/aiAdvisor.js');
      copilot = new CopilotService();
      enrichedResult = await enrichAuditWithCopilot(compiledResult, {
        copilotService: copilot,
        url,
        maxIssues: 5,
        totalTimeoutMs: 90000
      });
      const analyzedCount = enrichedResult.aiAdvisor?.analyzedCount || 0;
      console.log(`✓ Copilot AI recommendations generated (${analyzedCount} priority findings enriched).`);
    } catch (aiErr) {
      console.warn(`⚠️ Copilot auto-enrichment skipped: ${aiErr.message}. Proceeding with deterministic report.`);
      enrichedResult.aiAdvisor = { status: 'unavailable', error: aiErr.message };
    } finally {
      if (copilot) {
        await copilot.stop().catch(() => {});
      }
    }
  } else {
    enrichedResult.aiAdvisor = { status: 'skipped', note: 'AI enrichment disabled via --no-ai flag.' };
  }

  // Get Client/Project Name from package.json or folder name
  let clientName = path.basename(targetPath);
  try {
    const targetPackageJsonPath = path.join(targetPath, 'package.json');
    if (fs.existsSync(targetPackageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(targetPackageJsonPath, 'utf8'));
      if (pkg.name) {
        clientName = pkg.name;
      }
    }
  } catch (err) {
    // Ignore
  }

  // Get current active Git branch
  let gitBranch = explicitBranch || 'N/A';
  if (gitBranch === 'N/A') {
    try {
      gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: targetPath, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
    } catch (err) {
      try {
        gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: process.cwd(), stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
      } catch (e) {
        // Not a git repo
      }
    }
  }
  if (!gitBranch || gitBranch === 'N/A') {
    gitBranch = 'main';
  }
  console.log(`🌿 Active Git Branch: ${gitBranch}`);

  // Step 7: Generate reports
  console.log('Generating report outputs...');
  const reports = await generateReport(enrichedResult, {
    projectPath: targetPath,
    url,
    lighthouseData,
    cruxData,
    cruxHistoryData,
    psiData,
    clientName,
    gitBranch,
    remoteDeployment
  });

  console.log(`\n==========================================`);
  console.log(`CWV Audit Completed!`);
  console.log(`Health Score: ${compiledResult.healthScore}/100`);
  console.log(`Total Issues: ${compiledResult.summary.total} (High: ${compiledResult.summary.high}, Medium: ${compiledResult.summary.medium}, Low: ${compiledResult.summary.low})`);
  console.log(`==========================================\n`);
}

main().catch(err => {
  console.error(`Execution crashed:`, err);
  process.exit(1);
});
