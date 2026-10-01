/**
 * Analyzes code elements affecting Largest Contentful Paint (LCP).
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @param {Array<object>} reactAsts Pre-parsed React AST objects.
 * @returns {Array<object>} LCP recommendations
 */
export function analyzeLcp(files, reactAsts) {
  const recommendations = [];

  for (const { file, ast } of reactAsts) {
    if (!ast.astSuccess) continue;

    // 1. Scan image tags
    ast.jsxTags.forEach(tag => {
      if (tag.tagName === 'img' || tag.tagName === 'Image') {
        const loadingAttr = tag.attributes.find(a => a.name === 'loading');
        const priorityAttr = tag.attributes.find(a => a.name === 'priority' || a.name === 'fetchpriority');
        const srcAttr = tag.attributes.find(a => a.name === 'src');

        // Check if an image is explicitly loaded eagerly or has high priority
        const hasPriority = priorityAttr && (priorityAttr.value === 'high' || priorityAttr.value === true);
        const isLazy = loadingAttr && loadingAttr.value === 'lazy';

        // Flag potential LCP images that are lazy loaded
        if (isLazy && (file.relativePath.toLowerCase().includes('hero') || file.relativePath.toLowerCase().includes('banner') || file.relativePath.toLowerCase().includes('index'))) {
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

    // 2. Scan HTML files for preloads
    files.forEach(f => {
      if (f.ext === '.html') {
        const content = f.content.toLowerCase();
        if (content.includes('<img') && !content.includes('rel="preload"') && !content.includes('rel="dns-prefetch"')) {
          recommendations.push({
            type: 'code',
            file: f.relativePath,
            line: 1,
            cwv: 'lcp',
            severity: 'medium',
            message: 'Images detected but no resource hints (preload / preconnect / dns-prefetch) found.',
            impact: 'Critical assets like fonts or hero images are discovered late by the browser.',
            suggestion: 'Add <link rel="preload" as="image" href="..."> or <link rel="preconnect" href="..."> in the head.'
          });
        }
      }
    });
  }

  return recommendations;
}
