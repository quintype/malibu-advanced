import { extractCodeContext } from '../utils/codeContext.js';

/**
 * Analyzes file splitting, imports, and bundling opportunities.
 * 
 * @param {Array<object>} files Scanned workspace files.
 * @param {Array<object>} reactAsts Pre-parsed React AST objects.
 * @returns {Array<object>} Bundle optimization recommendations
 */
export function analyzeBundle(files, reactAsts) {
  const recommendations = [];

  for (const { file, ast } of reactAsts) {
    if (!ast.astSuccess) continue;

    // Check for heavy component imports without lazy loading
    const isPageRoute = file.relativePath.toLowerCase().includes('page') || file.relativePath.toLowerCase().includes('route');
    const hasManyImports = ast.imports.length > 8;

    if (isPageRoute && hasManyImports && !ast.lazyUsage && !file.content.includes('dynamic(')) {
      recommendations.push({
        type: 'code',
        file: file.relativePath,
        line: 1,
        cwv: 'lcp',
        severity: 'medium',
        message: 'Page component imports multiple resources synchronously without code-splitting.',
        impact: 'Loading all components eagerly on the first visit bloats the critical JS bundle size, slowing down initial paint and LCP.',
        suggestion: 'Use React.lazy() / Suspense (Vite/CRA) or next/dynamic (Next.js) to split less critical components (like Modals or Tabs).',
        whyExplanation: `This page route imports ${ast.imports.length} components synchronously at the top of the file without code splitting. Everything is bundled into the critical path JavaScript bundle, delaying client hydration and LCP.`,
        codeContext: extractCodeContext(file.content, 1),
        fixCode: {
          before: `import HeavyModal from './components/HeavyModal';\nimport SecondaryTabs from './components/SecondaryTabs';`,
          after: `const HeavyModal = React.lazy(() => import('./components/HeavyModal'));\nconst SecondaryTabs = React.lazy(() => import('./components/SecondaryTabs'));`,
          description: 'Split heavy components into dynamic async chunks using React.lazy or next/dynamic.'
        }
      });
    }

    // Check for import star on heavy libraries (e.g., import * as lodash from 'lodash')
    ast.imports.forEach(imp => {
      const isImportStar = imp.specifiers.some(s => s.type === 'ImportNamespaceSpecifier');
      const isHeavyLib = imp.source === 'lodash' || imp.source === 'ramda' || imp.source === 'three';
      if (isImportStar && isHeavyLib) {
        const lineNum = imp.loc?.start?.line || 1;
        const localName = imp.specifiers.find(s => s.type === 'ImportNamespaceSpecifier')?.local || imp.source;

        recommendations.push({
          type: 'code',
          file: file.relativePath,
          line: lineNum,
          cwv: 'lcp',
          severity: 'high',
          message: `Namespace import ("import * as ...") used on a heavy library ("${imp.source}").`,
          impact: 'Prevents tree-shaking tools from removing unused exports, adding the entire library to the production bundle.',
          suggestion: `Import only the specific functions you need: e.g. import { debounce } from 'lodash'; or use ES modules ('lodash-es').`,
          whyExplanation: `Wildcard import "import * as ${localName} from '${imp.source}'" at line ${lineNum} disables tree-shaking in Webpack/Vite. The entire ${imp.source} library is compiled into the client bundle even if only a single helper is used.`,
          codeContext: extractCodeContext(file.content, lineNum),
          fixCode: {
            before: `import * as ${localName} from '${imp.source}';`,
            after: `import { debounce } from '${imp.source}'; // or '${imp.source}-es'`,
            description: 'Use targeted named imports or tree-shakeable ES module equivalents.'
          }
        });
      }
    });
  }

  return recommendations;
}
