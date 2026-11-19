import fs from 'fs';
import path from 'path';
import { extractCodeContext } from '../utils/codeContext.js';

// List of heavy packages and recommended lightweight alternatives
const HEAVY_PACKAGES = {
  'moment': { alt: 'date-fns, dayjs, or luxon', cwv: 'inp', impact: 'Reduces JS bundle size, avoiding long parse/execution times.' },
  'lodash': { alt: 'lodash-es, or direct native JS methods', cwv: 'inp', impact: 'Allows tree-shaking to eliminate unused helpers.' },
  'ramda': { alt: 'native JS methods or light alternatives', cwv: 'inp', impact: 'Substantially reduces bundle size if not tree-shaken.' },
  'jquery': { alt: 'native vanilla JS API', cwv: 'inp', impact: 'Eliminates unnecessary DOM manipulation library overhead.' },
  'classnames': { alt: 'clsx', cwv: 'inp', impact: 'Saves bundle bytes.' },
  '@material-ui/core': { alt: 'modern import path / modular imports', cwv: 'lcp', impact: 'MUI v4 core can cause huge bundle bloat if imports are not optimized.' }
};

/**
 * Scans package.json file for heavy dependencies.
 * 
 * @param {string} projectPath Absolute path of project
 * @returns {Array<object>} Flagged dependencies issues
 */
export function scanDependencies(projectPath) {
  const packageJsonPath = path.join(projectPath, 'package.json');
  const issues = [];

  if (!fs.existsSync(packageJsonPath)) {
    return issues;
  }

  try {
    const rawContent = fs.readFileSync(packageJsonPath, 'utf8');
    const pkgLines = rawContent.split('\n');
    const pkg = JSON.parse(rawContent);
    const dependencies = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {})
    };

    for (const [dep, version] of Object.entries(dependencies)) {
      if (HEAVY_PACKAGES[dep]) {
        const recommendation = HEAVY_PACKAGES[dep];
        let lineNum = 1;
        const foundIdx = pkgLines.findIndex(l => l.includes(`"${dep}"`));
        if (foundIdx >= 0) lineNum = foundIdx + 1;

        issues.push({
          type: 'dependency',
          name: dep,
          version,
          severity: 'medium',
          cwv: recommendation.cwv,
          file: 'package.json',
          line: lineNum,
          message: `Heavy dependency "${dep}" detected (version: ${version}).`,
          impact: recommendation.impact,
          suggestion: `Replace "${dep}" with "${recommendation.alt}".`,
          whyExplanation: `Dependency "${dep}" (${version}) adds considerable JavaScript parsing and execution weight on the main thread. Synchronously evaluating large library bundles inflates interaction latency (INP) and Total Blocking Time (TBT).`,
          codeContext: extractCodeContext(rawContent, lineNum),
          fixCode: {
            before: `"${dep}": "${version}"`,
            after: `// Replace with tree-shakeable modern alternative:\n// e.g. "${recommendation.alt.split(',')[0].trim()}"`,
            description: `Replace "${dep}" with "${recommendation.alt}" for a lightweight, tree-shakeable alternative.`
          }
        });
      }
    }
  } catch (err) {
    // Ignore invalid JSON errors
  }

  return issues;
}
