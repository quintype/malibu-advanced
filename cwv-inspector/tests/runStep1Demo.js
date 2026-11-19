import { startFixtureServer } from './fixtures/demo-app/serveFixture.js';
import { collectInpMetrics } from '../collector/index.js';

async function main() {
  console.log('===============================================================');
  console.log('⚡ Core Web Vitals Inspector: Step 1 INP & LoAF Demo Runner');
  console.log('===============================================================\n');

  console.log('[1/4] Starting local fixture demo web app...');
  const fixture = await startFixtureServer(0);
  console.log(`      ✓ Fixture server running at: ${fixture.url}\n`);

  try {
    console.log('[2/4] Executing INP Collector with:');
    console.log('      - 4x CPU Throttling');
    console.log('      - Chrome LoAF (Long Animation Frame) instrumentation');
    console.log('      - Event Timing observer (threshold 16ms, buffered)');
    console.log('      - web-vitals attribution build injection');
    console.log('      - LoAF sourceCharPosition (char offset) -> line:column translation\n');

    const result = await collectInpMetrics({
      url: fixture.url,
      cpuThrottlingRate: 4
    });

    console.log('[3/4] Collection Complete! Output JSON Result:\n');
    console.log('---------------------------------------------------------------');
    console.log(JSON.stringify(result, null, 2));
    console.log('---------------------------------------------------------------\n');

    console.log('[4/4] Summary Analysis:');
    console.log(`      • Measured INP: ${result.metrics.inp.value}ms (${result.metrics.inp.rating.toUpperCase()})`);
    console.log(`      • Culprit Target: ${result.worstInteraction?.target}`);
    console.log(`      • Dominant Phase: ${result.worstInteraction?.largestPhase} (${result.worstInteraction?.phases?.[result.worstInteraction?.largestPhase]?.median ?? 'unavailable'}ms)`);
    if (result.worstInteraction?.scripts?.length > 0) {
      const topScript = result.worstInteraction.scripts[0];
      console.log(`      • Culprit Function: ${topScript.sourceFunctionName}()`);
      console.log(`      • Resolved Location: ${topScript.sourceURL}:${topScript.sourceLocation?.line}:${topScript.sourceLocation?.column} (offset: ${topScript.sourceCharPosition})`);
      console.log(`      • Script Duration: ${topScript.duration}ms`);
      if (topScript.codeSnippet) {
        console.log('\n      • Code at Culprit Line:');
        console.log(topScript.codeSnippet.split('\n').map(l => '        ' + l).join('\n'));
      }
    }
    console.log('\n✓ Step 1 Demo finished successfully.');
  } finally {
    await fixture.close();
  }
}

main().catch(err => {
  console.error('Step 1 Demo failed:', err);
  process.exit(1);
});

