/**
 * Analyzes CSS files and CSS usage in HTML.
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @returns {Array<object>} CSS-related recommendations
 */
export function analyzeCss(files) {
  const recommendations = [];

  files.forEach(f => {
    // Check for @import inside CSS files (anti-pattern)
    if (f.ext === '.css') {
      const importMatches = f.content.match(/@import\s+url\([^)]+\)/gi) || [];
      if (importMatches.length > 0) {
        recommendations.push({
          type: 'code',
          file: f.relativePath,
          line: 1,
          cwv: 'lcp',
          severity: 'high',
          message: `@import rule found inside CSS file: "${importMatches[0]}".`,
          impact: '@import delays the discovery of stylesheets, causing the browser to serialise download chains and delay parsing.',
          suggestion: 'Remove @import from stylesheets; link stylesheets directly from the HTML using <link rel="stylesheet">.'
        });
      }
    }

    // Check for blocking stylesheets in HTML files
    if (f.ext === '.html') {
      const stylesheets = f.content.match(/<link\s+rel=["']stylesheet["'][^>]*>/gi) || [];
      if (stylesheets.length > 2) {
        recommendations.push({
          type: 'code',
          file: f.relativePath,
          line: 1,
          cwv: 'lcp',
          severity: 'medium',
          message: `${stylesheets.length} blocking stylesheets linked in HTML head.`,
          impact: 'CSS is a render-blocking resource. Having multiple individual stylesheets delays initial paint.',
          suggestion: 'Consolidate multiple stylesheets or inline critical CSS styles in a <style> block, loading the rest asynchronously.'
        });
      }
    }
  });

  return recommendations;
}
