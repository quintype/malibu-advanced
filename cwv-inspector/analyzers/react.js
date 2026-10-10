/**
 * React performance checks (renders, context, hooks).
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @param {Array<object>} reactAsts Pre-parsed React AST objects.
 * @returns {Array<object>} React optimization recommendations
 */
export function analyzeReact(files, reactAsts) {
  const recommendations = [];

  for (const { file, ast } of reactAsts) {
    if (!ast.astSuccess) continue;

    const content = file.content;

    // Check for nested Context Providers (often leads to excessive renders)
    const providers = (content.match(/<[A-Za-z0-9_]+\.Provider/g) || []).length;
    if (providers > 3) {
      recommendations.push({
        type: 'code',
        file: file.relativePath,
        line: 1,
        cwv: 'inp',
        severity: 'medium',
        message: `${providers} nested Context Providers detected.`,
        impact: 'Deeply nested React Contexts can trigger cascade renders across large portions of the component tree, impacting input latency.',
        suggestion: 'Combine related contexts, use Zustand or Redux Toolkit, or split contexts so components only subscribe to the slices they need.'
      });
    }

    // Check for heavy inline handlers inside rendering loops
    if (content.includes('.map(') && (content.includes('() =>') || content.includes('.bind(this)')) && (content.includes('onClick=') || content.includes('onChange='))) {
      recommendations.push({
        type: 'code',
        file: file.relativePath,
        line: 1,
        cwv: 'inp',
        severity: 'low',
        message: 'Inline arrow functions or bindings inside .map rendering loop.',
        impact: 'Generates new function instances on every render pass, which triggers unnecessary updates in memoized child components.',
        suggestion: 'Move the handler outside the loop, use event delegation, or memoize individual child components.'
      });
    }
  }

  return recommendations;
}
