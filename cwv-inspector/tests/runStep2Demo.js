import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { startFixtureServer } from './fixtures/demo-app/serveFixture.js';
import { collectInpMetrics } from '../collector/index.js';
import { resolveSourceLocation, resolveElementSelector } from '../sourcemap/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');
const demoAppDir = path.resolve(__dirname, 'fixtures/demo-app');

async function main() {
  console.log('========================================================================');
  console.log('⚡ Core Web Vitals Inspector: Step 2 Demo (Source Mapper & Element Resolver)');
  console.log('========================================================================\n');

  const fixture = await startFixtureServer(0);
  console.log(`[1/4] Fixture Server started at: ${fixture.url}\n`);

  try {
    // -------------------------------------------------------------------------
    // Run 1: Unbundled Fixture
    // -------------------------------------------------------------------------
    console.log('[2/4] Testing UNBUNDLED fixture (/index.html)...');
    console.log('      • Running interactions 3 times each');
    console.log('      • Measuring INP & each phase (min / median / max)');
    console.log('      • Testing fast interactions (#menu-toggle, #search-input) for no false positives');
    console.log('      • Measuring real forced reflow (forcedStyleAndLayoutDuration > 0)');
    console.log('      • Capturing LCP element & CLS layout-shift source\n');

    const unbundledMetrics = await collectInpMetrics({
      url: `${fixture.url}/index.html`,
      cpuThrottlingRate: 4,
      runs: 3
    });

    // Resolve source location for top script
    const worstUnbundled = unbundledMetrics.worstInteraction;
    let resolvedScriptUnbundled = null;
    if (worstUnbundled && worstUnbundled.scripts.length > 0) {
      const topScript = worstUnbundled.scripts[0];
      resolvedScriptUnbundled = await resolveSourceLocation({
        sourceURL: topScript.sourceURL,
        line: topScript.sourceLocation?.line || 1,
        column: topScript.sourceLocation?.column || 1,
        functionName: topScript.sourceFunctionName,
        workspaceRoot: demoAppDir
      });
    }

    // Resolve DOM elements
    const resolvedElements = {
      inpTarget: resolveElementSelector({ selector: worstUnbundled?.target || '#slow-click-btn', workspaceRoot: demoAppDir }),
      lcpTarget: resolveElementSelector({ selector: unbundledMetrics.metrics.lcp?.element || '#hero-img', workspaceRoot: demoAppDir }),
      clsTarget: resolveElementSelector({ selector: '.injected-banner', workspaceRoot: demoAppDir })
    };

    const unbundledReport = {
      mode: 'unbundled',
      url: `${fixture.url}/index.html`,
      throttling: unbundledMetrics.throttling,
      metrics: {
        inp: {
          value: unbundledMetrics.metrics.inp.value,
          rating: unbundledMetrics.metrics.inp.rating,
          target: unbundledMetrics.metrics.inp.target,
          stats: unbundledMetrics.metrics.inp.stats,
          phases: unbundledMetrics.metrics.inp.phases,
          largestPhase: unbundledMetrics.metrics.inp.largestPhase,
          rootCauseCategory: unbundledMetrics.metrics.inp.rootCauseCategory,
          ruleNotice: unbundledMetrics.metrics.inp.ruleNotice
        },
        lcp: unbundledMetrics.metrics.lcp,
        cls: unbundledMetrics.metrics.cls
      },
      resolvedLocations: {
        culpritScript: resolvedScriptUnbundled,
        elements: resolvedElements
      },
      allInteractionsTested: unbundledMetrics.interactionsTested.map(t => ({
        target: t.target,
        label: t.label,
        type: t.type,
        runsCount: t.runsCount,
        duration: t.duration,
        phases: t.phases,
        flagged: t.flagged,
        rating: t.rating,
        layoutThrashing: t.layoutThrashing
      }))
    };

    // -------------------------------------------------------------------------
    // Run 2: Bundled Fixtures (External map, Inline base64 map, No map fallback)
    // -------------------------------------------------------------------------
    console.log('[3/4] Testing BUNDLED fixtures (/bundled.html & dist/)...');
    console.log('      • External .map resolution');
    console.log('      • Inline base64 .map resolution');
    console.log('      • No map fallback (AST function-name matching with confidence "low")\n');

    const bundledMetrics = await collectInpMetrics({
      url: `${fixture.url}/bundled.html`,
      cpuThrottlingRate: 4,
      runs: 3,
      customInteractions: [
        { selector: '#slow-click-btn', type: 'click', label: 'Slow Button Click Task' },
        { selector: '#menu-toggle', type: 'click', label: 'Fast Menu Toggle', optional: true },
        { selector: '#search-input', type: 'type', text: 'quick test', label: 'Fast Search Input', optional: true }
      ]
    });

    const worstBundled = bundledMetrics.worstInteraction;
    const topBundledScript = worstBundled?.scripts[0];

    // Case A: External .map
    const resolvedExternalMap = await resolveSourceLocation({
      sourceURL: `${fixture.url}/dist/bundle.external.js`,
      line: 1,
      column: 18,
      functionName: 'handleSlowButtonClick',
      workspaceRoot: demoAppDir
    });

    // Case B: Inline Base64 Map
    const resolvedInlineMap = await resolveSourceLocation({
      sourceURL: `${fixture.url}/dist/bundle.inline.js`,
      line: 1,
      column: 18,
      functionName: 'handleSlowButtonClick',
      workspaceRoot: demoAppDir
    });

    // Case C: No Map Fallback (function-name matching against workspace repo)
    const resolvedNoMapFallback = await resolveSourceLocation({
      sourceURL: `${fixture.url}/dist/bundle.nomap.js`,
      line: 1,
      column: 18,
      functionName: 'handleSlowButtonClick',
      workspaceRoot: demoAppDir
    });

    const bundledReport = {
      mode: 'bundled',
      url: `${fixture.url}/bundled.html`,
      sourceMapResolutions: {
        caseA_externalMap: resolvedExternalMap,
        caseB_inlineBase64Map: resolvedInlineMap,
        caseC_noMapFallback: resolvedNoMapFallback
      },
      resolvedElement: resolveElementSelector({
        selector: worstBundled?.target || '#slow-click-btn',
        workspaceRoot: demoAppDir
      }),
      inpSummary: {
        value: bundledMetrics.metrics.inp.value,
        rating: bundledMetrics.metrics.inp.rating,
        stats: bundledMetrics.metrics.inp.stats,
        phases: bundledMetrics.metrics.inp.phases,
        layoutThrashing: worstBundled?.layoutThrashing
      }
    };

    // -------------------------------------------------------------------------
    // Final Step 2 Report JSON
    // -------------------------------------------------------------------------
    console.log('[4/4] Step 2 Analysis Complete! Full Output JSON:\n');
    console.log('------------------------------------------------------------------------');
    const fullOutput = {
      step: 'Step 2: Source Mapper & Element Resolver',
      timestamp: new Date().toISOString(),
      unbundledFixture: unbundledReport,
      bundledFixture: bundledReport
    };
    console.log(JSON.stringify(fullOutput, null, 2));
    console.log('------------------------------------------------------------------------\n');

    console.log('✓ Step 2 Demo finished successfully.');

  } finally {
    await fixture.close();
  }
}

main().catch(err => {
  console.error('Step 2 Demo failed:', err);
  process.exit(1);
});
