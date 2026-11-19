import path from 'path';
import { getLineAndColumn } from './correlation.js';
import { extractCodeContext } from '../utils/codeContext.js';
import { generateVerificationGuidance } from '../utils/validationHelpers.js';

/**
 * Analyzes code elements affecting Largest Contentful Paint (LCP).
 * Supports Lighthouse runtime LCP element correlation, network request priority analysis,
 * image format and responsive sizing optimization, and preconnect link management.
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @param {Array<object>} reactAsts Pre-parsed React AST objects.
 * @param {object|null} [lighthouseData=null] Optional Lighthouse runtime audit data.
 * @returns {Array<object>} LCP recommendations
 */
export function analyzeLcp(files = [], reactAsts = [], lighthouseData = null) {
  const recommendations = [];

  // Extract runtime LCP candidate information if available
  const runtimeLcpEl = lighthouseData?.lcpElement ||
    lighthouseData?.mobile?.lcpElement ||
    lighthouseData?.desktop?.lcpElement ||
    null;
  const runtimeLcpSrc = runtimeLcpEl?.src ? path.basename(runtimeLcpEl.src) : null;

  // 1. Scan image tags in React ASTs
  for (const { file, ast } of (reactAsts || [])) {
    if (!ast?.astSuccess || !Array.isArray(ast.jsxTags)) continue;

    ast.jsxTags.forEach(tag => {
      if (tag.tagName === 'img' || tag.tagName === 'Image') {
        const loadingAttr = tag.attributes?.find(a => a.name === 'loading');
        const priorityAttr = tag.attributes?.find(a => a.name === 'priority' || a.name === 'fetchpriority');
        const srcAttr = tag.attributes?.find(a => a.name === 'src');
        const srcSetAttr = tag.attributes?.find(a => a.name === 'srcSet' || a.name === 'srcset');
        const sizesAttr = tag.attributes?.find(a => a.name === 'sizes');

        const hasPriority = priorityAttr && (priorityAttr.value === 'high' || priorityAttr.value === true);
        const isLazy = loadingAttr && loadingAttr.value === 'lazy';

        const srcVal = String(srcAttr?.value || '');
        const isIconOrTiny = srcVal.includes('/icons/') ||
          srcVal.toLowerCase().includes('icon') ||
          srcVal.endsWith('.svg') ||
          (tag.attributes || []).some(a => (a.name === 'width' || a.name === 'height') && Number(a.value) > 0 && Number(a.value) <= 64);

        // Check if image matches runtime LCP element, or static hero context
        const matchesRuntimeLcp = Boolean(runtimeLcpSrc && srcVal.includes(runtimeLcpSrc));
        const isHeroContext = matchesRuntimeLcp ||
          /\b(hero[-_]?image|hero[-_]?banner|lead[-_]?story|featured[-_]?story)\b/i.test(file.relativePath) ||
          (tag.attributes || []).some(a => (a.name === "id" || a.name === "className" || a.name === "styleName") && /hero/i.test(a.value));

        const lineNum = tag.loc?.start?.line || 1;
        const tagAttrs = (tag.attributes || []).map(a => ` ${a.name}="${a.value || ''}"`).join('');

        // Issue 1: Lazy-loaded LCP or Hero Image
        if (isLazy && isHeroContext && !isIconOrTiny) {
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
            },
            howToVerify: generateVerificationGuidance('lcp', { type: 'lazy-lcp' })
          });
        }

        // Issue 2: Hero/LCP image format optimization (legacy .jpg/.png)
        if (isHeroContext && !isIconOrTiny) {
          const lowerSrc = srcVal.toLowerCase();
          const isLegacyFormat = lowerSrc.endsWith('.jpg') || lowerSrc.endsWith('.jpeg') || lowerSrc.endsWith('.png');
          if (isLegacyFormat) {
            recommendations.push({
              type: 'code',
              file: file.relativePath,
              line: lineNum,
              cwv: 'lcp',
              severity: 'medium',
              message: `Hero/LCP image uses legacy format instead of modern WebP/AVIF.`,
              impact: 'Serving uncompressed legacy formats inflates image payload by 25-50%, increasing network download time and delaying LCP.',
              suggestion: 'Convert hero images to AVIF/WebP formats or serve them through a modern image CDN with next-gen format negotiation.',
              whyExplanation: `The critical hero image at line ${lineNum} references a legacy format (${path.extname(srcVal) || 'image'}). Next-generation formats like AVIF and WebP achieve identical visual fidelity with 25-50% smaller byte sizes, accelerating download completion.`,
              codeContext: extractCodeContext(file.content, lineNum),
              fixCode: {
                before: `<${tag.tagName} src="${srcVal}" ... />`,
                after: `<picture>\n  <source srcSet="${srcVal.replace(/\.(png|jpe?g)$/i, '.avif')}" type="image/avif" />\n  <source srcSet="${srcVal.replace(/\.(png|jpe?g)$/i, '.webp')}" type="image/webp" />\n  <img src="${srcVal}" fetchpriority="high" ... />\n</picture>`,
                description: 'Wrap the image in a <picture> element with AVIF and WebP sources, retaining the legacy file as fallback.'
              },
              howToVerify: generateVerificationGuidance('lcp', { type: 'image-format' })
            });
          }

          // Issue 3: Responsive sizing on hero image
          if (!srcSetAttr && !sizesAttr && isHeroContext && !isIconOrTiny) {
            recommendations.push({
              type: 'code',
              file: file.relativePath,
              line: lineNum,
              cwv: 'lcp',
              severity: 'low',
              message: `Hero/LCP image lacks responsive sizing attributes (srcSet and sizes).`,
              impact: 'Mobile viewports may download desktop-sized hero images, transferring unnecessary bytes over mobile networks.',
              suggestion: 'Add responsive srcSet and sizes attributes to serve viewport-tailored image dimensions.',
              whyExplanation: `At line ${lineNum}, the primary image does not declare srcSet or sizes. Mobile devices will fetch the full desktop image asset, transferring excessive kilobytes and delaying LCP.`,
              codeContext: extractCodeContext(file.content, lineNum),
              fixCode: {
                before: `<${tag.tagName} src="${srcVal}" ... />`,
                after: `<${tag.tagName}\n  src="${srcVal}"\n  srcSet="${srcVal}?w=480 480w, ${srcVal}?w=800 800w, ${srcVal}?w=1200 1200w"\n  sizes="(max-width: 600px) 100vw, 800px"\n  fetchpriority="high"\n  ... />`,
                description: 'Provide responsive candidate widths via srcSet and specify layout allocation via sizes.'
              },
              howToVerify: generateVerificationGuidance('lcp', { type: 'responsive-images' })
            });
          }
        }
      }
    });
  }

  // 2. Scan template files for missing resource hints, network priority, and excessive preconnects
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
          },
          howToVerify: generateVerificationGuidance('lcp', { type: 'resource-hints' })
        });
      }
    }

    // Check network request priority: LCP asset preceded by >2 blocking stylesheets/scripts
    if (['.html', '.ejs'].includes(f.ext)) {
      const headMatch = content.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
      if (headMatch) {
        const headContent = headMatch[1];
        const blockingSheets = (headContent.match(/<link\s+[^>]*rel=["']stylesheet["'][^>]*>/gi) || [])
          .filter(link => !link.includes('media="print"') && !link.includes('disabled'));
        const blockingScripts = (headContent.match(/<script\b[^>]*src=["'][^"']+["'][^>]*>/gi) || [])
          .filter(s => !s.includes('async') && !s.includes('defer') && !s.includes('type="module"'));

        const totalBlocking = blockingSheets.length + blockingScripts.length;
        const hasPreloadHero = /<link\s+[^>]*rel=["']preload["'][^>]*as=["']image["']/i.test(headContent);

        if (totalBlocking > 2 && !hasPreloadHero && contentLower.includes('<img')) {
          const { line } = getLineAndColumn(content, headMatch.index || 0);
          const lineNum = line || 1;

          recommendations.push({
            type: 'code',
            file: f.relativePath,
            line: lineNum,
            cwv: 'lcp',
            severity: 'high',
            message: `LCP resource loads after ${totalBlocking} render-blocking resources in <head>.`,
            impact: 'Synchronous stylesheets and scripts block HTML parsing, postponing LCP image discovery and network fetch.',
            suggestion: 'Add <link rel="preload" as="image" fetchpriority="high"> before blocking stylesheets, or defer non-critical scripts.',
            whyExplanation: `In ${f.relativePath} at line ${lineNum}, the document declares ${totalBlocking} render-blocking resources in <head> before preloading the primary LCP image. The browser halts layout and image request initiation until all blocking assets complete transfer and execution.`,
            codeContext: extractCodeContext(content, lineNum),
            fixCode: {
              before: `<head>\n  ${blockingSheets.slice(0, 2).join('\n  ')}\n  <!-- Hero image discovered late in <body> -->\n</head>`,
              after: `<head>\n  <!-- 1. Preload LCP hero early with high priority -->\n  <link rel="preload" as="image" href="/path/to/hero.webp" fetchpriority="high">\n  <!-- 2. Follow with critical CSS and deferred scripts -->\n  <link rel="stylesheet" href="/styles/main.css">\n</head>`,
              description: 'Place the LCP image preload hint above blocking stylesheets so the browser starts downloading it immediately.'
            },
            howToVerify: generateVerificationGuidance('lcp', { type: 'blocking-resources' })
          });
        }
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
        },
        howToVerify: generateVerificationGuidance('lcp', { type: 'preconnect' })
      });
    }
  });

  return recommendations;
}
