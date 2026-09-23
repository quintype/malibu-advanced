import fs from 'fs';
import path from 'path';

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
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = {
      ...(pkg.dependencies || {}),
      ...(pkg.devDependencies || {})
    };

    for (const [dep, version] of Object.entries(dependencies)) {
      if (HEAVY_PACKAGES[dep]) {
        const recommendation = HEAVY_PACKAGES[dep];
        issues.push({
          type: 'dependency',
          name: dep,
          version,
          severity: 'medium',
          cwv: recommendation.cwv,
          file: 'package.json',
          line: '-',
          message: `Heavy dependency "${dep}" detected (version: ${version}).`,
          impact: recommendation.impact,
          suggestion: `Replace "${dep}" with "${recommendation.alt}".`
        });
      }
    }
  } catch (err) {
    // Ignore invalid JSON errors
  }

  return issues;
}
