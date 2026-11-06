import { extractCodeContext } from '../utils/codeContext.js';
import { getLineAndColumn } from './correlation.js';

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
          const lineNum = tag.loc?.start?.line || 1;
          const tagAttrs = tag.attributes.map(a => ` ${a.name}="${a.value || ''}"`).join('');
          const beforeSnippet = `<${tag.tagName}${tagAttrs}>`;
          const afterSnippet = `<${tag.tagName}${tagAttrs} width="800" height="450">`;

          recommendations.push({
            type: 'code',
            file: file.relativePath,
            line: lineNum,
            cwv: 'cls',
            severity: 'high',
            message: `Image tag missing width and height attributes.`,
            impact: 'Browsers cannot calculate the aspect ratio before loading the image, leading to a layout shift.',
            suggestion: 'Add explicit width and height attributes, or define aspect-ratio / width / height in CSS.',
            whyExplanation: `This <${tag.tagName}> element at line ${lineNum} has no width, height, or style attribute. Without declared dimensions, the browser allocates 0px height initially and reflows the entire layout when the image downloads, directly causing a layout shift.`,
            codeContext: extractCodeContext(file.content, lineNum),
            fixCode: {
              before: beforeSnippet,
              after: afterSnippet,
              description: 'Specify explicit width and height attributes or CSS aspect-ratio so the browser reserves layout space before download completes.'
            }
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
        const firstMatch = asyncConditions[0];
        const matchIdx = content.indexOf(firstMatch);
        const { line } = getLineAndColumn(content, matchIdx >= 0 ? matchIdx : 0);
        const lineNum = line || 1;

        recommendations.push({
          type: 'code',
          file: file.relativePath,
          line: lineNum,
          cwv: 'cls',
          severity: 'medium',
          message: 'Asynchronous state conditional render detected without a loading skeleton or placeholder.',
          impact: 'Injecting components dynamically after client-side state resolution causes content below to jump.',
          suggestion: 'Render a skeleton loader or reserve layout space via CSS on the component/container instead of injecting elements after data resolves. Do not use empty dummy spacer divs.',
          whyExplanation: `At line ${lineNum}, asynchronous data conditionally mounts a component (${firstMatch.trim()}) without reserving space. Content below it will suddenly shift downwards once the promise resolves.`,
          codeContext: extractCodeContext(file.content, lineNum),
          fixCode: {
            before: `${firstMatch} ... }`,
            after: `{isLoading ? <ComponentSkeleton /> : <Component ... />}`,
            description: 'Render a placeholder/skeleton with matching dimensions to maintain stable viewport height while data fetches.'
          }
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
          const transIdx = f.content.indexOf(trans);
          const { line } = getLineAndColumn(f.content, transIdx >= 0 ? transIdx : 0);
          const lineNum = line || 1;

          recommendations.push({
            type: 'code',
            file: f.relativePath,
            line: lineNum,
            cwv: 'cls',
            severity: 'medium',
            message: `Transition on layout-inducing property found: "${trans}".`,
            impact: 'Animating geometry or positioning triggers layout recalculations on every frame, impacting performance and CLS.',
            suggestion: 'Use transform (e.g. translate, scale) and opacity for animations instead of changing layout dimensions.',
            whyExplanation: `CSS transition on line ${lineNum} animates layout-geometry properties. The browser must recalculate layout (reflow) on every animation frame instead of offloading to the GPU compositor.`,
            codeContext: extractCodeContext(f.content, lineNum),
            fixCode: {
              before: trans + ';',
              after: 'transition: transform 0.3s ease, opacity 0.3s ease;\ntransform: translate(...) / scale(...);',
              description: 'Use transform and opacity which run entirely on the compositor thread without layout recalculation.'
            }
          });
        }
      });
    }
  });

  return recommendations;
}
