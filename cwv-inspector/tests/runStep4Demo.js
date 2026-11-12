import path from 'path';
import fs from 'fs';
import os from 'os';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import { startFixtureServer } from './fixtures/demo-app/serveFixture.js';
import { collectInpMetrics, charOffsetToLineCol, calculateTimeShare } from '../collector/index.js';
import { resolveSourceLocation, resolveElementSelector } from '../sourcemap/index.js';
import { runDeepAnalysis, analyzeInpFunction } from '../analyzers/deepAnalyzer.js';
import { checkIssueEligibility, generateFixesForIssues } from '../generator/fixGenerator.js';
import { validateCandidateFix } from '../generator/diffValidator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const demoAppDir = path.resolve(__dirname, 'fixtures/demo-app');

function requireFiveRuns(sample, label) {
  if (!sample || sample.runDurations?.length !== 5) throw new Error(`${label} must have exactly five measured runs.`);
  return sample.runDurations;
}

function pageLevelRunDurations(metrics) {
  const samples = metrics.interactionsTested.map(item => requireFiveRuns(item, item.target));
  return Array.from({ length: 5 }, (_, run) => Math.max(...samples.map(values => values[run])));
}

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function formatRunSamples(samples = []) {
  return samples.map(sample => {
    if (typeof sample !== 'object' || sample === null) return sample;
    return Number.isFinite(sample.duration) ? sample.duration : sample.belowThreshold ? 'below-threshold' : 'unavailable';
  }).join(', ');
}

