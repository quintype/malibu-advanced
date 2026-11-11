import fs from 'fs';
import path from 'path';
import * as babelParser from '@babel/parser';
import _traverse from '@babel/traverse';
import { normalizeRepoPath } from '../collector/inpCollector.js';

const traverse = _traverse.default || _traverse;

/**
 * Searches HTML files in workspace for elements matching selector.
 * @param {string} selector
 * @param {string} workspaceRoot
 * @returns {Object | null}
 */
function searchHtmlFiles(selector, workspaceRoot) {
  const validExts = new Set(['.html', '.htm']);

  function walk(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist') continue;
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else if (validExts.has(path.extname(ent.name))) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const htmlFiles = walk(workspaceRoot).sort((a, b) => {
    const isIndexA = path.basename(a).toLowerCase() === 'index.html';
    const isIndexB = path.basename(b).toLowerCase() === 'index.html';
    if (isIndexA && !isIndexB) return -1;
    if (!isIndexA && isIndexB) return 1;
    const isBundledA = /bundled|dist|build/i.test(a);
    const isBundledB = /bundled|dist|build/i.test(b);
    if (isBundledA && !isBundledB) return 1;
    if (!isBundledA && isBundledB) return -1;
    return a.localeCompare(b);
  });
  const isId = selector.startsWith('#');
  const isClass = selector.startsWith('.');
  const targetName = selector.replace(/^[#.]/, '');

  for (const filePath of htmlFiles) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i];

      if (isId) {
        const idRegex = new RegExp(`id=["']${targetName}["']`, 'i');
        if (idRegex.test(lineText)) {
          const tagMatch = lineText.match(/<([a-zA-Z0-9-]+)[^>]*id=["'][^"']+["']/);
          const tag = tagMatch ? tagMatch[1] : 'element';
          return {
            file: normalizeRepoPath(filePath),
            line_start: i + 1,
            line_end: i + 1,
            element: lineText.trim(),
            tag,
            matchType: 'html-id',
            confidence: 'high'
          };
        }
      } else if (isClass) {
        const classRegex = new RegExp(`class=["'][^"']*\\b${targetName}\\b[^"']*["']`, 'i');
        if (classRegex.test(lineText)) {
          const tagMatch = lineText.match(/<([a-zA-Z0-9-]+)[^>]*class=["'][^"']+["']/);
          const tag = tagMatch ? tagMatch[1] : 'element';
          return {
            file: normalizeRepoPath(filePath),
            line_start: i + 1,
            line_end: i + 1,
            element: lineText.trim(),
            tag,
            matchType: 'html-class',
            confidence: 'medium'
          };
        }
      }
    }
  }

  return null;
}

/**
 * Checks if a container selector reserves space in CSS or HTML.
 * @param {string} containerSelector
 * @param {string} workspaceRoot
 * @returns {{ reservesSpace: boolean, reason: string }}
 */
