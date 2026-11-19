/**
 * AST Traversal and Scope Analysis Utilities for CWV Inspector.
 * Enables deep call graph tracing, full function scope extraction,
 * vanilla/jQuery event handler discovery, and layout thrashing detection.
 */

import { getLineAndColumn } from '../analyzers/correlation.js';

/**
 * Traces a call chain from a root function name across local function definitions.
 * Protects against recursion and cyclic call graphs.
 * 
 * @param {string} rootFunc Name of the root function.
 * @param {object} fileFunctions Map of functionName -> startLineNumber.
 * @param {object} fileCalls Map of functionName -> Array<calledFunctionName>.
 * @param {number} [maxDepth=2] Maximum traversal depth.
 * @returns {{ chain: string[], external: boolean, finalLine: number|null, finalFunc: string }}
 */
export function followFunctionCalls(rootFunc, fileFunctions = {}, fileCalls = {}, maxDepth = 2) {
  if (!rootFunc) {
    return { chain: [], external: true, finalLine: null, finalFunc: '' };
  }

  const chain = [rootFunc];
  const visited = new Set([rootFunc]);
  let current = rootFunc;

  for (let depth = 0; depth < maxDepth; depth++) {
    const nextCalls = fileCalls[current];
    if (Array.isArray(nextCalls) && nextCalls.length > 0) {
      const nextFunc = nextCalls.find(name => !visited.has(name));
      if (nextFunc) {
        chain.push(nextFunc);
        visited.add(nextFunc);
        current = nextFunc;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  const lastFunc = chain[chain.length - 1];
  const isLocal = fileFunctions[lastFunc] !== undefined;

  return {
    chain,
    external: !isLocal,
    finalLine: fileFunctions[lastFunc] || null,
    finalFunc: lastFunc
  };
}

/**
 * Extracts the full code scope of a function from file content using line boundaries.
 * 
 * @param {string} functionName Name of function.
 * @param {string} content Full file content.
 * @param {object} fileFunctions Map of functionName -> startLine.
 * @param {number} [maxLines=75] Maximum lines to inspect.
 * @returns {{ scope: string, startLine: number, endLine: number }}
 */
export function getFullFunctionScope(functionName, content, fileFunctions = {}, maxLines = 75) {
  if (!content) return { scope: '', startLine: 1, endLine: 1 };

  const lines = content.split('\n');
  let startLine = 1;

  if (functionName && fileFunctions[functionName]) {
    startLine = fileFunctions[functionName];
  } else if (functionName) {
    const idx = lines.findIndex(l => l.includes(functionName) && (l.includes('function') || l.includes('=>') || l.includes('=')));
    if (idx >= 0) startLine = idx + 1;
  }

  const startIdx = Math.max(0, startLine - 1);
  const endIdx = Math.min(lines.length, startIdx + maxLines);
  const scope = lines.slice(startIdx, endIdx).join('\n');

  return {
    scope,
    startLine,
    endLine: endIdx
  };
}

/**
 * Extracts called function identifiers from a snippet of code.
 * 
 * @param {string} scopeText Code snippet.
 * @returns {Array<string>} Array of unique function names called.
 */
export function extractFunctionCalls(scopeText) {
  if (!scopeText) return [];
  const calls = new Set();
  const regex = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
  let match;
  const reserved = new Set([
    'if', 'for', 'while', 'switch', 'catch', 'function', 'return', 'import',
    'export', 'async', 'await', 'new', 'typeof', 'instanceof', 'void', 'delete'
  ]);

  while ((match = regex.exec(scopeText)) !== null) {
    const name = match[1];
    if (!reserved.has(name)) {
      calls.add(name);
    }
  }

  return Array.from(calls);
}

/**
 * Discovers event listeners across files including vanilla JS, jQuery, and custom handlers.
 * 
 * @param {Array<object>} files Workspace scanned files.
 * @returns {Array<object>} Detected handler elements with file coordinates.
 */
export function findAllEventHandlers(files = []) {
  const handlers = [];
  const patterns = [
    {
      type: 'vanilla-addEventListener',
      regex: /(?:\.[a-zA-Z0-9_$]+(?:\([^)]*\))?|[a-zA-Z0-9_$]+|\))?\.addEventListener\s*\(\s*['"](click|input|change|submit|keydown|keyup|pointerdown|pointerup)['"]\s*,\s*([^,\)]+)/g,
      handlerIndex: 2,
      eventIndex: 1
    },
    {
      type: 'vanilla-property',
      regex: /(?:document|window|element|[a-zA-Z_$][a-zA-Z0-9_$]*)\.on(click|change|input|submit|keydown|keyup|pointerdown|pointerup)\s*=\s*([^;]+)/g,
      handlerIndex: 2,
      eventIndex: 1
    },
    {
      type: 'jquery-on',
      regex: /\$\([^)]*\)\.on\s*\(\s*['"](click|input|change|submit|keydown|pointerdown)['"]\s*,\s*([^,\)]+)/g,
      handlerIndex: 2,
      eventIndex: 1
    }
  ];

  files.forEach(file => {
    if (!['.js', '.jsx', '.ts', '.tsx', '.html'].includes(file.ext)) return;
    const content = file.content || '';

    patterns.forEach(p => {
      let match;
      const regex = new RegExp(p.regex.source, p.regex.flags);
      while ((match = regex.exec(content)) !== null) {
        const { line, column } = getLineAndColumn(content, match.index);
        const eventName = match[p.eventIndex];
        const rawHandler = (match[p.handlerIndex] || '').trim();

        handlers.push({
          type: p.type,
          file: file.filePath || file.relativePath,
          relativePath: file.relativePath,
          line: line || 1,
          column: column || 1,
          event: eventName,
          rawHandler,
          snippet: match[0].slice(0, 120)
        });
      }
    });
  });

  return handlers;
}

/**
 * Scans a range of code lines for forced synchronous layout (Layout Thrashing).
 * 
 * @param {Array<string>} lines Array of code lines.
 * @param {number} startLineIndex 0-based starting line index.
 * @param {number} [windowSize=8] Lookahead window size.
 * @returns {{ hasThrashing: boolean, writeLine: number, readLine: number, writeSnippet: string, readSnippet: string }|null}
 */
export function detectLayoutThrashingInScope(lines, startLineIndex, windowSize = 8) {
  if (!Array.isArray(lines) || startLineIndex >= lines.length) return null;

  const currentLine = lines[startLineIndex];
  const isWrite = /style\.[a-zA-Z]+\s*=|classList\.(add|remove|toggle)/i.test(currentLine);
  if (!isWrite) return null;

  const maxLook = Math.min(lines.length, startLineIndex + windowSize + 1);
  for (let offset = 1; startLineIndex + offset < maxLook; offset++) {
    const nextLine = lines[startLineIndex + offset];
    const isRead = /offset(Width|Height|Top|Left)|client(Width|Height|Top|Left)|scroll(Width|Height|Top|Left)|getBoundingClientRect|getComputedStyle/i.test(nextLine);
    if (isRead) {
      return {
        hasThrashing: true,
        writeLine: startLineIndex + 1,
        readLine: startLineIndex + offset + 1,
        writeSnippet: currentLine.trim(),
        readSnippet: nextLine.trim()
      };
    }
  }

  return null;
}
