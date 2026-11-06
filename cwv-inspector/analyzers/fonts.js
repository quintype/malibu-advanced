import { extractCodeContext } from '../utils/codeContext.js';
import { getLineAndColumn } from './correlation.js';

/**
 * Analyzes font declarations and preloads.
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @returns {Array<object>} Font-related recommendations
 */
export function analyzeFonts(files) {
  const recommendations = [];

  files.forEach(f => {
    // 1. Scan CSS files for font-display swap
    if (f.ext === '.css') {
      const fontFaceBlocks = f.content.match(/@font-face\s*\{[^}]*\}/gi) || [];
      fontFaceBlocks.forEach(block => {
        if (!block.toLowerCase().includes('font-display')) {
          // Find family name if possible
          const familyMatch = block.match(/font-family:\s*([^;}]+)/i);
          const family = familyMatch ? familyMatch[1].trim() : 'Unknown';
          const blockIdx = f.content.indexOf(block);
          const { line } = getLineAndColumn(f.content, blockIdx >= 0 ? blockIdx : 0);
          const lineNum = line || 1;

          recommendations.push({
            type: 'code',
            file: f.relativePath,
            line: lineNum,
            cwv: 'lcp',
            severity: 'medium',
            message: `Font-face "${family}" does not define font-display.`,
            impact: 'The browser blocks rendering text using this font until it is fully loaded, causing invisible text (FOIT).',
            suggestion: 'Add "font-display: swap;" inside your @font-face definition to fall back to a system font immediately.',
            whyExplanation: `@font-face rule for "${family}" at line ${lineNum} lacks font-display. Until the webfont file is completely downloaded, the browser renders text invisibly (Flash of Invisible Text - FOIT), postponing the first text paint and LCP.`,
            codeContext: extractCodeContext(f.content, lineNum),
            fixCode: {
              before: block,
              after: block.replace(/\{/, '{\n  font-display: swap;'),
              description: 'Add font-display: swap so system fallback fonts render text immediately while custom fonts load in parallel.'
            }
          });
        }
      });
    }

    // 2. Scan HTML files for font preloads
    if (f.ext === '.html' || f.relativePath.endsWith('Document.js') || f.relativePath.endsWith('Document.tsx')) {
      const content = f.content;
      if (content.includes('.woff2') && !content.includes('rel="preload"')) {
        const woff2Idx = content.indexOf('.woff2');
        const { line } = getLineAndColumn(content, woff2Idx >= 0 ? woff2Idx : 0);
        const lineNum = line || 1;

        recommendations.push({
          type: 'code',
          file: f.relativePath,
          line: lineNum,
          cwv: 'lcp',
          severity: 'medium',
          message: 'Font files (.woff2) are referenced but not preloaded.',
          impact: 'Critical font resources are discovered late, causing a late swap layout shift or FOIT.',
          suggestion: 'Preload critical fonts using <link rel="preload" href="/path/to/font.woff2" as="font" type="font/woff2" crossorigin>.',
          whyExplanation: `A webfont (.woff2) is referenced near line ${lineNum}, but no <link rel="preload" as="font"> hint exists in the document head. The font download cannot start until CSS files are downloaded, parsed, and matched against DOM nodes.`,
          codeContext: extractCodeContext(f.content, lineNum),
          fixCode: {
            before: `<!-- Head has no font preload -->`,
            after: `<link rel="preload" href="/fonts/primary.woff2" as="font" type="font/woff2" crossorigin="anonymous" />`,
            description: 'Preload key body/headline webfonts in the <head> so network fetching begins simultaneously with stylesheet requests.'
          }
        });
      }
    }
  });

  return recommendations;
}
