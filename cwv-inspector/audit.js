#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { scanFiles } from './scanners/scanFiles.js';
import { parseReactCode } from './scanners/parseReact.js';
import { scanDependencies } from './scanners/dependencyScanner.js';
import { runLighthouseAudit } from './analyzers/lighthouse.js';

import { analyzeLcp } from './analyzers/lcp.js';
import { analyzeCls } from './analyzers/cls.js';
import { analyzeInp } from './analyzers/inp.js';
import { analyzeImages } from './analyzers/images.js';
import { analyzeFonts } from './analyzers/fonts.js';
import { analyzeCss } from './analyzers/css.js';
import { analyzeJavascript } from './analyzers/javascript.js';
import { analyzeReact } from './analyzers/react.js';
import { analyzeBundle } from './analyzers/bundle.js';
import readline from 'readline/promises';
import { compileRecommendations } from './analyzers/recommendations.js';
import { generateReport } from './report/generatePdf.js';

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
  --url <url>      Run Lighthouse performance audit against a live/local URL
  --help, -h       Show this usage guide
    `);
    process.exit(0);
  }

  let targetPathInput = '';
  let url = null;

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

    const folderIndexStr = await rl.question('\nSelect a folder number or enter a custom path (default is current folder \'.\'): ');
    const idx = parseInt(folderIndexStr, 10) - 1;
    if (directories[idx] && idx >= 0 && idx < directories.length) {
      targetPathInput = path.join(parentDir, directories[idx]);
    } else {
      targetPathInput = folderIndexStr.trim() || '.';
    }

    const urlInput = await rl.question('Enter website URL to audit (optional, e.g. https://example.com): ');
    url = urlInput.trim() || null;
    
    rl.close();
  } else {
    targetPathInput = args[0];
    const urlIndex = args.indexOf('--url');
    if (urlIndex !== -1 && args[urlIndex + 1]) {
      url = args[urlIndex + 1];
    }
  }

  const targetPath = path.resolve(targetPathInput);
  if (!fs.existsSync(targetPath)) {
    console.error(`Error: Target project path "${targetPath}" does not exist.`);
    process.exit(1);
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
  if (url) {
    lighthouseData = await runLighthouseAudit(url);
  }

  // Fetch optional Chrome UX Report (CrUX) Field Data
  let cruxData = null;
  if (url && process.env.CRUX_API_KEY) {
    console.log('⚡ Fetching Field Data from Google CrUX API...');
    try {
      const cruxRes = await fetch(`https://chromeuxreport.googleapis.com/v1/records:queryRecord?key=${process.env.CRUX_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url })
      });
      if (cruxRes.ok) {
        cruxData = await cruxRes.json();
        console.log('CrUX Field Data fetched successfully.');
      } else {
        const errText = await cruxRes.text();
        console.warn(`CrUX API status ${cruxRes.status}: ${errText}`);
      }
    } catch (err) {
      console.warn('CrUX Field Data fetch failed:', err.message);
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
  const compiledResult = compileRecommendations(staticIssues, lighthouseData, astElements);

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
  let gitBranch = 'N/A';
  try {
    gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { cwd: targetPath, stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
  } catch (err) {
    // Not a git repo
  }

  // Step 6: Generate reports
  console.log('Generating report outputs...');
  const reports = await generateReport(compiledResult, {
    projectPath: targetPath,
    url,
    lighthouseData,
    cruxData,
    clientName,
    gitBranch
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
