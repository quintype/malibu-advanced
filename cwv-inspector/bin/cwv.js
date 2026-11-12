#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execFileSync } from 'child_process';
import { startFixtureServer } from '../tests/fixtures/demo-app/serveFixture.js';
import { collectInpMetrics, charOffsetToLineCol, setRepoRoot } from '../collector/index.js';
import { resolveSourceLocation, resolveElementSelector } from '../sourcemap/index.js';
import { runDeepAnalysis } from '../analyzers/deepAnalyzer.js';
import { generateFixesForIssues, applyValidatedFixes, setMockCopilotHandler } from '../generator/index.js';
import { prioritizeRuntimeIssues } from '../analyzers/recommendations.js';

// Default targets are optional: a page that lacks one is measured without it and the skip is reported.
// Forms a cause selector may be resolvable under: as reported, its last compound token, and that token without its tag.
function selectorForms(sel) {
  const tail = sel.trim().split(/\s+/).pop();
  return [...new Set([sel, tail, tail.replace(/^[a-z][a-z0-9-]*(?=[.#])/i, '')])];
}

const USAGE = 'Usage: cwv analyze <url|fixture> --path <dir> [--interactions <file.json>] [--copilot | --mock-copilot <file.json>] [--apply | --verify] [--format json|console|md|html]';

// Flags that are recognised but not built yet must fail loudly instead of being accepted and ignored.
const NOT_IMPLEMENTED = ['--include-low'];

const args = process.argv.slice(2);
const command = args[0];
const flags = {
  url: null,
  path: null,
  format: 'json',
  interactions: null,
  apply: false,
  verify: false,
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
  } else if (args[i] === '--apply') {
    flags.apply = true;
  } else if (args[i] === '--verify') {
    flags.verify = true;
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
if (!['json', 'console', 'md', 'html'].includes(flags.format)) {
  console.error(`Error: --format ${flags.format} is not implemented (available: json, console, md, html).`);
  process.exit(1);
}
if (flags.copilot && flags.mockCopilot) {
  console.error('Error: --copilot and --mock-copilot are mutually exclusive.');
  process.exit(1);
}
if (flags.apply && flags.verify) {
  console.error('Error: --apply and --verify are mutually exclusive.');
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

function issueDetails(issue) {
  const location = issue.location?.file
    ? `${issue.location.file}${issue.location.line_start ? `:${issue.location.line_start}` : ''}${issue.location.element ? ` (${issue.location.element})` : ''}`
    : 'unresolved';
  return {
    location,
    problem: issue.problem || '',
    evidence: issue.evidence || [],
    root_cause: issue.root_cause || '',
    diff: issue.fix?.diff || '',
    why_it_works: issue.fix?.why_it_works || '',
    tradeoffs: issue.fix?.tradeoffs || issue.tradeoffs || '',
    estimate_vs_measured: issue.estimate_vs_measured || { estimated_gain: issue.estimated_gain ?? null, measured_improvement: issue.measured_improvement ?? null },
    source: issue.source || 'live-run',
    confidence: issue.confidence || 'unknown'
  };
}

function renderReport(report, format) {
  if (format === 'json') return JSON.stringify(report, null, 2);
  const rows = report.issues.map(issue => ({ issue, ...issueDetails(issue) }));
  const hidden = report.hiddenIssues.map(i => `${i.metric}: ${i.problem || i.rootCauseCategory} — ${i.hidden_reason}`).join('\n');
  if (format === 'console') {
    const lines = [`CWV report (${report.source})`, `Hidden issues: ${report.hiddenCount}`, ...rows.map(({ issue, ...d }) => [
      `\n[${issue.priority}] ${issue.metric} (score ${Number(issue.priority_score || 0).toFixed(3)})`,
      `Location: ${d.location}`, `Problem: ${d.problem}`, `Evidence: ${JSON.stringify(d.evidence)}`,
      `Root cause: ${d.root_cause}`, `Diff:\n${d.diff || '(none)'}`, `Why it works: ${d.why_it_works}`,
      `Tradeoffs: ${d.tradeoffs}`, `Estimate vs measured: ${JSON.stringify(d.estimate_vs_measured)}`,
      `Source: ${d.source}; confidence: ${d.confidence}`
    ].join('\n'))];
    if (hidden) lines.push(`\nHidden issue reasons:\n${hidden}`);
    if (report.apply) lines.push(`\nApply results:\n${JSON.stringify(report.apply, null, 2)}`);
    if (report.verification) lines.push(`\nVerification:\n${JSON.stringify(report.verification, null, 2)}`);
    return lines.join('\n');
  }
  if (format === 'md') {
    return [`# CWV report`, `Source: ${report.source}`, `Hidden issue count: ${report.hiddenCount}`, ...rows.map(({ issue, ...d }) => [
      `## ${issue.priority} ${issue.metric}`, `- Location: ${d.location}`, `- Problem: ${d.problem}`,
      `- Evidence: ${JSON.stringify(d.evidence)}`, `- Root cause: ${d.root_cause}`,
      `- Diff:\n\n\`\`\`diff\n${d.diff}\n\`\`\``, `- Why it works: ${d.why_it_works}`,
      `- Tradeoffs: ${d.tradeoffs}`, `- Estimate vs measured: ${JSON.stringify(d.estimate_vs_measured)}`,
      `- Source: ${d.source}; confidence: ${d.confidence}`
    ].join('\n')), `## Hidden issues\n${hidden || 'None'}`, ...(report.apply ? [`## Apply results\n\n\`\`\`json\n${JSON.stringify(report.apply, null, 2)}\n\`\`\``] : []), ...(report.verification ? [`## Verification\n\n\`\`\`json\n${JSON.stringify(report.verification, null, 2)}\n\`\`\``] : [])].join('\n\n');
  }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  return `<!doctype html><meta charset="utf-8"><title>CWV report</title><h1>CWV report</h1><p>Source: ${esc(report.source)}; hidden issue count: ${report.hiddenCount}</p>${rows.map(({ issue, ...d }) => `<article><h2>${esc(issue.priority)} ${esc(issue.metric)}</h2><dl>${['location','problem','evidence','root_cause','why_it_works','tradeoffs','estimate_vs_measured','source','confidence'].map(k => `<dt>${esc(k)}</dt><dd><pre>${esc(typeof d[k] === 'string' ? d[k] : JSON.stringify(d[k], null, 2))}</pre></dd>`).join('')}</dl><h3>Diff</h3><pre>${esc(d.diff || '(none)')}</pre></article>`).join('')}<h2>Hidden issue reasons</h2><pre>${esc(hidden || 'None')}</pre>${report.apply ? `<h2>Apply results</h2><pre>${esc(JSON.stringify(report.apply, null, 2))}</pre>` : ''}${report.verification ? `<h2>Verification</h2><pre>${esc(JSON.stringify(report.verification, null, 2))}</pre>` : ''}`;
}

function interactionByTarget(result, selector) {
  return result.interactionsTested?.find(item => item.target === selector) || null;
}

function cleanRunValues(item, field = 'duration') {
  if (!item) return [];
  const raw = item.rawRunDurations || [];
  if (field === 'handlerCompletion') {
    return (item.handlerCompletionDurations || []).filter((value, i) => Number.isFinite(value) && !raw[i]?.calibrationSuspect);
  }
  return raw.filter(run => !run.calibrationSuspect && Number.isFinite(run[field])).map(run => run[field]);
}

function medianValue(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function applyIssueEditsToCopy(issues, sourceRoot, copyRoot, repoRoot) {
  const repoPrefix = path.relative(repoRoot, sourceRoot);
  const fixes = issues.filter(issue => issue.fix_validated === true && issue.fix?.fix_validated !== false && issue.ineffective !== true && issue.fix?.ineffective !== true && Array.isArray(issue.fix?.edits));
  if (!fixes.length) return { applied: [], reason: 'No validated, effective fixes are available to verify.' };
  const applied = [];
  for (const issue of fixes) {
    const fromRepo = path.relative(repoPrefix, issue.fix.fix_target_file);
    if (fromRepo.startsWith('..') || path.isAbsolute(fromRepo)) throw new Error(`Fix target ${issue.fix.fix_target_file} is outside the analyzed copy.`);
    const targetPath = path.resolve(copyRoot, fromRepo);
    let content = fs.readFileSync(targetPath, 'utf8');
    for (const edit of issue.fix.edits) {
      const first = content.indexOf(edit.original_snippet);
      if (first < 0 || content.indexOf(edit.original_snippet, first + 1) >= 0) throw new Error(`Verified edit snippet is missing or ambiguous in ${fromRepo}.`);
      content = content.slice(0, first) + edit.replacement_snippet + content.slice(first + edit.original_snippet.length);
    }
    fs.writeFileSync(targetPath, content);
    applied.push({ metric: issue.metric, fix_target_file: issue.fix.fix_target_file });
  }
  return { applied, reason: null };
}

async function verifyFixesOnTemporaryCopy(issues, sourceRoot, repoRoot, before, interactions) {
  const method = 'Temporary copy; one discarded warm-up and five fresh-page runs per interaction; calibrationSuspect samples excluded from summaries.';
  if (!String(before.url).startsWith('http://localhost:') && !String(before.url).startsWith('http://127.0.0.1:')) {
    return { status: 'not run', source: 'live-run', method, reason: 'Verification is limited to a fixture served from a local copy; the analyzed URL is not a local fixture server.' };
  }
  const tempParent = fs.mkdtempSync(path.join(os.tmpdir(), 'cwv-verify-'));
  const copyRoot = path.join(tempParent, 'site');
  let server = null;
  try {
    fs.cpSync(sourceRoot, copyRoot, { recursive: true, filter: entry => !entry.split(path.sep).includes('node_modules') && !entry.split(path.sep).includes('.git') });
    const copied = applyIssueEditsToCopy(issues, sourceRoot, copyRoot, repoRoot);
    if (!copied.applied.length) return { status: 'not run', source: 'live-run', method, reason: copied.reason };
    server = await startFixtureServer(0, copyRoot);
    const after = await collectInpMetrics({ url: `${server.url}/index.html`, cpuThrottlingRate: 4, runs: 5, customInteractions: interactions });
    const targets = before.interactionsTested.map(interaction => interaction.target);
    const interactionsReport = {};
    for (const selector of targets) {
      const a = interactionByTarget(before, selector);
      const b = interactionByTarget(after, selector);
      const handlerBefore = cleanRunValues(a, 'handlerCompletion');
      const handlerAfter = cleanRunValues(b, 'handlerCompletion');
      interactionsReport[selector] = {
        inp_median_before_ms: a?.duration?.median ?? null,
        inp_median_after_ms: b?.duration?.median ?? null,
        raw_valid_runs_before_ms: cleanRunValues(a),
        raw_valid_runs_after_ms: cleanRunValues(b),
        total_handler_completion_before_ms: medianValue(handlerBefore),
        total_handler_completion_after_ms: medianValue(handlerAfter),
        raw_handler_completion_before_ms: handlerBefore,
        raw_handler_completion_after_ms: handlerAfter,
        runs_excluded_for_calibration_before: a?.duration?.runsExcludedForCalibration ?? null,
        runs_excluded_for_calibration_after: b?.duration?.runsExcludedForCalibration ?? null,
        source: 'live-run'
      };
    }
    const clsBefore = before.metrics.cls?.value ?? null;
    const clsAfter = after.metrics.cls?.value ?? null;
    const clsRawBefore = (before.metrics.cls?.shifts || []).map(s => s.value);
    const clsRawAfter = (after.metrics.cls?.shifts || []).map(s => s.value);
    const verification = {
      status: 'measured', source: 'live-run', method, fixesAppliedToCopy: copied.applied,
      interactions: interactionsReport,
      cls: { before: clsBefore, after: clsAfter, rawShiftValuesBefore: clsRawBefore, rawShiftValuesAfter: clsRawAfter, fixes: [], source: 'live-run' }
    };
    for (const issue of issues) {
      if (!issue.fix_validated || issue.fix?.ineffective) continue;
      if (issue.metric === 'INP') {
        const row = interactionsReport[issue.location?.element];
        if (!row || !Number.isFinite(row.inp_median_before_ms) || !Number.isFinite(row.inp_median_after_ms)) continue;
        issue.measured_improvement = { metric_before: row.inp_median_before_ms, metric_after: row.inp_median_after_ms, metric_delta: row.inp_median_before_ms - row.inp_median_after_ms, unit: 'ms', source: 'live-run' };
      } else if (issue.metric === 'CLS' && Number.isFinite(issue.shiftScore)) {
        const selectorKey = String(issue.location?.element || '').replace(/^[a-z][a-z0-9-]*[.#]/i, '').replace(/^[.#]/, '');
        const sameCause = shift => {
          const cause = shift.matchedCause;
          const causeSelector = cause?.image?.selector || cause?.selector || '';
          return causeSelector && String(causeSelector).replace(/^[a-z][a-z0-9-]*[.#]/i, '').replace(/^[.#]/, '') === selectorKey;
        };
        const afterCauseShifts = after.metrics.cls?.shifts?.filter(sameCause) || [];
        const afterCause = Math.round(afterCauseShifts.reduce((sum, shift) => sum + (shift.value || 0), 0) * 1000) / 1000;
        const causeKey = issue.location?.element || issue.rootCauseCategory;
        verification.cls.fixes.push({ selector: causeKey, before: issue.shiftScore, after: afterCause, source: 'live-run' });
        issue.measured_improvement = { metric_before: issue.shiftScore, metric_after: afterCause, metric_delta: issue.shiftScore - afterCause, unit: 'CLS', source: 'live-run', note: 'Cause-specific shift score before and after the fix on fresh-page runs.' };
      }
      issue.estimate_vs_measured = { estimated_gain: issue.estimated_gain ?? null, measured_improvement: issue.measured_improvement };
    }
    return verification;
  } catch (err) {
    return { status: 'not run', source: 'live-run', method, reason: err.message };
  } finally {
    if (server) await server.close();
    fs.rmSync(tempParent, { recursive: true, force: true });
  }
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

    const defaultInteractionsFile = path.join(scanRoot, 'cwv-interactions.json');
    const interactions = flags.interactions
      ? JSON.parse(fs.readFileSync(path.resolve(process.cwd(), flags.interactions), 'utf8'))
      : fs.existsSync(defaultInteractionsFile) ? JSON.parse(fs.readFileSync(defaultInteractionsFile, 'utf8')) : [];
    if (!Array.isArray(interactions)) throw new Error('--interactions must contain a JSON array of { selector, type, text?, label? }');

    if (flags.mockCopilot) registerMockCopilot(flags.mockCopilot, scanRoot, repo.root);

    // Collector: INP interactions, LCP (+subparts, resource timing) and CLS shifts all come from this one call
    const collected = await collectInpMetrics({
      url: pageUrl,
      cpuThrottlingRate: 4,
      runs: 5,
      customInteractions: interactions
    });

    // Source mapper: culprit script of the worst interaction and configured filter interaction, if present
    const worstTested = collected.interactionsTested.find(i => i.target === collected.worstInteraction?.target);
    const worstScript = worstTested?.scripts?.[0] ?? null;
    const filterDefinition = interactions.find(i => /filter/i.test(i.label || ''));
    const filterTested = filterDefinition && collected.interactionsTested.find(i => i.target === filterDefinition.selector);
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
    const applyResult = flags.apply ? applyValidatedFixes(issuesWithFixes, repo.root) : null;
    const verifyResult = flags.verify ? await verifyFixesOnTemporaryCopy(issuesWithFixes, scanRoot, repo.root, collected, interactions) : null;

    const prioritized = prioritizeRuntimeIssues(issuesWithFixes);
    const report = {
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
      issues: prioritized.issues,
      hiddenIssues: prioritized.hiddenIssues,
      hiddenCount: prioritized.hiddenCount,
      apply: applyResult,
      verification: verifyResult
    };
    console.log(renderReport(report, flags.format));

    await cleanup();
  } catch (err) {
    console.error(err.stack || err.message);
    await cleanup();
    process.exit(1);
  }
}

main();
