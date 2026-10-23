import path from 'path';
import { getLineAndColumn } from './correlation.js';

/**
 * Analyzes code elements affecting Largest Contentful Paint (LCP).
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @param {Array<object>} reactAsts Pre-parsed React AST objects.
 * @returns {Array<object>} LCP recommendations
 */
export function analyzeLcp(files = [], reactAsts = []) {
  const recommendations = [];

  // 1. Scan image tags in React ASTs
  for (const { file, ast } of reactAsts) {
    if (!ast.astSuccess) continue;

    ast.jsxTags.forEach(tag => {
      if (tag.tagName === 'img' || tag.tagName === 'Image') {
        const loadingAttr = tag.attributes.find(a => a.name === 'loading');
        const priorityAttr = tag.attributes.find(a => a.name === 'priority' || a.name === 'fetchpriority');
        const srcAttr = tag.attributes.find(a => a.name === 'src');

        // Check if an image is explicitly loaded eagerly or has high priority
        const hasPriority = priorityAttr && (priorityAttr.value === 'high' || priorityAttr.value === true);
        const isLazy = loadingAttr && loadingAttr.value === 'lazy';

        // Flag potential LCP images that are lazy loaded
        const srcVal = String(srcAttr?.value || '');
        const isIconOrTiny = srcVal.includes('/icons/') ||
          srcVal.toLowerCase().includes('icon') ||
          srcVal.endsWith('.svg') ||
          tag.attributes.some(a => (a.name === 'width' || a.name === 'height') && Number(a.value) > 0 && Number(a.value) <= 64);

        // Only check true hero, banner, or top-level page/template components (not every atom/molecule index.js)
        const isHeroContext = /\b(hero|banner|lead[-_]?story|featured[-_]?story)\b/i.test(file.relativePath) ||
          /(pages\/.*index|templates\/.*index)/i.test(file.relativePath);

        if (isLazy && isHeroContext && !isIconOrTiny) {
          recommendations.push({
            type: 'code',
            file: file.relativePath,
            line: tag.loc?.start?.line || 1,
            cwv: 'lcp',
            severity: 'high',
            message: `Possible LCP image ("${srcAttr?.value || 'unknown'}") is lazy loaded.`,
            impact: 'Lazy-loading above-the-fold or hero images delays LCP rendering by waiting for JS execution.',
            suggestion: 'Remove loading="lazy" and add fetchpriority="high" or priority attribute to this image.'
          });
        }
      }
    });
  }

  // 2. Scan template files for missing resource hints and excessive preconnects (> 4 origins)
  const templateFiles = (files || []).filter(f =>
    ['.html', '.ejs', '.php', '.jsx', '.tsx', '.vue'].includes(f.ext)
  );

  templateFiles.forEach(f => {
    const content = f.content || '';
    const contentLower = content.toLowerCase();

    // Check for images without any resource hints
    if (f.ext === '.html') {
      if (contentLower.includes('<img') && !contentLower.includes('rel="preload"') && !contentLower.includes('rel="dns-prefetch"')) {
        const imgIndex = contentLower.indexOf('<img');
        const { line: imgLine } = getLineAndColumn(content, imgIndex >= 0 ? imgIndex : 0);
        recommendations.push({
          type: 'code',
          file: f.relativePath,
          line: imgLine || null,
          cwv: 'lcp',
          severity: 'medium',
          message: 'Images detected but no resource hints (preload / preconnect / dns-prefetch) found.',
          impact: 'Critical assets like fonts or hero images are discovered late by the browser.',
          suggestion: 'Add <link rel="preload" as="image" href="..."> or <link rel="preconnect" href="..."> in the head (limit preconnect to at most 2–4 critical origins).'
        });
      }
    }

    // Check for excessive preconnect links (> 4 origins)
    const linkRegex = /<link\b([^>]*?)>/gi;
    let match;
    const preconnectedOrigins = [];
    let firstPreconnectLine = 1;

    while ((match = linkRegex.exec(content)) !== null) {
      const attrs = match[1];
      if (/rel\s*=\s*["'][^"']*\bpreconnect\b[^"']*["']/i.test(attrs)) {
        const hrefMatch = attrs.match(/href\s*=\s*["']([^"']+)["']/i);
        const originOrUrl = hrefMatch ? hrefMatch[1] : 'unknown';
        if (preconnectedOrigins.length === 0) {
          const { line } = getLineAndColumn(content, match.index);
          firstPreconnectLine = line || 1;
        }
        preconnectedOrigins.push(originOrUrl);
      }
    }

    if (preconnectedOrigins.length > 4) {
      const sampleOrigins = preconnectedOrigins.slice(0, 4).join(', ') +
        (preconnectedOrigins.length > 4 ? ` (+${preconnectedOrigins.length - 4} more)` : '');
      recommendations.push({
        type: 'code',
        file: f.relativePath,
        line: firstPreconnectLine,
        cwv: 'lcp',
        severity: preconnectedOrigins.length > 6 ? 'high' : 'medium',
        message: `More than 4 preconnect connections found (${preconnectedOrigins.length} origins declared in ${path.basename(f.relativePath)}).`,
        impact: 'Preconnecting to more than 4 origins wastes CPU and network bandwidth on early TLS handshakes and ties up browser sockets, directly competing with and delaying critical LCP assets (HTML, CSS, fonts, and hero image).',
        suggestion: `Limit <link rel="preconnect"> to at most 2–4 critical origins needed immediately on page load (e.g. fonts.gstatic.com or your hero image CDN). For secondary origins (ads, trackers, analytics: ${sampleOrigins}), remove preconnect or switch to <link rel="dns-prefetch">.`
      });
    }
  });

  return recommendations;
}

