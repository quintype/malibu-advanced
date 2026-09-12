/**
 * Analyzes JS files and script tags in HTML.
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @returns {Array<object>} JS-related recommendations
 */
export function analyzeJavascript(files) {
  const recommendations = [];

  files.forEach(f => {
    // 1. Scan HTML files for script tags without async or defer
    if (f.ext === '.html') {
      const scriptTags = f.content.match(/<script\s+src=["'](?!https:\/\/www\.google-analytics\.com)([^"']+)["'][^>]*>/gi) || [];
      scriptTags.forEach(tag => {
        if (!tag.toLowerCase().includes('async') && !tag.toLowerCase().includes('defer') && !tag.toLowerCase().includes('type="module"')) {
          recommendations.push({
            type: 'code',
            file: f.relativePath,
            line: 1,
            cwv: 'inp',
            severity: 'high',
            message: `Synchronous, render-blocking script tag found: "${tag}".`,
            impact: 'Synchronous scripts block HTML parsing, layout, and rendering, severely increasing TBT and FCP.',
            suggestion: 'Add "defer" or "async" to the script tag, or convert it to type="module".'
          });
        }
      });
    }

    // 2. Scan JS files for heavy synchronous APIs like localStorage
    if (f.ext === '.js' || f.ext === '.ts' || f.ext === '.jsx' || f.ext === '.tsx') {
      const localStorageWrites = (f.content.match(/localStorage\.setItem\(/g) || []).length;
      if (localStorageWrites > 5 && !f.content.includes('setTimeout') && !f.content.includes('requestIdleCallback')) {
        recommendations.push({
          type: 'code',
          file: f.relativePath,
          line: 1,
          cwv: 'inp',
          severity: 'medium',
          message: 'Multiple synchronous localStorage writes detected.',
          impact: 'localStorage is synchronous and runs on the main thread. Frequent writes block the thread, leading to interaction lag (INP).',
          suggestion: 'Throttle/debounce localStorage writes, move them to requestIdleCallback(), or use IndexedDB.'
        });
      }
    }
  });

  return recommendations;
}
