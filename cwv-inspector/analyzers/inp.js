/**
 * Analyzes code elements affecting Interaction to Next Paint (INP).
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @param {Array<object>} reactAsts Pre-parsed React AST objects.
 * @returns {Array<object>} INP recommendations
 */
export function analyzeInp(files, reactAsts) {
  const recommendations = [];

  for (const { file, ast } of reactAsts) {
    if (!ast.astSuccess) continue;

    const content = file.content;

    // Check for heavy event handlers without deferring
    const hasSyncClickHandlers = content.includes('onClick={') || content.includes('onChange={') || content.includes('onInput={');
    const hasTransition = content.includes('startTransition') || content.includes('useTransition');

    if (hasSyncClickHandlers && !hasTransition && content.includes('fetch(')) {
      recommendations.push({
        type: 'code',
        file: file.relativePath,
        line: 1,
        cwv: 'inp',
        severity: 'medium',
        message: 'Synchronous interactive event handlers performing fetch operations without startTransition/pending states.',
        impact: 'Making network requests directly in event handlers without transition updates blocks the main thread and user interaction feedback.',
        suggestion: 'Wrap state changes triggered by asynchronous fetch calls in startTransition() or show a loading state instantly.'
      });
    }

    // Check for heavy calculations in useEffect
    if (ast.useEffects.length > 0) {
      const hasHeavyOperations = content.includes('.map(') && content.includes('filter(') && (content.includes('JSON.stringify') || content.includes('localStorage.set'));
      if (hasHeavyOperations) {
        recommendations.push({
          type: 'code',
          file: file.relativePath,
          line: ast.useEffects[0].loc?.start?.line || 1,
          cwv: 'inp',
          severity: 'medium',
          message: 'Heavy calculations/localStorage access inside useEffect.',
          impact: 'Running complex filtering, mapping, or synchronous localStorage writes inside useEffect delays paint and response to user input.',
          suggestion: 'Offload heavy computations to a Web Worker, debounce updates, or defer tasks using requestIdleCallback().'
        });
      }
    }
  }

  // Scan JS/HTML for non-passive event listeners
  files.forEach(f => {
    if (f.ext === '.js' || f.ext === '.ts' || f.ext === '.jsx' || f.ext === '.tsx') {
      const addEventListenerMatches = f.content.match(/addEventListener\(\s*['"](touchstart|touchmove|wheel|mousewheel)['"]\s*,/g) || [];
      if (addEventListenerMatches.length > 0 && !f.content.includes('{ passive: true }')) {
        recommendations.push({
          type: 'code',
          file: f.relativePath,
          line: 1,
          cwv: 'inp',
          severity: 'low',
          message: `Non-passive wheel or touch event listeners detected.`,
          impact: 'Forces the browser to wait for the listener to finish before scrolling, causing scrolling lag and delaying visual feedback.',
          suggestion: 'Pass { passive: true } as the third argument in addEventListener.'
        });
      }
    }
  });

  return recommendations;
}
