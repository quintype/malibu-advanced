import { extractCodeContext } from '../utils/codeContext.js';
import { getLineAndColumn } from './correlation.js';
import { validateImageSizing, generateVerificationGuidance } from '../utils/validationHelpers.js';

/**
 * Analyzes code elements affecting Cumulative Layout Shift (CLS).
 * Implements comprehensive image dimension validation, font loading FOIT/FOUT detection,
 * Intersection Observer lazy load shifts, dynamic async state renders, and layout transitions.
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @param {Array<object>} reactAsts Pre-parsed React AST objects.
 * @param {object|null} [lighthouseData=null] Optional Lighthouse runtime audit data.
 * @returns {Array<object>} CLS recommendations
 */
export function analyzeCls(files = [], reactAsts = [], lighthouseData = null) {
  const recommendations = [];

  // Extract CSS rules from workspace stylesheets to check aspect-ratio and dimension rules
  const cssRules = [];
  (files || []).forEach(f => {
    if (f.ext === '.css') {
      const ruleRegex = /([^{]+)\{([^}]+)\}/g;
      let m;
      while ((m = ruleRegex.exec(f.content || '')) !== null) {
        cssRules.push({
          selector: m[1].trim(),
          properties: m[2],
          content: m[0],
          file: f.relativePath
        });
      }
    }
  });

  // 1. Comprehensive Dimension Validation on React JSX Images
  for (const { file, ast } of (reactAsts || [])) {
    if (!ast?.astSuccess || !Array.isArray(ast.jsxTags)) continue;

    ast.jsxTags.forEach(tag => {
      if (tag.tagName === 'img' || tag.tagName === 'Image') {
        const lineNum = tag.loc?.start?.line || 1;
        const widthAttr = tag.attributes?.find(a => a.name === 'width');
        const heightAttr = tag.attributes?.find(a => a.name === 'height');
        const styleAttr = tag.attributes?.find(a => a.name === 'style');
        const srcSetAttr = tag.attributes?.find(a => a.name === 'srcSet' || a.name === 'srcset');

        const tagAttrs = (tag.attributes || []).map(a => ` ${a.name}="${a.value || ''}"`).join('');
        const sizing = validateImageSizing(tag, cssRules);

        // Issue 1: Completely missing width/height and style/aspect-ratio
        if (sizing.missingBoth) {
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
            },
            howToVerify: generateVerificationGuidance('cls', { type: 'missing-dimensions' })
          });
        }
        // Issue 2: Relative percentage width without aspect-ratio or explicit height
        else if (sizing.isRelativeWithoutRatio) {
          const beforeSnippet = `<${tag.tagName}${tagAttrs}>`;
          const afterSnippet = `<${tag.tagName}${tagAttrs} style={{ aspectRatio: '16 / 9' }}>`;

          recommendations.push({
            type: 'code',
            file: file.relativePath,
            line: lineNum,
            cwv: 'cls',
            severity: 'medium',
            message: `Image width is relative (%) without an aspect-ratio or height constraint.`,
            impact: 'Browsers cannot calculate image height from percentage width alone before the asset downloads, causing reflow.',
            suggestion: 'Add CSS aspect-ratio or define explicit height alongside relative width to maintain container stability.',
            whyExplanation: `This <${tag.tagName}> element at line ${lineNum} defines width as "${widthAttr?.value || '100%'}" but lacks height or aspect-ratio. Until the image header arrives, its height is unknown (0px), shifting content once downloaded.`,
            codeContext: extractCodeContext(file.content, lineNum),
            fixCode: {
              before: beforeSnippet,
              after: afterSnippet,
              description: 'Define aspect-ratio so the browser calculates height dynamically from width before the image arrives.'
            },
            howToVerify: generateVerificationGuidance('cls', { type: 'relative-width' })
          });
        }

        // Issue 3: Responsive srcSet without CSS aspect-ratio
        if (srcSetAttr && !sizing.hasCssAspectRatio && !styleAttr?.value?.includes('aspectRatio')) {
          const srcSetVal = String(srcSetAttr.value || '');
          const descriptors = srcSetVal.split(',').map(s => s.trim()).filter(Boolean);
          if (descriptors.length > 1 && (!widthAttr || !heightAttr) && !styleAttr) {
            recommendations.push({
              type: 'code',
              file: file.relativePath,
              line: lineNum,
              cwv: 'cls',
              severity: 'medium',
              message: `Responsive image (srcSet) declared without container aspect-ratio constraint.`,
              impact: 'Different responsive image variants may trigger layout recalculations if aspect ratios diverge.',
              suggestion: 'Ensure all responsive srcSet assets share an identical aspect ratio and declare CSS aspect-ratio on the container.',
              whyExplanation: `Image has multiple responsive candidates in srcSet at line ${lineNum}. Without aspect-ratio, switching between resolutions or viewports can trigger layout shifts if variants vary in proportions.`,
              codeContext: extractCodeContext(file.content, lineNum),
              fixCode: {
                before: `<${tag.tagName}${tagAttrs}>`,
                after: `<${tag.tagName}${tagAttrs} style={{ aspectRatio: '16 / 9', width: '100%', height: 'auto' }}>`,
                description: 'Set CSS aspect-ratio to anchor the viewport bounding box across all responsive srcSet candidates.'
              },
              howToVerify: generateVerificationGuidance('cls', { type: 'srcset-ratio' })
            });
          }
        }
      }
    });

    // 2. Dynamic Asynchronous State Render Detection
    const content = file.content || '';
    const hasStateOrAsync = /use(State|Query|SWR|Async|Effect)\b|fetch|axios|\.then\(/.test(content);
    if (hasStateOrAsync) {
      const hasPlaceholder = content.includes('Skeleton') || content.includes('Placeholder') || content.includes('Loader');
      if (!hasPlaceholder) {
        const booleanMatches = content.match(/\{\s*(?:is)?(?:Loading|Loaded|Fetching|Ready|data|response|error)\s*&&\s*<[A-Z]/g) || [];
        const ternaryMatches = content.match(/\{\s*(?:is)?(?:loading|pending|fetching|ready|data|response|error)\s*\?\s*(?:null|undefined|<[A-Z][a-zA-Z0-9_]*\s*\/?>)\s*:\s*<[A-Z]/gi) || [];
        const negationMatches = content.match(/\{\s*!(?:hasData|isReady|loaded|data|ready|loading)\s*&&\s*<[A-Z]/gi) || [];

        const allAsyncMatches = [...booleanMatches, ...ternaryMatches, ...negationMatches];
        if (allAsyncMatches.length > 0) {
          const firstMatch = allAsyncMatches[0];
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
            },
            howToVerify: generateVerificationGuidance('cls', { type: 'async-render' })
          });
        }
      }
    }
  }

  // 3. Scan CSS Files for Font Loading Shifts (FOIT / FOUT)
  (files || []).forEach(f => {
    if (f.ext === '.css') {
      const fontFaceRegex = /@font-face\s*\{([^}]+)\}/gi;
      let ffMatch;
      while ((ffMatch = fontFaceRegex.exec(f.content || '')) !== null) {
        const blockContent = ffMatch[1];
        const hasFontDisplay = /font-display\s*:\s*([^;]+)/i.test(blockContent);
        const fontDisplayAuto = /font-display\s*:\s*auto/i.test(blockContent);

        if (!hasFontDisplay || fontDisplayAuto) {
          const { line } = getLineAndColumn(f.content, ffMatch.index);
          const lineNum = line || 1;
          const familyMatch = blockContent.match(/font-family\s*:\s*['"]?([^'";]+)['"]?/i);
          const familyName = familyMatch ? familyMatch[1] : 'web font';

          recommendations.push({
            type: 'code',
            file: f.relativePath,
            line: lineNum,
            cwv: 'cls',
            severity: 'medium',
            message: `@font-face declaration for "${familyName}" missing optimized font-display strategy.`,
            impact: 'Without font-display: swap/optional, browsers trigger Flash of Invisible Text (FOIT) or abrupt FOUT layout shifts when font metrics swap.',
            suggestion: 'Add font-display: swap (with size-adjust/ascent-override) or font-display: optional to prevent text reflow upon font load.',
            whyExplanation: `Font declaration at line ${lineNum} lacks font-display. The browser defaults to "auto" (FOIT), hiding text until download finishes. When the web font swaps with the fallback font, differences in glyph metrics cause surrounding layout to shift.`,
            codeContext: extractCodeContext(f.content, lineNum),
            fixCode: {
              before: `@font-face {\n  font-family: '${familyName}';\n  src: ...;\n}`,
              after: `@font-face {\n  font-family: '${familyName}';\n  src: ...;\n  font-display: swap;\n  size-adjust: 100%;\n}`,
              description: 'Specify font-display: swap to render fallback font immediately and size-adjust to match typography metrics.'
            },
            howToVerify: generateVerificationGuidance('cls', { type: 'font-display' })
          });
        }
      }

      // 4. Scan CSS files for non-composited animations
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
            },
            howToVerify: generateVerificationGuidance('cls', { type: 'composited-animation' })
          });
        }
      });
    }

    // 5. Scan JS/TS files for IntersectionObserver content injection without reserved container height
    if (['.js', '.jsx', '.ts', '.tsx'].includes(f.ext)) {
      const ioRegex = /new\s+IntersectionObserver\s*\(\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z_$][a-zA-Z0-9_$]*)\s*=>\s*\{([\s\S]{1,500}?)\}/g;
      let ioMatch;
      while ((ioMatch = ioRegex.exec(f.content || '')) !== null) {
        const body = ioMatch[1];
        const injectsContent = /innerHTML|appendChild|insertAdjacentHTML|setLoaded|setVisible|setIsIntersecting/i.test(body);
        if (injectsContent) {
          const startIdx = Math.max(0, ioMatch.index - 300);
          const endIdx = Math.min(f.content.length, ioMatch.index + ioMatch[0].length + 300);
          const surrounding = f.content.substring(startIdx, endIdx);
          const hasHeightReservation = /min-height|minHeight|aspect-ratio|aspectRatio|height:\s*['"]?[0-9]+/i.test(surrounding);

          if (!hasHeightReservation) {
            const { line } = getLineAndColumn(f.content, ioMatch.index);
            const lineNum = line || 1;

            recommendations.push({
              type: 'code',
              file: f.relativePath,
              line: lineNum,
              cwv: 'cls',
              severity: 'medium',
              message: 'Intersection Observer lazy-loads content into container without reserved height.',
              impact: 'Injecting DOM elements or images upon intersection suddenly changes container height, displacing elements below the fold.',
              suggestion: 'Set a CSS min-height or aspect-ratio on the intersection target container before observing.',
              whyExplanation: `At line ${lineNum}, an IntersectionObserver injects content or toggles visibility when elements scroll into view. Because no container height (min-height or aspect-ratio) is reserved beforehand, the DOM node expands from 0px to full height, shifting all succeeding content downward.`,
              codeContext: extractCodeContext(f.content, lineNum),
              fixCode: {
                before: `container.innerHTML = '<img src="..." />';`,
                after: `// Reserve space in CSS or inline style first:\ncontainer.style.minHeight = '320px';\ncontainer.innerHTML = '<img src="..." />';`,
                description: 'Reserve container min-height or aspect-ratio so content insertion does not reflow layout.'
              },
              howToVerify: generateVerificationGuidance('cls', { type: 'intersection-observer' })
            });
          }
        }
      }
    }
  });

  return recommendations;
}
