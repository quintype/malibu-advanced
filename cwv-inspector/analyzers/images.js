import { extractCodeContext } from '../utils/codeContext.js';

/**
 * Analyzes image-specific elements across files.
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @param {Array<object>} reactAsts Pre-parsed React AST objects.
 * @returns {Array<object>} Image optimization recommendations
 */
export function analyzeImages(files, reactAsts) {
  const recommendations = [];

  for (const { file, ast } of reactAsts) {
    if (!ast.astSuccess) continue;

    ast.jsxTags.forEach(tag => {
      if (tag.tagName === 'img' || tag.tagName === 'Image') {
        const srcAttr = tag.attributes.find(a => a.name === 'src');
        const loadingAttr = tag.attributes.find(a => a.name === 'loading');
        const altAttr = tag.attributes.find(a => a.name === 'alt');

        const srcVal = srcAttr?.value || '';
        const lineNum = tag.loc?.start?.line || 1;
        const tagAttrs = tag.attributes.map(a => ` ${a.name}="${a.value || ''}"`).join('');

        // Check format extensions in static src declarations
        const isLegacyFormat = typeof srcVal === 'string' && (srcVal.endsWith('.jpg') || srcVal.endsWith('.jpeg') || srcVal.endsWith('.png'));
        if (isLegacyFormat) {
          const ext = srcVal.split('.').pop() || '';
          recommendations.push({
            type: 'code',
            file: file.relativePath,
            line: lineNum,
            cwv: 'lcp',
            severity: 'medium',
            message: `Legacy image format (.png or .jpg) detected: "${srcVal}".`,
            impact: 'PNG and JPEG files are generally much larger than modern formats, increasing image download time and delaying LCP.',
            suggestion: 'Convert your source images to WebP or AVIF formats for significantly smaller payloads.',
            whyExplanation: `This <${tag.tagName}> on line ${lineNum} references a static .${ext} asset. Modern WebP/AVIF images deliver 30%–70% smaller byte weights with equal visual fidelity, substantially speeding up network arrival.`,
            codeContext: extractCodeContext(file.content, lineNum),
            fixCode: {
              before: `<${tag.tagName} src="${srcVal}"${altAttr ? ` alt="${altAttr.value}"` : ''} />`,
              after: `<picture>\n  <source srcSet="${srcVal.replace(/\.(png|jpe?g)$/i, '.webp')}" type="image/webp" />\n  <${tag.tagName} src="${srcVal}"${altAttr ? ` alt="${altAttr.value}"` : ''} />\n</picture>`,
              description: 'Use the HTML <picture> element or image CDN parameters to serve next-gen WebP/AVIF formats with legacy fallback.'
            }
          });
        }

        // Check if lazy loading is missing on normal below-the-fold images
        const isHomeOrList = file.relativePath.toLowerCase().includes('list') || file.relativePath.toLowerCase().includes('card') || file.relativePath.toLowerCase().includes('grid');
        const hasFrameworkLazy = file.content.includes('ResponsiveImage') || file.content.includes('LazyLoadImages') || file.content.includes('LazyLoad') || file.content.includes('next/image');
        if (isHomeOrList && !loadingAttr && !hasFrameworkLazy && !file.relativePath.toLowerCase().includes('hero') && !file.relativePath.toLowerCase().includes('banner')) {
          recommendations.push({
            type: 'code',
            file: file.relativePath,
            line: lineNum,
            cwv: 'lcp',
            severity: 'low',
            message: `Below-the-fold image missing explicit loading="lazy".`,
            impact: 'Non-critical images are fetched during the initial page load, consuming bandwidth that should be used for LCP.',
            suggestion: 'Add loading="lazy" to defer fetching this image until the user scrolls close to it.',
            whyExplanation: `At line ${lineNum}, an image inside a list or card component loads eagerly. Initial bandwidth is congested by non-visible off-screen images, delaying the critical first-viewport paint.`,
            codeContext: extractCodeContext(file.content, lineNum),
            fixCode: {
              before: `<${tag.tagName}${tagAttrs}>`,
              after: `<${tag.tagName}${tagAttrs} loading="lazy">`,
              description: 'Add loading="lazy" attribute so offscreen images only request bytes when scrolled near the viewport.'
            }
          });
        }

        // Check alt attribute
        if (altAttr === undefined) {
          recommendations.push({
            type: 'code',
            file: file.relativePath,
            line: lineNum,
            cwv: 'accessibility',
            severity: 'low',
            message: 'Image tag missing "alt" attribute.',
            impact: 'Fails accessibility audits and affects SEO/readability.',
            suggestion: 'Provide a descriptive "alt" attribute or use alt="" for decorative images.',
            whyExplanation: `This <${tag.tagName}> element at line ${lineNum} omits the alt attribute entirely, degrading screen reader accessibility and image SEO.`,
            codeContext: extractCodeContext(file.content, lineNum),
            fixCode: {
              before: `<${tag.tagName} src="..." />`,
              after: `<${tag.tagName} src="..." alt="Description of image" />`,
              description: 'Provide an informative alt text or alt="" if purely decorative.'
            }
          });
        }
      }
    });
  }

  return recommendations;
}
