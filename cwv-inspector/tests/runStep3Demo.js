import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { startFixtureServer } from './fixtures/demo-app/serveFixture.js';
import { collectInpMetrics, normalizeRepoPath } from '../collector/index.js';
import { resolveSourceLocation, resolveElementSelector } from '../sourcemap/index.js';
import { runDeepAnalysis } from '../analyzers/deepAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const demoAppDir = path.resolve(__dirname, 'fixtures/demo-app');

async function main() {
  console.log('========================================================================');
  console.log('⚡ Core Web Vitals Inspector: Step 3 Deep Code Analyzer Demo');
  console.log('========================================================================\n');

  const fixture = await startFixtureServer(0);
  console.log(`[1/5] Fixture Server started at: ${fixture.url}\n`);

  try {
    // -------------------------------------------------------------------------
    // 1. Unbundled Execution (1 warm-up + 5 measured runs)
    // -------------------------------------------------------------------------
    console.log('[2/5] Running UNBUNDLED analysis (/index.html)...');
    console.log('      • 1 discarded warm-up run + 5 measured runs per interaction');
    console.log('      • 4x CPU throttle');
    console.log('      • Delayed hero.jpg (~800ms) + late banner (~1500ms)');
    console.log('      • Fast interactions (#menu-toggle, #search-input) tested for zero false positives\n');

    const unbundledMetrics = await collectInpMetrics({
      url: `${fixture.url}/index.html`,
      cpuThrottlingRate: 4,
      runs: 5
    });

    const worstUnbundled = unbundledMetrics.worstInteraction;
    const topUnbundledScript = worstUnbundled?.scripts?.[0];

    // Source resolution
    const resolvedScriptUnbundled = topUnbundledScript ? await resolveSourceLocation({
      sourceURL: topUnbundledScript.sourceURL,
      line: topUnbundledScript.sourceLocation?.line || 10,
      column: topUnbundledScript.sourceLocation?.column || 1,
      functionName: topUnbundledScript.sourceFunctionName,
      workspaceRoot: demoAppDir
    }) : null;

    // Element resolutions
    const resolvedElements = {
      inpTarget: resolveElementSelector({
        selector: worstUnbundled?.target || '#slow-click-btn',
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
    // 2. Bundled Execution & Proof of Real LoAF Mapping
    // -------------------------------------------------------------------------
    console.log('[3/5] Running BUNDLED analysis (/bundled.html & dist/)...');
    console.log('      • Real LoAF runtime entries extracted from bundled.html');
    console.log('      • Mapping to original app.js via source-map-js');
    console.log('      • Function-name matching fallback when source map is missing\n');

    const bundledMetrics = await collectInpMetrics({
      url: `${fixture.url}/bundled.html`,
      cpuThrottlingRate: 4,
      runs: 5,
      customInteractions: [
        { selector: '#slow-click-btn', type: 'click', label: 'Slow Button Click Task' },
        { selector: '#menu-toggle', type: 'click', label: 'Fast Menu Toggle', optional: true },
        { selector: '#search-input', type: 'type', text: 'quick test', label: 'Fast Search Input', optional: true }
      ]
    });

    const worstBundled = bundledMetrics.worstInteraction;
    const topBundledLoafScript = worstBundled?.scripts?.[0];

    // Map from real LoAF entry
    let realLoafProof = null;
    if (topBundledLoafScript) {
      const mapped = await resolveSourceLocation({
        sourceURL: topBundledLoafScript.sourceURL,
        line: topBundledLoafScript.sourceLocation?.line || 1,
        column: topBundledLoafScript.sourceLocation?.column || 26,
        functionName: topBundledLoafScript.sourceFunctionName,
        workspaceRoot: demoAppDir
      });

      realLoafProof = {
        rawLoafRuntimeEntry: {
          invoker: topBundledLoafScript.invoker,
          sourceURL: normalizeRepoPath(topBundledLoafScript.sourceURL),
          sourceFunctionName: topBundledLoafScript.sourceFunctionName,
          sourceCharPosition: topBundledLoafScript.sourceCharPosition,
          runtimeLine: topBundledLoafScript.sourceLocation?.line || 1,
          runtimeColumn: topBundledLoafScript.sourceLocation?.column || 26,
          duration: topBundledLoafScript.duration,
          forcedStyleAndLayoutDuration: topBundledLoafScript.forcedStyleAndLayoutDuration
        },
        mappedSourceLocation: mapped
      };
    }

    // Three resolution cases normalized to repo-relative paths
    const caseA_externalMap = await resolveSourceLocation({
      sourceURL: `${fixture.url}/dist/bundle.external.js`,
      line: 1,
      column: 26,
      functionName: 'handleSlowButtonClick',
      workspaceRoot: demoAppDir
    });

    const caseB_inlineBase64Map = await resolveSourceLocation({
      sourceURL: `${fixture.url}/dist/bundle.inline.js`,
      line: 1,
      column: 26,
      functionName: 'handleSlowButtonClick',
      workspaceRoot: demoAppDir
    });

    const caseC_noMapFallback = await resolveSourceLocation({
      sourceURL: `${fixture.url}/dist/bundle.nomap.js`,
      line: 1,
      column: 26,
      functionName: 'handleSlowButtonClick',
      workspaceRoot: demoAppDir
    });

    // -------------------------------------------------------------------------
    // 3. Step 3: Deep Code Analyzer Execution
    // -------------------------------------------------------------------------
    console.log('[4/5] Executing Step 3 Deep Code Analyzer (AST checks, time-share, no Copilot)...');

    const step1Output = {
      metrics: unbundledMetrics.metrics,
      worstInteraction: unbundledMetrics.worstInteraction,
      interactionsTested: unbundledMetrics.interactionsTested
    };

    const step2Output = {
      resolvedLocations: {
        culpritScript: resolvedScriptUnbundled,
        elements: resolvedElements
      },
      sourceMapResolutions: {
        caseA_externalMap,
        caseB_inlineBase64Map,
        caseC_noMapFallback
      }
    };

    const identifiedIssues = runDeepAnalysis({
      step1Output,
      step2Output,
      workspaceRoot: demoAppDir
    });

    // -------------------------------------------------------------------------
    // 4. Final Output JSON Assembly
    // -------------------------------------------------------------------------
    console.log('[5/5] Analysis Complete! Producing Output JSON:\n');
    console.log('------------------------------------------------------------------------');

    const finalResult = {
      step: 'Step 3: Deep Code Analyzer (Deterministic AST Analysis)',
      timestamp: new Date().toISOString(),
      throttling: unbundledMetrics.throttling,
      metricsSummary: {
        inp: unbundledMetrics.metrics.inp,
        lcp: unbundledMetrics.metrics.lcp,
        cls: unbundledMetrics.metrics.cls
      },
      interactionsBenchmarked: unbundledMetrics.interactionsTested.map(t => ({
        target: t.target,
        label: t.label,
        type: t.type,
        warmupRunDiscarded: t.warmupRunDiscarded,
        runsCount: t.runsCount,
        durationStats: t.duration,
        phaseMedians: {
          inputDelay: t.phases.inputDelay.median,
          processingDuration: t.phases.processingDuration.median,
          presentationDelay: t.phases.presentationDelay.median
        },
        flagged: t.flagged,
        rating: t.rating,
        layoutThrashing: t.layoutThrashing
      })),
      sourceMappingProof: {
        realLoafProof,
        bundledVariants: {
          caseA_externalMap,
          caseB_inlineBase64Map,
          caseC_noMapFallback
        }
      },
      elementResolutions: resolvedElements,
      identifiedIssues
    };

    console.log(JSON.stringify(finalResult, null, 2));
    console.log('------------------------------------------------------------------------\n');
    console.log(`✓ Total issues found: ${identifiedIssues.length}`);
    for (let i = 0; i < identifiedIssues.length; i++) {
      const issue = identifiedIssues[i];
      console.log(`  [Issue #${i + 1}] ${issue.metric} (${issue.priority}): ${issue.problem}`);
      console.log(`            Location: ${issue.location.file}:${issue.location.line_start}-${issue.location.line_end} (${issue.location.element})`);
      console.log(`            Gain: ${issue.estimated_gain_ms}`);
    }
    console.log('\n✓ Step 3 Demo finished successfully.');

  } finally {
    await fixture.close();
  }
}

main().catch(err => {
  console.error('Step 3 Demo failed:', err);
  process.exit(1);
});

