/**
 * Analyzes code elements affecting Cumulative Layout Shift (CLS).
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @param {Array<object>} reactAsts Pre-parsed React AST objects.
 * @returns {Array<object>} CLS recommendations
 */
export function analyzeCls(files, reactAsts) {
  const recommendations = [];

  for (const { file, ast } of reactAsts) {
    if (!ast.astSuccess) continue;

    ast.jsxTags.forEach(tag => {
      if (tag.tagName === 'img' || tag.tagName === 'Image') {
        const widthAttr = tag.attributes.find(a => a.name === 'width');
        const heightAttr = tag.attributes.find(a => a.name === 'height');
        const styleAttr = tag.attributes.find(a => a.name === 'style');

        const hasWidth = !!widthAttr;
        const hasHeight = !!heightAttr;
        const hasStyle = !!styleAttr;

        // Flag images missing both width/height and style
        if (!hasWidth && !hasHeight && !hasStyle) {
          recommendations.push({
            type: 'code',
            file: file.relativePath,
            line: tag.loc?.start?.line || 1,
            cwv: 'cls',
            severity: 'high',
            message: `Image tag missing width and height attributes.`,
            impact: 'Browsers cannot calculate the aspect ratio before loading the image, leading to a layout shift.',
            suggestion: 'Add explicit width and height attributes, or define aspect-ratio / width / height in CSS.'
          });
        }
      }
    });

    // Check for dynamic element rendering that could cause shifts
    // Only flag true asynchronous state renders (e.g. useState/useEffect with loading/data flags),
    // NEVER flag static template props or SSR configuration branches (e.g. verticalShare, isFullBleed).
    const content = file.content;
    const hasStateOrAsync = /use(State|Query|SWR|Async|Effect)\b|fetch|axios|\.then\(/.test(content);
    if (hasStateOrAsync) {
      const asyncConditions = content.match(/\{\s*(?:is)?(?:Loading|Loaded|Fetching|Ready|data|response|error)\s*&&\s*<[A-Z]/g) || [];
      if (asyncConditions.length > 0 && !content.includes('Skeleton') && !content.includes('Placeholder')) {
        recommendations.push({
          type: 'code',
          file: file.relativePath,
          line: 1,
          cwv: 'cls',
          severity: 'medium',
          message: 'Asynchronous state conditional render detected without a loading skeleton or placeholder.',
          impact: 'Injecting components dynamically after client-side state resolution causes content below to jump.',
          suggestion: 'Render a skeleton loader or reserve layout space via CSS on the component/container instead of injecting elements after data resolves. Do not use empty dummy spacer divs.'
        });
      }
    }
  }

  // Scan CSS files for non-composited animations
  files.forEach(f => {
    if (f.ext === '.css') {
      const transitions = f.content.match(/transition:\s*([^;]+)/gi) || [];
      transitions.forEach(trans => {
        if (trans.includes('width') || trans.includes('height') || trans.includes('top') || trans.includes('left') || trans.includes('margin')) {
          recommendations.push({
            type: 'code',
            file: f.relativePath,
            line: 1, // CSS files are simpler to report globally or per-file
            cwv: 'cls',
            severity: 'medium',
            message: `Transition on layout-inducing property found: "${trans}".`,
            impact: 'Animating geometry or positioning triggers layout recalculations on every frame, impacting performance and CLS.',
            suggestion: 'Use transform (e.g. translate, scale) and opacity for animations instead of changing layout dimensions.'
          });
        }
      });
    }
  });

  return recommendations;
}
