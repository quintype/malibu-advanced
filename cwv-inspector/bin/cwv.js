#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { startFixtureServer } from '../tests/fixtures/demo-app/serveFixture.js';
import { collectInpMetrics, charOffsetToLineCol } from '../collector/index.js';
import { resolveSourceLocation, resolveElementSelector } from '../sourcemap/index.js';
import { runDeepAnalysis } from '../analyzers/deepAnalyzer.js';

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

const args = process.argv.slice(2);
const command = args[0];
const flags = {
  url: null,
  path: null,
  format: 'console',
  interactions: null,
  includeLow: args.includes('--include-low'),
  apply: args.includes('--apply'),
  verify: args.includes('--verify')
};

for (let i = 1; i < args.length; i++) {
  if (args[i] === '--path' && args[i + 1]) {
    flags.path = args[++i];
  } else if (args[i] === '--format' && args[i + 1]) {
    flags.format = args[++i];
  } else if (args[i] === '--interactions' && args[i + 1]) {
    flags.interactions = args[++i];
  } else if (!args[i].startsWith('--') && !flags.url) {
    flags.url = args[i];
  }
}

if (command !== 'analyze') {
  console.log(`Usage: cwv analyze <url> [--path <dir>] [--format json|md|html|console] [--interactions <file.json>] [--include-low] [--apply] [--verify]`);
  process.exit(1);
}

if (!flags.url) {
  console.log(`Error: URL required`);
  process.exit(1);
}

if (!flags.path) {
  console.log(`Error: --path <dir> required`);
  process.exit(1);
}

async function resolveLoafScript(script, workspaceRoot) {
  if (!script) return null;
  const sourcePath = path.resolve(workspaceRoot, new URL(script.sourceURL).pathname.replace(/^\//, ''));
  if (!fs.existsSync(sourcePath)) return null;
  const code = fs.readFileSync(sourcePath, 'utf8');
  const pos = charOffsetToLineCol(code, script.sourceCharPosition);
  if (!pos) throw new Error(`Cannot map char offset ${script.sourceCharPosition} in ${sourcePath}`);
  return resolveSourceLocation({
    sourceURL: script.sourceURL,
    line: pos.line,
    column: pos.column,
    functionName: script.sourceFunctionName,
    workspaceRoot
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
    let url = flags.url;
    const workspaceRoot = path.resolve(process.cwd(), flags.path);

    if (url === 'fixture') {
      if (!fs.existsSync(workspaceRoot)) throw new Error(`--path directory not found: ${workspaceRoot}`);
      server = await startFixtureServer(0, workspaceRoot);
      url = server.url;
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      console.error(`Error: url must be 'fixture' or an http(s) URL`);
      process.exit(1);
    }

    const interactions = flags.interactions
      ? JSON.parse(fs.readFileSync(path.resolve(process.cwd(), flags.interactions), 'utf8'))
      : DEFAULT_INTERACTIONS;
    if (!Array.isArray(interactions) || interactions.length === 0) throw new Error('--interactions must be a non-empty JSON array of { selector, type, text?, label? }');

    // Collector: INP interactions, LCP (+subparts, resource timing) and CLS shifts all come from this one call
    const collected = await collectInpMetrics({
      url: `${url}/index.html`,
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
        const res = resolveElementSelector({ selector: form, workspaceRoot });
        if (res.file) return { ...res, causeSelector: sel };
      }
      return { selector: sel, causeSelector: sel, file: '', matchType: 'unresolved', confidence: 'low' };
    });

    const resolvedLocations = {
      culpritScript: await resolveLoafScript(worstScript, workspaceRoot),
      culpritFilterScript: await resolveLoafScript(filterScript, workspaceRoot),
      elements: {
        inpTarget: collected.worstInteraction ? resolveElementSelector({ selector: collected.worstInteraction.target, workspaceRoot }) : null,
        filterTarget: filterTested ? resolveElementSelector({ selector: filterTested.target, workspaceRoot }) : null,
        lcpTarget: resolveElementSelector({ selector: collected.metrics.lcp?.element, workspaceRoot }),
        clsTargets
      }
    };

    const step1Output = {
      metrics: collected.metrics,
      worstInteraction: collected.worstInteraction,
      interactionsTested: collected.interactionsTested
    };
    const step2Output = { resolvedLocations };

    const issues = runDeepAnalysis({ step1Output, step2Output, workspaceRoot });

    console.log(JSON.stringify({
      source: 'live-run',
      url: collected.url,
      timestamp: collected.timestamp,
      throttling: collected.throttling,
      metrics: collected.metrics,
      interactionsTested: collected.interactionsTested,
      worstInteraction: collected.worstInteraction,
      interactions: {
        source: flags.interactions ? `--interactions ${flags.interactions}` : 'default',
        list: interactions,
        skipped: collected.interactionsSkipped
      },
      resolvedLocations,
      issues
    }, null, 2));

    await cleanup();
  } catch (err) {
    console.error(err.stack || err.message);
    await cleanup();
    process.exit(1);
  }
}

main();