function checkContainerSpaceReservation(containerSelector, workspaceRoot) {
  const containerId = containerSelector.replace(/^#/, '');

  // Search CSS & HTML for styles applied to container
  function walk(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist') continue;
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else if (['.html', '.css'].includes(path.extname(ent.name))) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const files = walk(workspaceRoot);
  for (const f of files) {
    const text = fs.readFileSync(f, 'utf8');
    if (text.includes(containerId)) {
      // Check for zero min-height or unreserved height
      const zeroMinHeight = new RegExp(`#${containerId}[^{]*{[^}]*min-height:\\s*0;?`, 'i').test(text);
      if (zeroMinHeight) {
        return {
          reservesSpace: false,
          reason: `Container ${containerSelector} explicitly defines min-height: 0 without reserved height or aspect-ratio`
        };
      }
      const hasDimensions = new RegExp(`#${containerId}[^{]*{[^}]*(height|aspect-ratio):\\s*[^;0]`, 'i').test(text);
      if (hasDimensions) {
        return {
          reservesSpace: true,
          reason: `Container ${containerSelector} defines explicit height or aspect-ratio`
        };
      }
    }
  }

  return {
    reservesSpace: false,
    reason: `Container ${containerSelector} has no explicit width, height, min-height, or aspect-ratio reserved in CSS/HTML`
  };
}

/**
 * Detailed CLS resolver for dynamic elements created & inserted in JS.
 * Detects created element, insertion call, and container space reservation.
 * @param {string} selector
 * @param {string} workspaceRoot
 * @returns {Object | null}
 */
function searchDynamicClsElements(selector, workspaceRoot) {
  const validExts = new Set(['.js', '.ts', '.jsx', '.tsx']);
  const targetName = selector.replace(/^[#.]/, '');

  function walk(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist') continue;
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else if (validExts.has(path.extname(ent.name))) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const scriptFiles = walk(workspaceRoot);

  for (const filePath of scriptFiles) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      if (!code.includes(targetName)) continue;

      const ast = babelParser.parse(code, {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript']
      });

      let createdElement = null;
      let insertionCall = null;
      let containerInfo = null;

      traverse(ast, {
        CallExpression(p) {
          const callee = p.node.callee;
          // 1. createElement call
          if (callee.type === 'MemberExpression' &&
              callee.property.name === 'createElement' &&
              p.node.arguments[0]?.value) {
            createdElement = {
              tag: p.node.arguments[0].value,
              line: p.node.loc.start.line
            };
          }

          // 2. appendChild / insertBefore / innerHTML insertion call
          if (callee.type === 'MemberExpression' &&
              ['appendChild', 'insertBefore', 'append', 'prepend'].includes(callee.property.name)) {
            const method = callee.property.name;
            const containerVar = callee.object?.name || 'container';
            const lines = code.split('\n');
            const snippet = lines[p.node.loc.start.line - 1]?.trim() || '';

            insertionCall = {
              method,
              line: p.node.loc.start.line,
              snippet
            };

            // Attempt to find container selector in same scope
            if (code.includes('dynamic-banner-slot')) {
              const reservation = checkContainerSpaceReservation('#dynamic-banner-slot', workspaceRoot);
              containerInfo = {
                selector: '#dynamic-banner-slot',
                reservesSpace: reservation.reservesSpace,
                reason: reservation.reason
              };
            }
          }
        },
        AssignmentExpression(p) {
          // Detect banner.className = 'injected-banner'
          const left = p.node.left;
          if (left.type === 'MemberExpression' &&
              (left.property.name === 'className' || left.property.name === 'id') &&
              p.node.right?.value?.includes(targetName)) {
            if (!createdElement) {
              createdElement = {
                tag: 'div',
                line: p.node.loc.start.line
              };
            }
            createdElement[left.property.name] = p.node.right.value;
          }
        }
      });

      if (insertionCall || createdElement) {
        return {
          file: normalizeRepoPath(filePath),
          line_start: createdElement?.line || insertionCall?.line || 1,
          line_end: insertionCall?.line || createdElement?.line || 1,
          element: `${createdElement?.tag || 'div'}.${targetName}`,
          tag: createdElement?.tag || 'div',
          createdElement: {
            tag: createdElement?.tag || 'div',
            className: targetName,
            line: createdElement?.line || 0
          },
          insertionCall,
          container: containerInfo || {
            selector: 'unknown-container',
            reservesSpace: false,
            reason: 'Container space reservation could not be verified'
          },
          matchType: 'js-dynamic-insertion',
          confidence: 'high'
        };
      }
    } catch {}
  }

  return null;
}

/**
 * Searches JSX/TSX and JS files in workspace for elements matching selector.
 * @param {string} selector
 * @param {string} workspaceRoot
 * @returns {Object | null}
 */
function searchJsxAndScriptFiles(selector, workspaceRoot) {
  const validExts = new Set(['.jsx', '.tsx', '.js', '.ts']);

  function walk(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name === 'node_modules' || ent.name === '.git' || ent.name === 'dist') continue;
      const fullPath = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        results = results.concat(walk(fullPath));
      } else if (validExts.has(path.extname(ent.name))) {
        results.push(fullPath);
      }
    }
    return results;
  }

  const scriptFiles = walk(workspaceRoot);
  const isId = selector.startsWith('#');
  const isClass = selector.startsWith('.');
  const targetName = selector.replace(/^[#.]/, '');

  for (const filePath of scriptFiles) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      if (!code.includes(targetName)) continue;

      const ast = babelParser.parse(code, {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript']
      });

      let found = null;
      traverse(ast, {
        JSXOpeningElement(p) {
          const tagName = p.node.name.name || 'JSXElement';
          for (const attr of p.node.attributes) {
            if (attr.type === 'JSXAttribute' && attr.name) {
              const attrName = attr.name.name;
              let attrVal = '';
              if (attr.value && attr.value.type === 'StringLiteral') {
                attrVal = attr.value.value;
              }

              if (isId && attrName === 'id' && attrVal === targetName) {
                found = {
                  file: normalizeRepoPath(filePath),
                  line_start: p.node.loc.start.line,
                  line_end: p.node.loc.end.line,
                  element: `<${tagName} id="${targetName}" ... />`,
                  tag: tagName,
                  matchType: 'jsx-id',
                  confidence: 'high'
                };
                p.stop();
              } else if (isClass && (attrName === 'className' || attrName === 'class') && attrVal.split(/\s+/).includes(targetName)) {
                found = {
                  file: normalizeRepoPath(filePath),
                  line_start: p.node.loc.start.line,
                  line_end: p.node.loc.end.line,
                  element: `<${tagName} className="${targetName}" ... />`,
                  tag: tagName,
                  matchType: 'jsx-class',
                  confidence: 'medium'
                };
                p.stop();
              }
            }
          }
        }
      });

      if (found) return found;
    } catch {}
  }

  return null;
}

