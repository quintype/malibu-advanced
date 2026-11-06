/**
 * Calculates the expected Core Web Vitals metric improvement if an issue is resolved.
 * Covers HIGH, MEDIUM, and LOW severity issues across LCP, CLS, INP, and accessibility.
 * 
 * @param {object} issue - An issue object containing cwv, severity, score, savings, etc.
 * @returns {{ badge: string, metricGain: string, explanation: string, percentGain: string }}
 */
export function calculateImprovement(issue = {}) {
  if (!issue || typeof issue !== 'object') {
    return {
      badge: 'Improvement: Low',
      metricGain: 'Minor metric optimization',
      explanation: 'Resolving this finding will contribute to overall code quality and stability.',
      percentGain: '5-10%'
    };
  }

  // 1. If explicit estimatedImprovement is already attached
  if (issue.estimatedImprovement && typeof issue.estimatedImprovement === 'object') {
    return issue.estimatedImprovement;
  }

  // 2. If Lighthouse provides explicit wasted milliseconds or bytes
  if (Number.isFinite(issue.overallSavingsMs) && issue.overallSavingsMs > 0) {
    const ms = Math.round(issue.overallSavingsMs);
    const metric = (issue.cwv || 'LCP').toUpperCase();
    return {
      badge: `⚡ -${ms}ms ${metric}`,
      metricGain: `~${ms}ms ${metric} reduction`,
      explanation: `Lighthouse estimates resolving this finding directly recovers approximately ${ms}ms on the critical rendering path.`,
      percentGain: ms > 500 ? '25-40%' : '15-25%'
    };
  }

  if (Number.isFinite(issue.overallSavingsBytes) && issue.overallSavingsBytes > 0) {
    const kb = Math.round(issue.overallSavingsBytes / 1024);
    const estTimeMs = Math.round((kb * 8) / (1.6 * 0.9)); // ~Slow 4G throughput estimate
    return {
      badge: `⚡ -${kb} KiB (~${estTimeMs}ms)`,
      metricGain: `~${kb} KiB payload reduction (saves ~${estTimeMs}ms on mobile)`,
      explanation: `Trimming ${kb} KiB of unneeded transfer bytes frees network bandwidth for high-priority above-the-fold assets.`,
      percentGain: kb > 200 ? '20-35%' : '10-20%'
    };
  }

  // 3. If runtime CLS layout shift score is recorded
  if (String(issue.cwv).toLowerCase() === 'cls' && Number.isFinite(issue.score) && issue.score > 0) {
    const shiftScore = Number(issue.score);
    return {
      badge: `⚡ -${shiftScore.toFixed(3)} CLS`,
      metricGain: `-${shiftScore.toFixed(3)} CLS score reduction`,
      explanation: `Eliminating this layout shift directly removes ${shiftScore.toFixed(3)} from the cumulative session window shift total.`,
      percentGain: shiftScore >= 0.1 ? '30-60%' : '15-30%'
    };
  }

  const cwv = String(issue.cwv || '').toLowerCase();
  const severity = String(issue.severity || 'medium').toLowerCase();
  const msg = String(issue.message || '').toLowerCase();

  // 4. LCP (Largest Contentful Paint)
  if (cwv === 'lcp') {
    if (severity === 'high') {
      if (msg.includes('lazy')) {
        return {
          badge: '⚡ ~400ms – 1.2s LCP',
          metricGain: '~400ms – 1,200ms LCP reduction',
          explanation: 'Removing lazy loading on the hero image enables immediate discovery by the browser preload scanner during HTML streaming, avoiding JavaScript execution latency.',
          percentGain: '25-50%'
        };
      }
      if (msg.includes('import') || msg.includes('bundle')) {
        return {
          badge: '⚡ ~300ms – 800ms LCP',
          metricGain: '~300ms – 800ms LCP reduction',
          explanation: 'Tree-shaking heavy library imports reduces initial JavaScript bundle parse and evaluation time, unblocking the main thread.',
          percentGain: '20-40%'
        };
      }
      return {
        badge: '⚡ ~400ms – 1.0s LCP',
        metricGain: '~400ms – 1,000ms LCP reduction',
        explanation: 'Fixing this high-priority asset bottleneck removes a direct blocker from the Largest Contentful Paint timeline.',
        percentGain: '25-45%'
      };
    }
    if (severity === 'medium') {
      if (msg.includes('font')) {
        return {
          badge: '⚡ ~150ms – 400ms LCP',
          metricGain: '~150ms – 400ms LCP reduction',
          explanation: 'Adding font-display: swap and preloading fonts eliminates invisible text (FOIT) and displays fallback glyphs immediately.',
          percentGain: '15-30%'
        };
      }
      if (msg.includes('legacy') || msg.includes('format')) {
        return {
          badge: '⚡ ~200ms – 500ms LCP',
          metricGain: '~200ms – 500ms LCP reduction',
          explanation: 'Converting to WebP/AVIF cuts image weight by 30-70%, accelerating download completion on mobile connections.',
          percentGain: '15-35%'
        };
      }
      return {
        badge: '⚡ ~150ms – 400ms LCP',
        metricGain: '~150ms – 400ms LCP reduction',
        explanation: 'Eliminates resource discovery delays and reduces initial render-blocking overhead.',
        percentGain: '15-30%'
      };
    }
    // Low LCP
    return {
      badge: '⚡ ~50ms – 150ms LCP',
      metricGain: '~50ms – 150ms LCP reduction',
      explanation: 'Lazy-loading below-the-fold images prevents network socket contention during initial document delivery.',
      percentGain: '5-15%'
    };
  }

  // 5. CLS (Cumulative Layout Shift)
  if (cwv === 'cls') {
    if (severity === 'high') {
      return {
        badge: '⚡ -0.08 – -0.25 CLS',
        metricGain: '-0.08 to -0.25+ CLS score reduction',
        explanation: 'Declaring explicit width and height attributes reserves layout geometry before download, preventing content below from shifting violently.',
        percentGain: '40-80%'
      };
    }
    if (severity === 'medium') {
      return {
        badge: '⚡ -0.03 – -0.08 CLS',
        metricGain: '-0.03 to -0.08 CLS score reduction',
        explanation: 'Rendering placeholder skeletons or switching from layout transitions to GPU transforms absorbs dynamic geometry jumps.',
        percentGain: '20-40%'
      };
    }
    // Low CLS
    return {
      badge: '⚡ -0.01 – -0.03 CLS',
      metricGain: '-0.01 to -0.03 CLS score reduction',
      explanation: 'Eliminates minor sub-pixel shifts and element positioning variance.',
      percentGain: '10-20%'
    };
  }

  // 6. INP (Interaction to Next Paint) / TBT
  if (cwv === 'inp') {
    if (severity === 'high') {
      return {
        badge: '⚡ -150ms – 500ms+ INP',
        metricGain: '~150ms – 500ms+ INP / TBT reduction',
        explanation: 'Eliminating render-blocking scripts or forced synchronous layout thrashing frees the main thread to paint interaction responses on the next frame (16ms).',
        percentGain: '35-70%'
      };
    }
    if (severity === 'medium') {
      return {
        badge: '⚡ -50ms – 150ms INP',
        metricGain: '~50ms – 150ms INP reduction',
        explanation: 'Wrapping state mutations in startTransition or offloading sync operations prevents main-thread stalls during user taps/clicks.',
        percentGain: '20-40%'
      };
    }
    // Low INP
    return {
      badge: '⚡ -20ms – 60ms INP',
      metricGain: '~20ms – 60ms INP reduction',
      explanation: 'Memoizing list components skips redundant virtual DOM diffing during parent component updates.',
      percentGain: '10-20%'
    };
  }

  // 7. General fallback (e.g. Accessibility or Best Practices)
  if (severity === 'high') {
    return {
      badge: '⚡ High Impact',
      metricGain: 'Significant accessibility & SEO improvement',
      explanation: 'Resolving this critical issue eliminates major audit warnings and enhances compliance.',
      percentGain: '25-40%'
    };
  }
  if (severity === 'medium') {
    return {
      badge: '⚡ Medium Impact',
      metricGain: 'Moderate performance & UX improvement',
      explanation: 'Reduces operational overhead and improves user experience metrics.',
      percentGain: '15-25%'
    };
  }
  return {
    badge: '⚡ Low Impact',
    metricGain: 'Minor metric optimization',
    explanation: 'General best-practice improvement.',
    percentGain: '5-15%'
  };
}

