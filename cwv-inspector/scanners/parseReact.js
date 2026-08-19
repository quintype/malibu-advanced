import * as parser from '@babel/parser';
// Use standard imports for traverse
import _traverse from '@babel/traverse';
const traverse = _traverse.default || _traverse;

/**
 * Parses source code into AST and runs traversals to identify potential react issues.
 * 
 * @param {string} content Source code of the file.
 * @param {string} filePath Absolute path of the file.
 * @returns {object} Extracted AST analysis patterns.
 */
export function parseReactCode(content, filePath) {
  const result = {
    imports: [],
    jsxTags: [],
    useEffects: [],
    contextProviders: [],
    memoUsage: false,
    lazyUsage: false,
    astSuccess: false,
    errors: []
  };

  try {
    const ast = parser.parse(content, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'objectRestSpread'
      ]
    });

    result.astSuccess = true;

    traverse(ast, {
      ImportDeclaration(pathNode) {
        const source = pathNode.node.source.value;
        const specifiers = pathNode.node.specifiers.map(spec => {
          return {
            type: spec.type,
            local: spec.local.name,
            imported: spec.imported ? spec.imported.name : null
          };
        });
        result.imports.push({ source, specifiers, loc: pathNode.node.loc });

        // Detect React.lazy or Suspense imports
        if (source === 'react') {
          specifiers.forEach(spec => {
            if (spec.imported === 'lazy' || spec.local === 'lazy') {
              result.lazyUsage = true;
            }
          });
        }
      },
      JSXOpeningElement(pathNode) {
        const nameNode = pathNode.node.name;
        let tagName = '';
        if (nameNode.type === 'JSXIdentifier') {
          tagName = nameNode.name;
        } else if (nameNode.type === 'JSXMemberExpression') {
          tagName = `${nameNode.object.name}.${nameNode.property.name}`;
        }

        const attributes = pathNode.node.attributes
          .filter(attr => attr.type === 'JSXAttribute')
          .map(attr => {
            return {
              name: attr.name.name,
              value: attr.value ? (attr.value.value || attr.value.type) : true,
              loc: attr.loc
            };
          });

        const idAttr = attributes.find(a => a.name === 'id');
        const classAttr = attributes.find(a => a.name === 'className' || a.name === 'class');
        const srcAttr = attributes.find(a => a.name === 'src');
        const hrefAttr = attributes.find(a => a.name === 'href');

        result.jsxTags.push({
          tagName,
          attributes,
          loc: pathNode.node.loc,
          line: pathNode.node.loc?.start?.line,
          column: pathNode.node.loc?.start?.column,
          filePath,
          id: idAttr && typeof idAttr.value === 'string' ? idAttr.value : null,
          className: classAttr && typeof classAttr.value === 'string' ? classAttr.value : null,
          src: srcAttr && typeof srcAttr.value === 'string' ? srcAttr.value : null,
          href: hrefAttr && typeof hrefAttr.value === 'string' ? hrefAttr.value : null
        });
      },
      CallExpression(pathNode) {
        const callee = pathNode.node.callee;
        let name = '';
        if (callee.type === 'Identifier') {
          name = callee.name;
        } else if (callee.type === 'MemberExpression') {
          name = callee.property.name;
        }

        if (name === 'useEffect') {
          result.useEffects.push({
            loc: pathNode.node.loc,
            argumentsCount: pathNode.node.arguments.length
          });
        }

        if (name === 'memo' || name === 'useMemo') {
          result.memoUsage = true;
        }
      }
    });

  } catch (err) {
    result.errors.push(err.message);
    // Graceful fallback: basic regex matching for tags and imports
    fallbackRegexParse(content, result);
  }

  return result;
}

/**
 * Fallback parser using regex if AST parsing fails.
 */
function fallbackRegexParse(content, result) {
  // Try to find image tags
  const imgRegex = /<img\s+([^>]*)\/?>/gi;
  let match;
  while ((match = imgRegex.exec(content)) !== null) {
    const attrString = match[1];
    const attributes = [];
    
    const widthMatch = attrString.match(/width=["']?([^"'\s>]+)["']?/i);
    const heightMatch = attrString.match(/height=["']?([^"'\s>]+)["']?/i);
    const loadingMatch = attrString.match(/loading=["']?([^"'\s>]+)["']?/i);
    const altMatch = attrString.match(/alt=["']?([^"'\s>]*)["']?/i);

    if (widthMatch) attributes.push({ name: 'width', value: widthMatch[1] });
    if (heightMatch) attributes.push({ name: 'height', value: heightMatch[1] });
    if (loadingMatch) attributes.push({ name: 'loading', value: loadingMatch[1] });
    if (altMatch) attributes.push({ name: 'alt', value: altMatch[1] });

    result.jsxTags.push({
      tagName: 'img',
      attributes,
      loc: { start: { line: getLineNumber(content, match.index) } }
    });
  }

  // Check lazy usage
  if (content.includes('lazy(') || content.includes('React.lazy(')) {
    result.lazyUsage = true;
  }
  if (content.includes('memo(') || content.includes('React.memo(')) {
    result.memoUsage = true;
  }
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}