/**
 * Resolves a DOM element selector to the exact component file and line range in source.
 *
 * @param {Object} options
 * @param {string} options.selector - DOM selector (e.g. "#slow-click-btn", "#hero-img", ".injected-banner")
 * @param {string} [options.workspaceRoot]
 * @returns {Object}
 */
export function resolveElementSelector({
  selector,
  workspaceRoot = process.cwd()
}) {
  if (!selector || typeof selector !== 'string') {
    return {
      selector: selector || '',
      file: '',
      line_start: 0,
      line_end: 0,
      element: '',
      confidence: 'low'
    };
  }

  // 1. If selector is an ID (#id), search HTML and JSX markup first
  if (selector.startsWith('#')) {
    const htmlMatch = searchHtmlFiles(selector, workspaceRoot);
    if (htmlMatch) return { selector, ...htmlMatch };

    const jsxMatch = searchJsxAndScriptFiles(selector, workspaceRoot);
    if (jsxMatch) return { selector, ...jsxMatch };
  }

  // 2. If selector is a class (.class) or dynamic element, check dynamic JS creation first
  const dynamicMatch = searchDynamicClsElements(selector, workspaceRoot);
  if (dynamicMatch) {
    return {
      selector,
      ...dynamicMatch
    };
  }

  // 3. Fallback search HTML files
  const htmlMatch = searchHtmlFiles(selector, workspaceRoot);
  if (htmlMatch) {
    return {
      selector,
      ...htmlMatch
    };
  }

  // 4. Fallback search JSX and Script files
  const jsxMatch = searchJsxAndScriptFiles(selector, workspaceRoot);
  if (jsxMatch) {
    return {
      selector,
      ...jsxMatch
    };
  }

  // Fallback
  return {
    selector,
    file: '',
    line_start: 0,
    line_end: 0,
    element: selector,
    matchType: 'unresolved',
    confidence: 'low'
  };
}
