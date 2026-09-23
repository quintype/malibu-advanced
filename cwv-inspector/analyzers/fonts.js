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

          recommendations.push({
            type: 'code',
            file: f.relativePath,
            line: 1,
            cwv: 'lcp',
            severity: 'medium',
            message: `Font-face "${family}" does not define font-display.`,
            impact: 'The browser blocks rendering text using this font until it is fully loaded, causing invisible text (FOIT).',
            suggestion: 'Add "font-display: swap;" inside your @font-face definition to fall back to a system font immediately.'
          });
        }
      });
    }

    // 2. Scan HTML files for font preloads
    if (f.ext === '.html' || f.relativePath.endsWith('Document.js') || f.relativePath.endsWith('Document.tsx')) {
      const content = f.content;
      if (content.includes('.woff2') && !content.includes('rel="preload"')) {
        recommendations.push({
          type: 'code',
          file: f.relativePath,
          line: 1,
          cwv: 'lcp',
          severity: 'medium',
          message: 'Font files (.woff2) are referenced but not preloaded.',
          impact: 'Critical font resources are discovered late, causing a late swap layout shift or FOIT.',
          suggestion: 'Preload critical fonts using <link rel="preload" href="/path/to/font.woff2" as="font" type="font/woff2" crossorigin>.'
        });
      }
    }
  });

  return recommendations;
}
