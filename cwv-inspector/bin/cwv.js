#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { startFixtureServer } from '../tests/fixtures/demo-app/serveFixture.js';
import { collectInpMetrics, charOffsetToLineCol, setRepoRoot } from '../collector/index.js';
import { resolveSourceLocation, resolveElementSelector } from '../sourcemap/index.js';
import { runDeepAnalysis } from '../analyzers/deepAnalyzer.js';
import { generateFixesForIssues } from '../generator/fixGenerator.js';
import { setMockCopilotHandler } from '../generator/copilotClient.js';

// Default targets are optional: a page that lacks one is measured without it and the skip is reported.
const DEFAULT_INTERACTIONS = [
  { selector: '#slow-click-btn', type: 'click', label: 'Slow Button Click Task', optional: true },
  { selector: '#menu-toggle', type: 'click', label: 'Fast Menu Toggle', optional: true },
  { selector: '#search-input', type: 'type', text: 'quick test', label: 'Fast Search Input', optional: true },
  { selector: '#filter-input', type: 'type', text: 'product query', label: 'Interactive Component Filter', optional: true }
];

// Forms a cause selector may be resolvable under: as reported, its last compound token, and that token without its tag.
function selectorForms(sel) {
  const tail = sel.trim().split(/\s+/).pop();
  return [...new Set([sel, tail, tail.replace(/^[a-z][a-z0-9-]*(?=[.#])/i, '')])];
}

const USAGE = 'Usage: cwv analyze <url|fixture> --path <dir> [--interactions <file.json>] [--copilot | --mock-copilot <file.json>] [--format json]';

// Flags that are recognised but not built yet must fail loudly instead of being accepted and ignored.
const NOT_IMPLEMENTED = ['--apply', '--verify', '--include-low'];

const args = process.argv.slice(2);
const command = args[0];
const flags = {
  url: null,
  path: null,
  format: 'json',
  interactions: null,
  copilot: false,
  mockCopilot: null
};

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--path' && args[i + 1]) {
    flags.path = args[++i];
  } else if (args[i] === '--format' && args[i + 1]) {
    flags.format = args[++i];
  } else if (args[i] === '--interactions' && args[i + 1]) {
    flags.interactions = args[++i];
  } else if (args[i] === '--mock-copilot' && args[i + 1]) {
    flags.mockCopilot = args[++i];
  } else if (args[i] === '--copilot') {
    flags.copilot = true;
  } else if (NOT_IMPLEMENTED.includes(args[i])) {
    console.error(`Error: ${args[i]} is not implemented yet.`);
    process.exit(1);
  } else if (args[i].startsWith('--')) {
    console.error(`Error: unknown flag ${args[i]}.\n${USAGE}`);
    process.exit(1);
  } else if (!flags.url) {
    flags.url = args[i];
  }
}

if (command !== 'analyze') {
  console.log(USAGE);
  process.exit(1);
}
if (!flags.url) {
  console.log('Error: URL required');
  process.exit(1);
}
if (!flags.path) {
  console.log('Error: --path <dir> required');
  process.exit(1);
}
if (flags.format !== 'json') {
  console.error(`Error: --format ${flags.format} is not implemented yet (available: json).`);
  process.exit(1);
}
if (flags.copilot && flags.mockCopilot) {
  console.error('Error: --copilot and --mock-copilot are mutually exclusive.');
  process.exit(1);
}

async function resolveLoafScript(script, scanRoot) {
  if (!script) return null;
  const sourcePath = path.resolve(scanRoot, new URL(script.sourceURL).pathname.replace(/^\//, ''));
  if (!fs.existsSync(sourcePath)) return null;
  const code = fs.readFileSync(sourcePath, 'utf8');
  const pos = charOffsetToLineCol(code, script.sourceCharPosition);
  if (!pos) throw new Error(`Cannot map char offset ${script.sourceCharPosition} in ${sourcePath}`);
  return resolveSourceLocation({
    sourceURL: script.sourceURL,
    line: pos.line,
    column: pos.column,
    functionName: script.sourceFunctionName,
    workspaceRoot: scanRoot
  });
}

/** Git top-level of the analyzed directory, or the directory itself when it is not inside a git repository. */
function findRepoRoot(scanRoot) {
  try {
    const top = execFileSync('git', ['-C', scanRoot, 'rev-parse', '--show-toplevel'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
    return { root: top, isGit: true };
  } catch {
    return { root: scanRoot, isGit: false };
  }
}

/** Registers stored responses with the Copilot client interface. Stored `file` paths are relative to the scanned directory. */
function registerMockCopilot(file, scanRoot, repoRoot) {
  const spec = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), file), 'utf8'));
  if (!Array.isArray(spec.responses) || spec.responses.length === 0) throw new Error(`--mock-copilot ${file} must contain a non-empty "responses" array`);
  setMockCopilotHandler(async ({ issue }) => {
    const entry = spec.responses.find(r => Object.entries(r.match || {}).every(([key, value]) => issue.location?.[key] === value));
    if (!entry) throw new Error(`mock-copilot: no stored response matches ${JSON.stringify(issue.location?.name ?? issue.location?.element ?? null)}`);
    const repoRelative = path.relative(repoRoot, path.resolve(scanRoot, entry.response.file)).replace(/\\/g, '/');
    return { ...entry.response, file: repoRelative, fix_target_file: repoRelative };
  });
}

async function main() {
  let server = null;

  const cleanup = async () => {
    if (server) {
      await server.close();
      server = null;
    }
  };

  process.on('SIGINT', async () => {
    await cleanup();
    process.exit(0);
  });

  try {
    const scanRoot = path.resolve(process.cwd(), flags.path);
    const repo = findRepoRoot(scanRoot);
    setRepoRoot(repo.root);

    const isFixture = flags.url === 'fixture';
    let pageUrl;
    if (isFixture) {
      if (!fs.existsSync(scanRoot)) throw new Error(`--path directory not found: ${scanRoot}`);
      server = await startFixtureServer(0, scanRoot);
      pageUrl = `${server.url}/index.html`;
    } else if (/^https?:\/\//.test(flags.url)) {
      pageUrl = flags.url;
    } else {
      console.error(`Error: url must be 'fixture' or an http(s) URL`);
      process.exit(1);
    }

    const interactions = flags.interactions
      ? JSON.parse(fs.readFileSync(path.resolve(process.cwd(), flags.interactions), 'utf8'))
      : DEFAULT_INTERACTIONS;
    if (!Array.isArray(interactions) || interactions.length === 0) throw new Error('--interactions must be a non-empty JSON array of { selector, type, text?, label? }');

    if (flags.mockCopilot) registerMockCopilot(flags.mockCopilot, scanRoot, repo.root);

    // Collector: INP interactions, LCP (+subparts, resource timing) and CLS shifts all come from this one call
    const collected = await collectInpMetrics({
      url: pageUrl,
      cpuThrottlingRate: 4,
      runs: 5,
      customInteractions: interactions
    });

    // Source mapper: culprit script of the worst interaction, and of #filter-input if tested
    const worstTested = collected.interactionsTested.find(i => i.target === collected.worstInteraction?.target);
    const worstScript = worstTested?.scripts?.[0] ?? null;
    const filterTested = collected.interactionsTested.find(i => i.target === '#filter-input');
    const filterScript = filterTested?.scripts?.[0] || null;

    // CLS: locate the cause the collector matched to each shift (its selector comes from measured candidates)
    const causeSelectors = [...new Set((collected.metrics.cls?.shifts ?? [])
      .map(s => s.matchedCause?.selector)
      .filter(Boolean))];
    const clsTargets = causeSelectors.map(sel => {
      for (const form of selectorForms(sel)) {
        const res = resolveElementSelector({ selector: form, workspaceRoot: scanRoot });
        if (res.file) return { ...res, causeSelector: sel };
      }
      return { selector: sel, causeSelector: sel, file: '', matchType: 'unresolved', confidence: 'low' };
    });

    const resolvedLocations = {
      culpritScript: await resolveLoafScript(worstScript, scanRoot),
      culpritFilterScript: await resolveLoafScript(filterScript, scanRoot),
      elements: {
        inpTarget: collected.worstInteraction ? resolveElementSelector({ selector: collected.worstInteraction.target, workspaceRoot: scanRoot }) : null,
        filterTarget: filterTested ? resolveElementSelector({ selector: filterTested.target, workspaceRoot: scanRoot }) : null,
        lcpTarget: resolveElementSelector({ selector: collected.metrics.lcp?.element, workspaceRoot: scanRoot }),
        clsTargets
      }
    };

    const step1Output = {
      metrics: collected.metrics,
      worstInteraction: collected.worstInteraction,
      interactionsTested: collected.interactionsTested
    };
    const step2Output = { resolvedLocations };

    const issues = runDeepAnalysis({ step1Output, step2Output, workspaceRoot: scanRoot });

    // Fixes: paths are relative to the repository root; the analyzed page is known only for the served fixture
    const issuesWithFixes = await generateFixesForIssues(issues, {
      workspaceRoot: repo.root,
      searchRoot: scanRoot,
      pageFile: isFixture ? 'index.html' : undefined,
      copilot: flags.copilot || flags.mockCopilot ? 'on' : 'off'
    });

    console.log(JSON.stringify({
      source: 'live-run',
      url: collected.url,
      timestamp: collected.timestamp,
      throttling: collected.throttling,
      repo: { isGit: repo.isGit },
      copilot: flags.mockCopilot
        ? `not run: stored mock responses from ${path.basename(flags.mockCopilot)} used through the Copilot client interface`
        : flags.copilot ? 'requested: real Copilot calls attempted' : 'not run: pass --copilot (real) or --mock-copilot <file> (stored response)',
      metrics: collected.metrics,
      interactionsTested: collected.interactionsTested,
      worstInteraction: collected.worstInteraction,
      interactions: {
        source: flags.interactions ? `--interactions ${flags.interactions}` : 'default',
        list: interactions,
        skipped: collected.interactionsSkipped
      },
      resolvedLocations,
      issues: issuesWithFixes
    }, null, 2));

    await cleanup();
  } catch (err) {
    console.error(err.stack || err.message);
    await cleanup();
    process.exit(1);
  }
}

main();
