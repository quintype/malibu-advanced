import { getLineAndColumn } from './correlation.js';
import { extractCodeContext } from '../utils/codeContext.js';

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
    if (f.ext === '.html' || f.relativePath.endsWith('Document.js') || f.relativePath.endsWith('Document.tsx')) {
      const scriptTags = f.content.match(/<script\s+src=["'](?!https:\/\/www\.google-analytics\.com)([^"']+)["'][^>]*>/gi) || [];
      scriptTags.forEach(tag => {
        if (!tag.toLowerCase().includes('async') && !tag.toLowerCase().includes('defer') && !tag.toLowerCase().includes('type="module"')) {
          const index = f.content.indexOf(tag);
          const { line } = getLineAndColumn(f.content, index);
          const lineNum = line || 1;

          recommendations.push({
            type: 'code',
            file: f.relativePath,
            line: lineNum,
            cwv: 'inp',
            severity: 'high',
            message: `Synchronous, render-blocking script tag found: "${tag}".`,
            impact: 'Synchronous scripts block HTML parsing, layout, and rendering, severely increasing TBT and FCP.',
            suggestion: 'Add "defer" or "async" to the script tag, or convert it to type="module".',
            whyExplanation: `Synchronous script at line ${lineNum} pauses the browser HTML parser until the script network download and evaluation finish. This causes high Total Blocking Time and delays LCP.`,
            codeContext: extractCodeContext(f.content, lineNum),
            fixCode: {
              before: tag,
              after: tag.replace(/<script\b/i, '<script defer'),
              description: 'Add defer so the script downloads concurrently with HTML parsing and executes in order after the document parses.'
            }
          });
        }
      });
    }

    // 2. Scan JS files for heavy synchronous APIs like localStorage
    if (f.ext === '.js' || f.ext === '.ts' || f.ext === '.jsx' || f.ext === '.tsx') {
      const localStorageWrites = (f.content.match(/localStorage\.setItem\(/g) || []).length;
      if (localStorageWrites > 5 && !f.content.includes('setTimeout') && !f.content.includes('requestIdleCallback')) {
        const lsIdx = f.content.indexOf('localStorage.setItem(');
        const { line } = getLineAndColumn(f.content, lsIdx >= 0 ? lsIdx : 0);
        const lineNum = line || 1;

        recommendations.push({
          type: 'code',
          file: f.relativePath,
          line: lineNum,
          cwv: 'inp',
          severity: 'medium',
          message: 'Multiple synchronous localStorage writes detected.',
          impact: 'localStorage is synchronous and runs on the main thread. Frequent writes block the thread, leading to interaction lag (INP).',
          suggestion: 'Throttle/debounce localStorage writes, move them to requestIdleCallback(), or use IndexedDB.',
          whyExplanation: `Found ${localStorageWrites} synchronous localStorage.setItem calls starting around line ${lineNum}. Synchronous storage operations freeze the JavaScript main thread during user interactions, causing high INP.`,
          codeContext: extractCodeContext(f.content, lineNum),
          fixCode: {
            before: `localStorage.setItem('key', JSON.stringify(val));`,
            after: `if ('requestIdleCallback' in window) {\n  requestIdleCallback(() => localStorage.setItem('key', JSON.stringify(val)));\n} else {\n  setTimeout(() => localStorage.setItem('key', JSON.stringify(val)), 0);\n}`,
            description: 'Move persistent storage operations to an idle callback or debounce wrapper.'
          }
        });
      }
    }
  });

  return recommendations;
}
