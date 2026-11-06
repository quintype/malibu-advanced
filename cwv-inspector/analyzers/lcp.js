import path from 'path';
import { getLineAndColumn } from './correlation.js';
import { extractCodeContext } from '../utils/codeContext.js';

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

        // Only check true hero, banner, or top-level lead story components
        const isHeroContext = /\b(hero[-_]?image|hero[-_]?banner|lead[-_]?story|featured[-_]?story)\b/i.test(file.relativePath) ||
          tag.attributes.some(a => (a.name === "id" || a.name === "className" || a.name === "styleName") && /hero/i.test(a.value));

        if (isLazy && isHeroContext && !isIconOrTiny) {
          const lineNum = tag.loc?.start?.line || 1;
          const tagAttrs = tag.attributes.map(a => ` ${a.name}="${a.value || ''}"`).join('');

          recommendations.push({
            type: 'code',
            file: file.relativePath,
            line: lineNum,
            cwv: 'lcp',
            severity: 'high',
            message: `Possible LCP image ("${srcAttr?.value || 'unknown'}") is lazy loaded.`,
            impact: 'Lazy-loading above-the-fold or hero images delays LCP rendering by waiting for JS execution.',
            suggestion: 'Remove loading="lazy" and add fetchpriority="high" or priority attribute to this image.',
            whyExplanation: `This <${tag.tagName}> image at line ${lineNum} is located in a hero/lead story context but specifies loading="lazy". The browser's preload scanner defers downloading it until JavaScript execution and layout computation finish, substantially delaying the Largest Contentful Paint.`,
            codeContext: extractCodeContext(file.content, lineNum),
            fixCode: {
              before: `<${tag.tagName}${tagAttrs}>`,
              after: `<${tag.tagName}${tagAttrs.replace(/loading=["']lazy["']/, 'fetchpriority="high"')}>`,
              description: 'Remove loading="lazy" and add fetchpriority="high" so the image is prioritized immediately by the browser.'
            }
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
        const lineNum = imgLine || 1;

        recommendations.push({
          type: 'code',
          file: f.relativePath,
          line: lineNum,
          cwv: 'lcp',
          severity: 'medium',
          message: 'Images detected but no resource hints (preload / preconnect / dns-prefetch) found.',
          impact: 'Critical assets like fonts or hero images are discovered late by the browser.',
          suggestion: 'Add <link rel="preload" as="image" href="..."> or <link rel="preconnect" href="..."> in the head (limit preconnect to at most 2–4 critical origins).',
          whyExplanation: `HTML contains <img> tags, but <head> lacks resource preloads or preconnect hints. The browser cannot discover and request the hero asset until it traverses and parses this portion of the DOM tree.`,
          codeContext: extractCodeContext(f.content, lineNum),
          fixCode: {
            before: `<head>\n  <!-- No resource preloads -->\n</head>`,
            after: `<head>\n  <link rel="preload" as="image" href="/path/to/hero.webp" fetchpriority="high" />\n  <link rel="preconnect" href="https://image-cdn.com">\n</head>`,
            description: 'Add a preload link in <head> for your primary hero image so discovery begins concurrently with HTML/CSS parsing.'
          }
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
        suggestion: `Limit <link rel="preconnect"> to at most 2–4 critical origins needed immediately on page load (e.g. fonts.gstatic.com or your hero image CDN). For secondary origins (ads, trackers, analytics: ${sampleOrigins}), remove preconnect or switch to <link rel="dns-prefetch">.`,
        whyExplanation: `Around line ${firstPreconnectLine}, ${preconnectedOrigins.length} origins are preconnected. Initiating TLS negotiations with >4 distinct hostnames congests browser socket pools and CPU, delaying the critical LCP network pipe.`,
        codeContext: extractCodeContext(f.content, firstPreconnectLine),
        fixCode: {
          before: `<link rel="preconnect" href="..."> <!-- Repeated for ${preconnectedOrigins.length} origins -->`,
          after: `<!-- Keep only 2-3 critical origins (fonts, image CDN) -->\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<!-- Use dns-prefetch for secondary origins -->\n<link rel="dns-prefetch" href="https://analytics-service.com">`,
          description: 'Keep preconnect for critical LCP origins only; downgrade analytics/ad services to dns-prefetch.'
        }
      });
    }
  });

  return recommendations;
}

