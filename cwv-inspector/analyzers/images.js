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

        // Check format extensions in static src declarations
        const isLegacyFormat = typeof srcVal === 'string' && (srcVal.endsWith('.jpg') || srcVal.endsWith('.jpeg') || srcVal.endsWith('.png'));
        if (isLegacyFormat) {
          recommendations.push({
            type: 'code',
            file: file.relativePath,
            line: tag.loc?.start?.line || 1,
            cwv: 'lcp',
            severity: 'medium',
            message: `Legacy image format (.png or .jpg) detected: "${srcVal}".`,
            impact: 'PNG and JPEG files are generally much larger than modern formats, increasing image download time and delaying LCP.',
            suggestion: 'Convert your source images to WebP or AVIF formats for significantly smaller payloads.'
          });
        }

        // Check if lazy loading is missing on normal below-the-fold images
        const isHomeOrList = file.relativePath.toLowerCase().includes('list') || file.relativePath.toLowerCase().includes('card') || file.relativePath.toLowerCase().includes('grid');
        if (isHomeOrList && !loadingAttr && !file.relativePath.toLowerCase().includes('hero') && !file.relativePath.toLowerCase().includes('banner')) {
          recommendations.push({
            type: 'code',
            file: file.relativePath,
            line: tag.loc?.start?.line || 1,
            cwv: 'lcp',
            severity: 'low',
            message: `Below-the-fold image missing explicit loading="lazy".`,
            impact: 'Non-critical images are fetched during the initial page load, consuming bandwidth that should be used for LCP.',
            suggestion: 'Add loading="lazy" to defer fetching this image until the user scrolls close to it.'
          });
        }

        // Check alt attribute
        if (altAttr === undefined) {
          recommendations.push({
            type: 'code',
            file: file.relativePath,
            line: tag.loc?.start?.line || 1,
            cwv: 'accessibility',
            severity: 'low',
            message: 'Image tag missing "alt" attribute.',
            impact: 'Fails accessibility audits and affects SEO/readability.',
            suggestion: 'Provide a descriptive "alt" attribute or use alt="" for decorative images.'
          });
        }
      }
    });
  }

  return recommendations;
}
