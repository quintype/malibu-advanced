import { getLineAndColumn } from './correlation.js';
import { extractCodeContext } from '../utils/codeContext.js';

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
        suggestion: 'Combine related contexts, use Zustand or Redux Toolkit, or split contexts so components only subscribe to the slices they need.',
        whyExplanation: `Found ${providers} nested React Context Providers in ${file.relativePath}. When any top-level context value changes without memoization, every consuming component in the tree is forced to re-render, blocking the main thread during interactions.`,
        codeContext: extractCodeContext(file.content, 1),
        fixCode: {
          before: `<ProviderA>\n  <ProviderB>\n    <ProviderC>\n      {children}\n    </ProviderC>\n  </ProviderB>\n</ProviderA>`,
          after: `// Split state by frequency of change, or combine contexts using a single combined provider:\nconst AppContext = React.createContext();\n// Or use fine-grained state slices (e.g. Zustand) to avoid cascading renders.`,
          description: 'Combine related context providers or migrate frequently changing state slices to fine-grained state stores.'
        }
      });
    }

    // Check for heavy inline handlers inside rendering loops (exclude small card/molecule components)
    const isCardOrMolecule = file.relativePath.toLowerCase().includes('card') || file.relativePath.toLowerCase().includes('molecule') || file.relativePath.toLowerCase().includes('atom');
    if (!isCardOrMolecule && content.includes('.map(') && (content.includes('() =>') || content.includes('.bind(this)')) && (content.includes('onClick=') || content.includes('onChange='))) {
      const mapIdx = content.indexOf('.map(');
      const { line } = getLineAndColumn(content, mapIdx >= 0 ? mapIdx : 0);
      const lineNum = line || 1;

      recommendations.push({
        type: 'code',
        file: file.relativePath,
        line: lineNum,
        cwv: 'inp',
        severity: 'low',
        message: 'Inline arrow functions or bindings inside .map rendering loop.',
        impact: 'Generates new function instances on every render pass, which triggers unnecessary updates in memoized child components.',
        suggestion: 'Move the handler outside the loop, use event delegation, or memoize individual child components.',
        whyExplanation: `At line ${lineNum}, an inline arrow function or .bind(this) creates a brand-new function instance on every render cycle. This breaks React.memo() equality checks and forces child components to re-render whenever the parent updates.`,
        codeContext: extractCodeContext(file.content, lineNum),
        fixCode: {
          before: `{items.map(item => (\n  <button onClick={() => handleClick(item.id)}>{item.title}</button>\n))}`,
          after: `const handleItemClick = useCallback((id) => handleClick(id), [handleClick]);\n// Or pass item id to a memoized Item component:\n{items.map(item => (\n  <Item key={item.id} item={item} onSelect={handleItemClick} />\n))}`,
          description: 'Extract handlers outside the map loop with useCallback or delegate clicks to avoid re-allocating handlers.'
        }
      });
    }
  }

  return recommendations;
}
