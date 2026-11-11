import fs from 'fs';
import path from 'path';
import sourceMap from 'source-map-js';
import * as babelParser from '@babel/parser';
import _traverse from '@babel/traverse';
import { normalizeRepoPath } from '../collector/index.js';

const traverse = _traverse.default || _traverse;

/**
 * Parses inline base64 source map or fetches external source map.
 * @param {string} scriptContent
 * @param {string} scriptUrl
 * @returns {Object | null} Raw SourceMap JSON or null
 */
export async function extractSourceMap(scriptContent, scriptUrl) {
  if (!scriptContent) return null;

  // 1. Check for inline base64 source map
  const inlineMatch = scriptContent.match(/\/\/[#@]\s*sourceMappingURL=data:application\/json;base64,([A-Za-z0-9+/=]+)/);
  if (inlineMatch && inlineMatch[1]) {
    try {
      const decoded = Buffer.from(inlineMatch[1], 'base64').toString('utf8');
      return JSON.parse(decoded);
    } catch {
      // invalid inline map
    }
  }

  // 2. Check for external source map comment
  const externalMatch = scriptContent.match(/\/\/[#@]\s*sourceMappingURL=([^\s]+)/);
  let mapUrl = null;
  if (externalMatch && externalMatch[1]) {
    const rawRef = externalMatch[1].trim();
    if (!rawRef.startsWith('data:')) {
      if (rawRef.startsWith('http://') || rawRef.startsWith('https://')) {
        mapUrl = rawRef;
      } else if (scriptUrl) {
        // Resolve relative URL
        try {
          const u = new URL(rawRef, scriptUrl);
          mapUrl = u.toString();
        } catch {
          mapUrl = `${scriptUrl}.map`;
        }
      }
    }
  } else if (scriptUrl) {
    mapUrl = `${scriptUrl}.map`;
  }

  if (mapUrl) {
    // If local file path
    if (mapUrl.startsWith('/') || mapUrl.startsWith('file://')) {
      const localPath = mapUrl.replace(/^file:\/\//, '');
      if (fs.existsSync(localPath)) {
        try {
          return JSON.parse(fs.readFileSync(localPath, 'utf8'));
        } catch {}
      }
    }

    // Try fetching via HTTP
    try {
      const res = await fetch(mapUrl);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Network fetch failure
    }
  }

  return null;
}

/**
 * Scans workspace files for a function declaration matching functionName using AST.
 * @param {string} functionName
 * @param {string} workspaceRoot
 * @returns {{ file: string, line: number, column: number } | null}
 */
export function findFunctionInWorkspace(functionName, workspaceRoot) {
  if (!functionName || !workspaceRoot || !fs.existsSync(workspaceRoot)) return null;

  const validExts = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs']);

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

  const files = walk(workspaceRoot);

  for (const filePath of files) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      if (!code.includes(functionName)) continue;

      const ast = babelParser.parse(code, {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript']
      });

      let found = null;
      traverse(ast, {
        FunctionDeclaration(p) {
          if (p.node.id && p.node.id.name === functionName) {
            found = {
              file: filePath,
              line: p.node.loc.start.line,
              column: p.node.loc.start.column + 1
            };
            p.stop();
          }
        },
        VariableDeclarator(p) {
          if (p.node.id && p.node.id.name === functionName) {
            found = {
              file: filePath,
              line: p.node.loc.start.line,
              column: p.node.loc.start.column + 1
            };
            p.stop();
          }
        },
        ClassMethod(p) {
          if (p.node.key && p.node.key.name === functionName) {
            found = {
              file: filePath,
              line: p.node.loc.start.line,
              column: p.node.loc.start.column + 1
            };
            p.stop();
          }
        }
      });

      if (found) return found;
    } catch {
      // Ignore parse errors on unsupported files
    }
  }

  return null;
}

/**
 * Resolves bundled or unbundled script locations back to original source files.
 * Uses 1-based line and 0-based column when calling source-map-js.
 *
 * @param {Object} options
 * @param {string} options.sourceURL
 * @param {number} options.line - 1-based line number
 * @param {number} options.column - 1-based column number
 * @param {string} [options.functionName]
 * @param {string} [options.scriptContent]
 * @param {string} [options.workspaceRoot]
 * @returns {Promise<Object>} Resolved source location
 */
export async function resolveSourceLocation({
  sourceURL,
  line,
  column = 1,
  functionName = '',
  scriptContent = '',
  workspaceRoot = process.cwd()
}) {
  let content = scriptContent;

  // If script content not provided, load it
  if (!content && sourceURL) {
    if (sourceURL.startsWith('http://') || sourceURL.startsWith('https://')) {
      try {
        const res = await fetch(sourceURL);
        if (res.ok) content = await res.text();
      } catch {}
    } else if (sourceURL.startsWith('file://') || sourceURL.startsWith('/')) {
      const localP = sourceURL.replace(/^file:\/\//, '');
      if (fs.existsSync(localP)) {
        try { content = fs.readFileSync(localP, 'utf8'); } catch {}
      }
    }
  }

  // 1. Try to find and parse source map (external or inline base64)
  const rawMap = await extractSourceMap(content, sourceURL);

  if (rawMap) {
    try {
      const consumer = new sourceMap.SourceMapConsumer(rawMap);
      
      // Explicit requirement: convert 1-based column to 0-based column for source-map-js
      const col0 = Math.max(0, (column || 1) - 1);
      
      const orig = consumer.originalPositionFor({
        line: line || 1, // 1-based line
        column: col0    // 0-based column
      });

      if (orig && orig.source && orig.line !== null) {
        // Resolve source path relative to workspaceRoot and normalize
        const resolvedPath = path.isAbsolute(orig.source)
          ? orig.source
          : path.resolve(workspaceRoot, orig.source);
        const exists = fs.existsSync(resolvedPath);

        return {
          resolved: true,
          method: 'source-map',
          file: normalizeRepoPath(resolvedPath),
          line: orig.line, // 1-based
          column: (orig.column !== null ? orig.column + 1 : 1), // back to 1-based
          name: orig.name || functionName,
          verifiedOnDisk: exists,
          confidence: 'high'
        };
      }
    } catch (err) {
      // Source map consumer failed, proceed to fallbacks
    }
  }

  // 2. Check if sourceURL directly corresponds to an unbundled original source file
  // (Ignore files inside dist/, build/, or minified bundles)
  const isBundledOrDist = sourceURL.includes('/dist/') || sourceURL.includes('/build/') || (content && content.length > 500 && content.split('\n').length <= 2);

  if (sourceURL && !isBundledOrDist) {
    try {
      const urlObj = new URL(sourceURL);
      const urlPath = urlObj.pathname.replace(/^\//, '');
      const possibleLocal = path.resolve(workspaceRoot, urlPath);
      if (fs.existsSync(possibleLocal) && fs.statSync(possibleLocal).isFile()) {
        return {
          resolved: true,
          method: 'direct-file',
          file: normalizeRepoPath(possibleLocal),
          line: line || 1,
          column: column || 1,
          name: functionName,
          verifiedOnDisk: true,
          confidence: 'high'
        };
      }
    } catch {
      // not a standard URL
    }
  }

  // 3. Fallback: Function-name matching against workspace repo with confidence "low"
  if (functionName && workspaceRoot) {
    const matched = findFunctionInWorkspace(functionName, workspaceRoot);
    if (matched) {
      return {
        resolved: true,
        method: 'function-name-matching',
        file: normalizeRepoPath(matched.file),
        line: matched.line,
        column: matched.column,
        name: functionName,
        verifiedOnDisk: fs.existsSync(matched.file),
        confidence: 'low',
        fallbackNotice: 'No valid source map found. Located by function-name AST matching.'
      };
    }
  }

  // 4. Fallback: Unmapped location
  return {
    resolved: false,
    method: 'unmapped',
    file: normalizeRepoPath(sourceURL) || 'unknown',
    line: line || 1,
    column: column || 1,
    name: functionName || '',
    verifiedOnDisk: false,
    confidence: 'low'
  };
}
