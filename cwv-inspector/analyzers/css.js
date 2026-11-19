import { getLineAndColumn } from './correlation.js';
import { extractCodeContext } from '../utils/codeContext.js';

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
        const importIdx = f.content.indexOf(importMatches[0]);
        const { line: importLine } = getLineAndColumn(f.content, importIdx >= 0 ? importIdx : 0);
        const lineNum = importLine || 1;

        recommendations.push({
          type: 'code',
          file: f.relativePath,
          line: lineNum,
          cwv: 'lcp',
          severity: 'high',
          message: `@import rule found inside CSS file: "${importMatches[0]}".`,
          impact: '@import delays the discovery of stylesheets, causing the browser to serialise download chains and delay parsing.',
          suggestion: 'Remove @import from stylesheets; link stylesheets directly from the HTML using <link rel="stylesheet">.',
          whyExplanation: `@import on line ${lineNum} triggers a sequential network waterfall. The browser must fully fetch and parse this stylesheet before discovering and initiating the nested stylesheet request, stalling render.`,
          codeContext: extractCodeContext(f.content, lineNum),
          fixCode: {
            before: importMatches[0] + ';',
            after: `/* In HTML <head> instead: */\n<link rel="stylesheet" href="...">`,
            description: 'Link the imported stylesheet directly from HTML so both sheets download in parallel.'
          }
        });
      }
    }

    // Check for blocking stylesheets in HTML files
    if (f.ext === '.html') {
      const stylesheets = f.content.match(/<link\s+rel=["']stylesheet["'][^>]*>/gi) || [];
      if (stylesheets.length > 2) {
        const linkIdx = f.content.indexOf(stylesheets[0]);
        const { line: linkLine } = getLineAndColumn(f.content, linkIdx >= 0 ? linkIdx : 0);
        const lineNum = linkLine || 1;

        recommendations.push({
          type: 'code',
          file: f.relativePath,
          line: lineNum,
          cwv: 'lcp',
          severity: 'medium',
          message: `${stylesheets.length} blocking stylesheets linked in HTML head.`,
          impact: 'CSS is a render-blocking resource. Having multiple individual stylesheets delays initial paint.',
          suggestion: 'Consolidate multiple stylesheets or inline critical CSS styles in a <style> block, loading the rest asynchronously.',
          whyExplanation: `${stylesheets.length} separate synchronous stylesheets are declared in <head>. Each file blocks DOM construction and rendering until the network round trip and parsing complete.`,
          codeContext: extractCodeContext(f.content, lineNum),
          fixCode: {
            before: stylesheets.slice(0, 2).join('\n') + '\n...',
            after: `<link rel="preload" href="/styles/non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">\n<noscript><link rel="stylesheet" href="/styles/non-critical.css"></noscript>`,
            description: 'Load secondary stylesheets asynchronously with media="print" or rel="preload" onload pattern.'
          }
        });
      }
    }
  });

  return recommendations;
}