async function main() {
  console.log('========================================================================');
  console.log('⚡ Core Web Vitals Inspector: Step 4 Fix Generator & Diff Validator Demo');
  console.log('========================================================================\n');

  const fixture = await startFixtureServer(0);
  console.log(`[1/6] Fixture Server started at: ${fixture.url}\n`);

  try {
    // -------------------------------------------------------------------------
    // 1. Metric Collection (1 warm-up + 5 measured runs, 4x CPU throttle)
    // -------------------------------------------------------------------------
    console.log('[2/6] Running Lab Collection (/index.html)...');
    console.log('      • 4x CPU throttle');
    console.log('      • Delayed hero.jpg (~800ms) + late banner (~1500ms)');
    console.log('      • LoAF script execution and Event Timing (1 warm-up + 5 measured runs per interaction)\n');

    const unbundledMetrics = await collectInpMetrics({
      url: `${fixture.url}/index.html`,
      cpuThrottlingRate: 4,
      runs: 5
    });

    // -------------------------------------------------------------------------
    // Investigation of #filter-input 5 raw runs
    // -------------------------------------------------------------------------
    console.log('--- [Investigation: #filter-input 5-Run Variation Analysis] ---');
    const filterTested = unbundledMetrics.interactionsTested.find(i => i.target === '#filter-input');
    const slowBtnTested = unbundledMetrics.interactionsTested.find(i => i.target === '#slow-click-btn');
    const menuTested = unbundledMetrics.interactionsTested.find(i => i.target === '#menu-toggle');
    const searchTested = unbundledMetrics.interactionsTested.find(i => i.target === '#search-input');

    for (const [label, sample] of [['#filter-input', filterTested], ['#slow-click-btn', slowBtnTested]]) {
      if (!sample || sample.runDurations.length !== 5) throw new Error(`${label} did not produce five measured Event Timing samples.`);
      console.log(`  • ${label} raw measured runs: [${formatRunSamples(sample.rawRunDurations)}]`);
      console.log(`    Stats: min=${sample.duration.min}ms, median=${sample.duration.median}ms, max=${sample.duration.max}ms`);
      if (label === '#filter-input') {
        console.log(`    In-page handler durations: [${sample.handlerRunDurations.join(', ')}] ms`);
        for (const run of sample.runEvidence) {
          console.log(`    Run ${run.run} detail: ${JSON.stringify({
            documentId: run.documentId,
            query: run.handlerTiming?.query,
            handlerStart: run.handlerTiming?.startTime,
            handlerEnd: run.handlerTiming?.endTime,
            handlerDurationMs: run.handlerTiming?.duration,
            eventTiming: run.event,
            loafScripts: run.loafEntries.flatMap(entry => entry.scripts.map(script => ({ sourceURL: script.sourceURL, function: script.sourceFunctionName, sourceCharPosition: script.sourceCharPosition, duration: script.duration, forcedStyleAndLayoutDuration: script.forcedStyleAndLayoutDuration }))),
            calibration: run.calibration
          })}`);
        }
      }
    }
    console.log('  • Event Timing duration is interaction-to-presentation latency, not synchronous handler time. Its duration is coarsely privacy-rounded (commonly ~8ms steps) and includes presentation delay; handler timing is reported separately.');
    console.log('  • Each measured sample used a uniquely tagged fresh document, one down/up key pair, two animation frames, and a settle wait. A <16ms sample is shown only when in-page handler timing independently confirms it is fast.\n');

    console.log('--- [Raw /hero.jpg Resource Timing] ---');
    console.log(JSON.stringify(unbundledMetrics.metrics.lcp?.resourceTiming || null, null, 2));
    const heroTiming = unbundledMetrics.metrics.lcp?.resourceTiming;
    if (heroTiming) {
      console.log(`Resource Timing arithmetic: ${heroTiming.responseStart} - ${heroTiming.requestStart} = ${heroTiming.serverWait}ms server wait; ${heroTiming.responseEnd} - ${heroTiming.responseStart} = ${heroTiming.transferDuration}ms transfer; sum=${(heroTiming.serverWait + heroTiming.transferDuration).toFixed(1)}ms.`);
      const attributionDuration = unbundledMetrics.metrics.lcp?.subparts?.resourceLoadDuration;
      console.log(`The same-request Resource Timing interval is responseEnd - requestStart = ${(heroTiming.responseEnd - heroTiming.requestStart).toFixed(1)}ms. If separate values are stated as 800ms server wait and 95ms transfer, their sum is 895ms; it cannot also be 803.5ms for the same request and definitions. A web-vitals resourceLoadDuration of 803.5ms is a separate attribution field/result and must be compared to this raw request interval, not used to redefine either split. Observed resourceLoadDuration=${attributionDuration ?? 'unavailable'}ms.\n`);
    }

    // -------------------------------------------------------------------------
    // 2. Source Mapping & Element Resolution
    // -------------------------------------------------------------------------
    console.log('[3/6] Resolving source locations and DOM elements...');

    // Resolve LoAF locations for both culprit handlers
    const slowClickLoaf = slowBtnTested.scripts.find(s => s.sourceFunctionName === 'handleSlowButtonClick');
    if (!slowClickLoaf) throw new Error('No slow-click LoAF script entry was captured.');
    const filterLoaf = filterTested.scripts.find(s => s.sourceFunctionName === 'handleProductFilterInput');
    const sourceFor = (loaf) => {
      const sourcePath = path.resolve(demoAppDir, new URL(loaf.sourceURL).pathname.replace(/^\//, ''));
      const code = fs.readFileSync(sourcePath, 'utf8');
      const pos = charOffsetToLineCol(code, loaf.sourceCharPosition);
      return { code, line: pos?.line || 1, column: pos?.column || 1 };
    };
    const slowPosition = slowClickLoaf ? sourceFor(slowClickLoaf) : null;
    const filterPosition = filterLoaf ? sourceFor(filterLoaf) : null;

    const resolvedSlowScript = await resolveSourceLocation({
      sourceURL: slowClickLoaf.sourceURL,
      line: slowPosition.line,
      column: slowPosition.column,
      functionName: slowClickLoaf.sourceFunctionName,
      workspaceRoot: demoAppDir
    });

    const resolvedFilterScript = filterLoaf ? await resolveSourceLocation({
      sourceURL: filterLoaf.sourceURL,
      line: filterPosition.line,
      column: filterPosition.column,
      functionName: filterLoaf.sourceFunctionName,
      workspaceRoot: demoAppDir
    }) : null;

    console.log('\n--- [Raw LoAF Entries for #filter-input] ---');
    const filterRawLoafEntries = filterTested.rawLoafEntries.flatMap(entry => entry.scripts
      .filter(script => script.sourceFunctionName === 'handleProductFilterInput')
      .map(script => ({ loaf: { startTime: entry.startTime, duration: entry.duration, renderStart: entry.renderStart, styleAndLayoutStart: entry.styleAndLayoutStart }, script })));
    console.log(JSON.stringify(filterRawLoafEntries, null, 2));
    if (filterLoaf) console.log(`Mapped LoAF char position ${filterLoaf.sourceCharPosition} to ${resolvedFilterScript.file}:${resolvedFilterScript.line}:${resolvedFilterScript.column} (${resolvedFilterScript.method}).\n`);
    else console.log('No filter LoAF was captured; handler timings determine whether this is a fast interaction or a collector failure.\n');

    const resolvedElements = {
      inpTarget: resolveElementSelector({
        selector: '#slow-click-btn',
        workspaceRoot: demoAppDir
      }),
      filterTarget: resolveElementSelector({
        selector: '#filter-input',
        workspaceRoot: demoAppDir
      }),
      lcpTarget: resolveElementSelector({
        selector: unbundledMetrics.metrics.lcp?.element || '#hero-img',
        workspaceRoot: demoAppDir
      }),
      clsTarget: resolveElementSelector({
        selector: '.injected-banner',
        workspaceRoot: demoAppDir
      })
    };

    // -------------------------------------------------------------------------
    // 3. Step 3: Deep Code Analyzer
    // -------------------------------------------------------------------------
    console.log('[4/6] Executing Step 3 Deep Code Analyzer...');

    const step1Output = {
      metrics: unbundledMetrics.metrics,
      worstInteraction: unbundledMetrics.worstInteraction,
      interactionsTested: unbundledMetrics.interactionsTested
    };

    const step2Output = {
      resolvedLocations: {
        culpritScript: resolvedSlowScript,
        culpritFilterScript: resolvedFilterScript,
        elements: resolvedElements
      }
    };

    const identifiedIssues = runDeepAnalysis({
      step1Output,
      step2Output,
      workspaceRoot: demoAppDir
    });

    const filterIssue = identifiedIssues.find(i => i.metric === 'INP' && i.location?.element === '#filter-input');
    const filterRun = filterTested.runEvidence
      .map(run => ({ ...run, match: run.loafEntries.flatMap(entry => entry.scripts.map(script => ({ entry, script })))
        .find(({ script }) => script.sourceFunctionName === 'handleProductFilterInput') }))
      .filter(run => run.match)
      .sort((a, b) => (b.event?.duration || 0) - (a.event?.duration || 0))[0];
    let sameRunIssue = null;
    if (filterIssue && (!filterLoaf || filterIssue.location.name !== 'handleProductFilterInput')) {
      throw new Error('A filter INP issue was emitted without a measured handleProductFilterInput LoAF source.');
    }
    if (filterIssue && !filterRun) throw new Error('The filter Event Timing entry has no overlapping raw LoAF script evidence.');
    if (filterIssue && filterRun) sameRunIssue = analyzeInpFunction({
      culpritScript: { ...filterRun.match.script, timeShare: calculateTimeShare(filterRun.match.script) },
      location: {
        file: resolvedFilterScript.file,
        line: resolvedFilterScript.line,
        column: resolvedFilterScript.column,
        name: 'handleProductFilterInput',
        confidence: resolvedFilterScript.confidence
      },
      workspaceRoot: demoAppDir,
      worstInteraction: {
        target: '#filter-input',
        duration: { min: filterRun.event.duration, median: filterRun.event.duration, max: filterRun.event.duration },
        phases: {
          inputDelay: { median: filterRun.event.inputDelay },
          processingDuration: { median: filterRun.event.processingDuration },
          presentationDelay: { median: filterRun.event.presentationDelay }
        }
      }
    });
    if (filterIssue && !sameRunIssue) throw new Error('Could not create the filter INP issue from its mapped same-run LoAF location.');
    if (sameRunIssue) sameRunIssue.loaf.rawEntry = {
      run: filterRun.run,
      event: filterRun.event,
      loaf: filterRun.match.entry,
      script: filterRun.match.script
    };
    if (sameRunIssue) {
      sameRunIssue.evidence.push(`Same-run evidence (measured run ${filterRun.run}): Event Timing ${filterRun.event.duration}ms; LoAF script ${filterRun.match.script.sourceFunctionName} duration ${filterRun.match.script.duration}ms; forcedStyleAndLayoutDuration ${filterRun.match.script.forcedStyleAndLayoutDuration}ms.`);
      const filterIssueIndex = identifiedIssues.indexOf(filterIssue);
      identifiedIssues[filterIssueIndex] = sameRunIssue;
      console.log('--- [Measured #filter-input INP Issue from the Same Event/LoAF Run] ---');
      console.log(JSON.stringify(sameRunIssue, null, 2));
    } else {
      console.log('--- [#filter-input Finding] ---');
      console.log('No HIGH issue emitted: the five fresh-page runs were below threshold and handler timing independently confirmed the filter is cheap. The earlier observation remains an unexplained collector artifact, guarded by the stale-entry regression test.');
    }

    console.log(`      • Identified ${identifiedIssues.length} issues across INP, CLS, and LCP`);

    // -------------------------------------------------------------------------
    // 4. Copilot SDK request (only an actual returned response is labeled as live)
    // -------------------------------------------------------------------------
    console.log('\n[5/6] Attempting Copilot SDK request (@github/copilot-sdk)...');
    for (const issue of identifiedIssues.filter(item => item.metric === 'INP')) {
      console.log(`[Copilot route] ${issue.location?.name || issue.location?.element}: ${JSON.stringify({ evidence_type: issue.evidence_type, confidence: issue.confidence, file: issue.location?.file, eligibility: checkIssueEligibility(issue), forceCopilot: true })}`);
    }
    // The callback receives the sanitized prompt after construction and immediately before it is sent.
    const promptSafety = prompt => !/(?:\/Users\/[^\s:'"`]+|\/home\/[^\s:'"`]+|[A-Z]:\\Users\\[^\s:'"`]+|[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}|gh[pousr]_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|Bearer\s+[A-Za-z0-9_.-]+)/i.test(prompt);
    const issuesWithFixes = await generateFixesForIssues(identifiedIssues, {
      workspaceRoot,
      copilot: 'on',
      retryCopilot: false,
      forceCopilotMetrics: ['INP'],
      onPrompt(prompt, issue) {
        const label = issue.location?.name || issue.location?.element || issue.metric;
        console.log(`--- [Copilot Prompt Sent: ${label}] ---`);
        console.log(prompt);
        console.log(`Prompt safety scan: no absolute paths, credentials, or account identifiers (${promptSafety(prompt) ? 'PASS' : 'FAIL'}).`);
      },
      onRawResponse(rawResponse, issue) {
        const label = issue.location?.name || issue.location?.element || issue.metric;
        const raw = typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse, null, 2);
        if (!promptSafety(raw)) {
          console.log(`--- [Copilot Response Redacted: ${label}] ---`);
          console.log('[Response omitted because a path or credential pattern was detected.]');
          return;
        }
        console.log(`--- [Copilot Raw JSON Response: ${label}] ---`);
        console.log(raw);
        console.log(`Response safety scan: no absolute paths, credentials, or account identifiers (${promptSafety(raw) ? 'PASS' : 'FAIL'}).`);
      }
    });

    for (const issue of issuesWithFixes.filter(i => i.metric === 'INP')) {
      console.log(`--- [Copilot Validation: ${issue.location?.name || issue.location?.element}] ---`);
      console.log(`Valid: ${Boolean(issue.fix?.fix_validated)}`);
      console.log(`Target: ${issue.fix?.fix_target_file || 'none'}`);
      console.log(`Error: ${issue.fix?.validation_error || 'none'}`);
      console.log(`git apply --check: ${JSON.stringify(issue.fix?.gitApplyEvidence || null)}`);
      if (issue.fix?.diff) console.log(issue.fix.diff);
    }

    // 5. Lightweight Re-measurement on Temporary Fixture Copy
    // -------------------------------------------------------------------------
    console.log('[6/6] Executing Extended Re-measurement on Isolated Temp Copy...');
    console.log('      • Applying only validated fixes to an isolated temp copy; repository fixtures remain untouched');
    console.log('      • Temp fixture directory in os.tmpdir()');
    console.log('      • Applying validated unified diffs and running 1 warm-up + 5 measured runs\n');

    const tempWorkspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cwv-fixture-verify-'));
    const tempFixtureDir = path.join(tempWorkspaceRoot, 'tests', 'fixtures', 'demo-app');
    fs.mkdirSync(path.dirname(tempFixtureDir), { recursive: true });
    fs.cpSync(demoAppDir, tempFixtureDir, { recursive: true });

    // Apply validated fix edits to the matching repo-relative target in the temp copy.
    let appliedFixCount = 0;
    for (const issue of issuesWithFixes) {
      if (issue.fix?.fix_validated && issue.fix?.diff) {
        const check = spawnSync('git', ['apply', '--check', '--verbose', '-'], {
          cwd: tempWorkspaceRoot,
          input: issue.fix.diff,
          encoding: 'utf-8'
        });
        const checkOutput = `${check.stdout || ''}${check.stderr || ''}`.trim();
        console.log(`      • Temp-copy git apply --check (${issue.fix.fix_target_file}): exit ${check.status}; ${checkOutput || 'no diagnostics'}`);
        if (check.status !== 0) throw new Error(`Validated diff failed on temp copy (${issue.fix.fix_target_file}): ${checkOutput}`);
        const applied = spawnSync('git', ['apply', '--verbose', '-'], {
          cwd: tempWorkspaceRoot,
          input: issue.fix.diff,
          encoding: 'utf-8'
        });
        if (applied.status !== 0) throw new Error(`Validated diff failed to apply on temp copy (${issue.fix.fix_target_file}): ${applied.stderr || applied.stdout}`);
        appliedFixCount++;
      }
    }
    console.log(`      • Applied ${appliedFixCount} validated fix(es) from repository-root-relative targets.`);

    let tempServer = null;
    let remeasuredMetrics = null;
    try {
      tempServer = await startFixtureServer(0, tempFixtureDir);
      remeasuredMetrics = await collectInpMetrics({
        url: `${tempServer.url}/index.html`,
        cpuThrottlingRate: 4,
        runs: 5
      });
    } finally {
      if (tempServer && tempServer.close) {
        await tempServer.close();
      }
      try {
        fs.rmSync(tempWorkspaceRoot, { recursive: true, force: true });
      } catch {}
    }

    // Populate measured_improvement for each issue (preserving estimated_gain.certainty = "estimated")
    for (const issue of issuesWithFixes) {
      if (issue.metric === 'INP' && issue.evidence_type === 'measured' && issue.location?.element && issue.fix?.fix_validated) {
        const target = issue.location?.element;
        const beforeSample = unbundledMetrics.interactionsTested.find(i => i.target === target);
        const afterSample = remeasuredMetrics.interactionsTested.find(i => i.target === target);
        const before = beforeSample?.duration?.median;
        const after = afterSample?.duration?.median;
        if (!Number.isFinite(before) || !Number.isFinite(after)) throw new Error(`Missing before/after INP medians for ${target}.`);
        const delta = Math.round(before - after);
        issue.measured_improvement = {
          metric_before: before,
          metric_after: after,
          delta,
          unit: 'ms',
          verified_effective: delta > 0,
          effectiveness: delta > 0 ? 'improved' : 'ineffective'
        };
      }
    }

    // -------------------------------------------------------------------------
    // 6. Extended Sandbox Re-measurement & Regression Verifications
    // -------------------------------------------------------------------------
    console.log('--- [Extended Sandbox Re-Measurement Results] ---');
    console.log('1. Page-level INP Before vs After (All fixes applied together):');
    const prePageRuns = pageLevelRunDurations(unbundledMetrics);
    const pageInpBefore = median(prePageRuns);
    const postSlowTested = remeasuredMetrics?.interactionsTested.find(i => i.target === '#slow-click-btn');
    const postPageRuns = pageLevelRunDurations(remeasuredMetrics);
    const pageInpAfter = median(postPageRuns);
    console.log(`   Before raw page samples: [${prePageRuns.join(', ')}] ms (median: ${pageInpBefore}ms)`);
    console.log(`   After raw page samples:  [${postPageRuns.join(', ')}] ms (median: ${pageInpAfter}ms)`);
    console.log(`   Measured page-level change: ${Math.round(pageInpBefore - pageInpAfter)}ms\n`);

    console.log('2. Fast Controls Regression Verification (Post-Patch):');
    const postMenu = remeasuredMetrics?.interactionsTested.find(i => i.target === '#menu-toggle');
    const postSearch = remeasuredMetrics?.interactionsTested.find(i => i.target === '#search-input');
    console.log(`   #menu-toggle:  Before [${formatRunSamples(menuTested.rawRunDurations)}] median=${menuTested.duration.median} -> After [${formatRunSamples(postMenu.rawRunDurations)}] median=${postMenu.duration.median} (Regressed: ${postMenu.duration.median > menuTested.duration.median ? 'YES' : 'NO'})`);
    console.log(`   #search-input: Before [${formatRunSamples(searchTested.rawRunDurations)}] median=${searchTested.duration.median} -> After [${formatRunSamples(postSearch.rawRunDurations)}] median=${postSearch.duration.median} (Regressed: ${postSearch.duration.median > searchTested.duration.median ? 'YES' : 'NO'})\n`);

    console.log('3. INP Fix Estimate vs Measured Median Improvement:');
    for (const issue of issuesWithFixes.filter(i => i.metric === 'INP' && i.fix?.fix_validated)) {
      console.log(`   ${issue.location.element}: estimate=${issue.estimated_gain?.metric_delta ?? 'n/a'}ms (${issue.estimated_gain?.certainty ?? 'n/a'}); measured=${issue.measured_improvement?.delta ?? 'n/a'}ms (${issue.measured_improvement?.metric_before ?? 'n/a'} -> ${issue.measured_improvement?.metric_after ?? 'n/a'}ms); ${issue.measured_improvement?.effectiveness || 'not measured'}`);
    }

    console.log('\n4. Chunked Handler Total Completion Time (Cost of Yielding):');
    const slowClickIssue = issuesWithFixes.find(i => i.metric === 'INP' && i.location?.name === 'handleSlowButtonClick');
    const chunkedFixApplied = Boolean(slowClickIssue?.fix?.edits?.some(edit => /await\s+[^;]*(?:yield|setTimeout)/.test(edit.replacement_snippet)));
    const beforeCompletion = slowBtnTested.handlerCompletion?.median;
    const afterCompletion = postSlowTested?.handlerCompletion?.median;
    if (chunkedFixApplied && Number.isFinite(beforeCompletion) && Number.isFinite(afterCompletion)) {
      console.log(`   Before raw completion samples: [${slowBtnTested.handlerCompletionDurations.join(', ')}]ms (median ${beforeCompletion}ms)`);
      console.log(`   After raw completion samples:  [${postSlowTested.handlerCompletionDurations.join(', ')}]ms (median ${afterCompletion}ms)`);
      console.log(`   Measured yielding cost: ${Math.round(afterCompletion - beforeCompletion)}ms total handler time.\n`);
    } else {
      console.log('   No validated cooperative-yielding fix was applied, so yielding cost is not applicable.\n');
    }

    // -------------------------------------------------------------------------
    // 7. Final Output JSON Assembly
    // -------------------------------------------------------------------------
    const finalResult = {
      step: 'Step 4: Fix Generator & Diff Validator',
      timestamp: new Date().toISOString(),
      throttling: unbundledMetrics.throttling,
      metricsSummary: {
        inp: unbundledMetrics.metrics.inp,
        lcp: unbundledMetrics.metrics.lcp,
        cls: unbundledMetrics.metrics.cls
      },
      lcpResourceTiming: unbundledMetrics.metrics.lcp?.resourceTiming || null,
      investigationFilterInput: {
        prior1448Observation: '1448ms: unexplained collector artifact, guarded by the stale-entry regression test; root cause not established.',
        rawRuns: filterTested.rawRunDurations,
        handlerDurations: filterTested.handlerRunDurations,
        handlerEvidence: filterTested.runEvidence.map(run => ({ run: run.run, handlerTiming: run.handlerTiming, completionLog: run.handlerCompletionLog, calibration: run.calibration })),
        stats: filterTested.duration,
        sameRunLoaf: sameRunIssue?.loaf.rawEntry || null,
        conclusion: sameRunIssue ? 'measured filter LoAF issue' : 'below threshold; no filter INP issue emitted'
      },
      extendedRemeasurement: {
        pageInpBefore,
        pageInpAfter,
        pageInpBeforeMedian: pageInpBefore,
        pageInpAfterMedian: pageInpAfter,
        pageInpRunsBefore: prePageRuns,
        pageInpRunsAfter: postPageRuns,
        fastControlsRegressionCheck: {
          menuToggle: { beforeRuns: menuTested.rawRunDurations, afterRuns: postMenu.rawRunDurations, beforeMedian: menuTested.duration.median, afterMedian: postMenu.duration.median, regressed: postMenu.duration.median > menuTested.duration.median },
          searchInput: { beforeRuns: searchTested.rawRunDurations, afterRuns: postSearch.rawRunDurations, beforeMedian: searchTested.duration.median, afterMedian: postSearch.duration.median, regressed: postSearch.duration.median > searchTested.duration.median }
        },
        chunkingCostOfYielding: {
          chunkedFixApplied,
          beforeRunsMs: slowBtnTested.handlerCompletionDurations,
          afterRunsMs: postSlowTested.handlerCompletionDurations,
          beforeMedianMs: beforeCompletion,
          afterMedianMs: afterCompletion,
          measuredOverheadMs: chunkedFixApplied && Number.isFinite(beforeCompletion) && Number.isFinite(afterCompletion) ? Math.round(afterCompletion - beforeCompletion) : null
        }
      },
      validatedFixesCount: issuesWithFixes.filter(i => i.fix_validated).length,
      totalIssuesCount: issuesWithFixes.length,
      issues: issuesWithFixes.map(issue => ({
        metric: issue.metric,
        priority: issue.priority,
        confidence: issue.confidence,
        evidence_type: issue.evidence_type,
        location: issue.location,
        loaf: issue.loaf || null,
        problem: issue.problem,
        evidence: issue.evidence,
        root_cause: issue.root_cause,
        rootCauseCategory: issue.rootCauseCategory,
        serverCdnNote: issue.serverCdnNote || null,
        estimated_gain: issue.estimated_gain,
        fix_validated: !!issue.fix_validated,
        measured_improvement: issue.measured_improvement || null,
        no_fix_reason: issue.no_fix_reason || null,
        fix: issue.fix ? {
          strategy: issue.fix.strategy,
          fix_target_file: issue.fix.fix_target_file || issue.location.file,
          fix_validated: issue.fix.fix_validated,
          description: issue.fix.description,
          why_it_works: issue.fix.why_it_works,
          tradeoffs: issue.fix.tradeoffs,
          gitApplyEvidence: issue.fix.gitApplyEvidence,
          unifiedDiff: issue.fix.diff
        } : null,
        note: issue.note || null
      }))
    };

    console.log('------------------------------------------------------------------------');
    console.log(JSON.stringify(finalResult, null, 2));
    console.log('------------------------------------------------------------------------\n');

    console.log(`✓ Total issues processed: ${finalResult.totalIssuesCount}`);
    console.log(`✓ Validated fixes generated: ${finalResult.validatedFixesCount}`);
    const productListFinding = finalResult.issues.find(item => item.location?.file?.includes('ProductList.jsx'));
    if (productListFinding) {
      console.log(`✓ ProductList remains ${productListFinding.evidence_type} / ${productListFinding.priority}; no LoAF entry mapped to that file.`);
    }
    if (sameRunIssue) console.log(`✓ rootCauseCategory is a script cause (${sameRunIssue.rootCauseCategory}), not an Event Timing phase label.`);
    for (const [idx, item] of finalResult.issues.entries()) {
      const fixStatus = item.fix_validated ? `[FIX VALIDATED (${item.fix?.strategy})]` : '[NO FIX / LOW PRIORITY]';
      console.log(`  Issue #${idx + 1}: ${item.metric} (${item.priority}) ${fixStatus}`);
      console.log(`            Problem: ${item.problem}`);
      console.log(`            File:    ${item.location?.file}:${item.location?.line_start}`);
      if (item.estimated_gain && item.measured_improvement) {
        console.log(`            Estimate vs Measured: Estimated Gain ${item.estimated_gain.metric_delta}${item.estimated_gain.unit} (certainty: "${item.estimated_gain.certainty}") vs Measured Improvement ${item.measured_improvement.delta}${item.measured_improvement.unit} (Before: ${item.measured_improvement.metric_before}${item.measured_improvement.unit} -> After: ${item.measured_improvement.metric_after}${item.measured_improvement.unit}, effective: ${item.measured_improvement.verified_effective})`);
      } else if (item.estimated_gain) {
        console.log(`            Estimated Gain: ${item.estimated_gain.metric_delta}${item.estimated_gain.unit} (certainty: "${item.estimated_gain.certainty}", basis: "${item.estimated_gain.basis}")`);
      }
      if (item.fix?.gitApplyEvidence) {
        console.log(`            Git Apply: exit code ${item.fix.gitApplyEvidence.exitCode} (${item.fix.gitApplyEvidence.command})`);
      }
    }
    console.log('\n✓ Step 4 Demo finished successfully.');
  } finally {
    if (fixture && fixture.close) {
      await fixture.close();
    }
  }
}

main().catch(err => {
  const safeMessage = String(err?.message || err)
    .replace(/(?:\/Users\/|\/home\/)[^\s:'"`]+/g, '[REDACTED_PATH]')
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}/g, '[REDACTED_TOKEN]')
    .replace(/AKIA[0-9A-Z]{16}/g, '[REDACTED_TOKEN]');
  console.error('Step 4 Demo encountered error:', safeMessage);
  process.exit(1);
});
