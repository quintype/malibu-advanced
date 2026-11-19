/**
 * Validation and Verification Framework for CWV Inspector.
 * Provides validation helpers to verify image dimensions, handler deferral,
 * layout thrashing patterns, and automated verification guidance for developers.
 */

/**
 * Validates image element sizing against Core Web Vitals CLS requirements.
 * 
 * @param {object} tag JSX or HTML image tag attributes.
 * @param {Array<object>} [cssRules=[]] Relevant CSS rules matching the selector/class.
 * @returns {{ isValid: boolean, missingBoth: boolean, isRelativeWithoutRatio: boolean, issues: string[] }}
 */
export function validateImageSizing(tag = {}, cssRules = []) {
  const attrs = Array.isArray(tag.attributes) ? tag.attributes : [];
  const widthAttr = attrs.find(a => a.name === 'width');
  const heightAttr = attrs.find(a => a.name === 'height');
  const styleAttr = attrs.find(a => a.name === 'style');

  const widthVal = widthAttr ? String(widthAttr.value) : '';
  const heightVal = heightAttr ? String(heightAttr.value) : '';
  const styleVal = styleAttr ? String(styleAttr.value) : '';

  const hasExplicitWidth = Boolean(widthVal) && !widthVal.includes('%');
  const hasExplicitHeight = Boolean(heightVal) && !heightVal.includes('%');
  const isPercentWidth = widthVal.includes('%');
  const hasStyle = Boolean(styleVal);

  const hasCssAspectRatio = cssRules.some(r =>
    (r.properties || '').includes('aspect-ratio') ||
    (r.content || '').includes('aspect-ratio')
  ) || styleVal.includes('aspect-ratio') || styleVal.includes('aspectRatio');

  const issues = [];
  const missingBoth = !widthAttr && !heightAttr && !hasStyle && !hasCssAspectRatio;
  const isRelativeWithoutRatio = isPercentWidth && !hasExplicitHeight && !hasCssAspectRatio;

  if (missingBoth) {
    issues.push('Missing explicit width, height, and CSS aspect-ratio');
  }
  if (isRelativeWithoutRatio) {
    issues.push('Percentage width without aspect-ratio or explicit height');
  }

  return {
    isValid: issues.length === 0,
    missingBoth,
    isRelativeWithoutRatio,
    hasCssAspectRatio,
    issues
  };
}

/**
 * Validates whether an event handler properly defers expensive operations or state updates.
 * 
 * @param {string} handlerCode Source code of the handler.
 * @returns {{ isDeferred: boolean, usesTransition: boolean, usesIdleCallback: boolean, usesRaf: boolean }}
 */
export function validateHandlerDeferral(handlerCode = '') {
  if (!handlerCode) {
    return { isDeferred: false, usesTransition: false, usesIdleCallback: false, usesRaf: false };
  }

  const usesTransition = handlerCode.includes('startTransition') || handlerCode.includes('useTransition');
  const usesIdleCallback = handlerCode.includes('requestIdleCallback');
  const usesRaf = handlerCode.includes('requestAnimationFrame');
  const usesTimeout = /setTimeout\s*\(\s*[^,]+,\s*[0-9]+\)/.test(handlerCode);

  const isDeferred = usesTransition || usesIdleCallback || usesRaf || usesTimeout;

  return {
    isDeferred,
    usesTransition,
    usesIdleCallback,
    usesRaf
  };
}

/**
 * Generates testable verification instructions and expected outcome for a given issue.
 * 
 * @param {string} cwv Core Web Vital ('inp', 'cls', 'lcp').
 * @param {object} issue Finding details.
 * @returns {{ method: string, command: string, expectedChange: string }}
 */
export function generateVerificationGuidance(cwv, issue = {}) {
  const metric = String(cwv || '').toLowerCase();

  if (metric === 'inp') {
    return {
      method: 'Chrome DevTools Performance Panel / Lighthouse Timespan',
      command: `npm run audit -- --url <url> --verify`,
      expectedChange: 'Interaction latency should stay ≤ 200 ms with input delay ≤ 50 ms and zero long-task blocks on the main thread.'
    };
  }

  if (metric === 'cls') {
    return {
      method: 'Lighthouse Performance Audit / DevTools Rendering Panel (Layout Shift Regions)',
      command: `npm run audit -- --url <url>`,
      expectedChange: 'Cumulative Layout Shift should reduce to ≤ 0.10, reserving container geometry before asset load.'
    };
  }

  return {
    method: 'Lighthouse Lab Navigation Audit / DevTools Network Panel',
    command: `npm run audit -- --url <url>`,
    expectedChange: 'Largest Contentful Paint should render in ≤ 2.5 s with hero resource requested early in network waterfall.'
  };
}
