import fs from 'fs';
import path from 'path';

/**
 * Robust image dimension extractor from file buffer headers.
 * Supports JPEG, PNG, and SVG without external native dependencies.
 * @param {string} filePath
 * @returns {{width: number, height: number} | null}
 */
export function getImageDimensions(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);

  // 1. PNG Header (IHDR chunk at byte 16)
  if (buffer.length > 24 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }

  // 2. JPEG Header (SOF0/SOF2 marker scanning)
  if (buffer.length > 4 && buffer[0] === 0xFF && buffer[1] === 0xD8) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xFF) {
        offset++;
        continue;
      }
      const marker = buffer[offset + 1];
      // Markers C0-C3, C5-C7, C9-CB, CD-CF specify SOF frames
      if ((marker >= 0xC0 && marker <= 0xC3) || (marker >= 0xC5 && marker <= 0xC7) || (marker >= 0xC9 && marker <= 0xCB) || (marker >= 0xCD && marker <= 0xCF)) {
        const height = buffer.readUInt16BE(offset + 5);
        const width = buffer.readUInt16BE(offset + 7);
        return { width, height };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  }

  // 3. SVG XML (viewBox or width/height attributes)
  if (filePath.endsWith('.svg')) {
    const text = buffer.toString('utf-8');
    const vb = text.match(/viewBox=["']\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)\s*["']/i);
    if (vb) {
      return { width: Math.round(parseFloat(vb[3])), height: Math.round(parseFloat(vb[4])) };
    }
    const w = text.match(/width=["']([0-9.]+)p?x?["']/i);
    const h = text.match(/height=["']([0-9.]+)p?x?["']/i);
    if (w && h) {
      return { width: Math.round(parseFloat(w[1])), height: Math.round(parseFloat(h[1])) };
    }
  }

  return null;
}

/**
 * Resolves a target path against workspaceRoot or fallback base dirs.
 * @param {string} targetPath
 * @param {string} [workspaceRoot]
 * @returns {string}
 */
export function resolveFilePath(targetPath, workspaceRoot = process.cwd()) {
  if (path.isAbsolute(targetPath) && fs.existsSync(targetPath)) return targetPath;
  const candidate1 = path.resolve(workspaceRoot, targetPath);
  if (fs.existsSync(candidate1)) return candidate1;
  const basename = path.basename(targetPath);
  const candidate2 = path.resolve(workspaceRoot, basename);
  if (fs.existsSync(candidate2)) return candidate2;
  return candidate1;
}

export function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Selector forms a rule may be written under: as given, its last compound token, and that token without its tag.
export function selectorForms(sel) {
  const tail = sel.trim().split(/\s+/).pop();
  return [...new Set([sel, tail, tail.replace(/^[a-z][a-z0-9-]*(?=[.#])/i, '')])];
}

const STYLE_EXTENSIONS = new Set(['.html', '.css', '.scss', '.less']);
const SKIPPED_DIRS = new Set(['node_modules', '.git', 'dist']);

function listStyleFiles(root) {
  const found = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (SKIPPED_DIRS.has(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (STYLE_EXTENSIONS.has(path.extname(entry.name))) found.push(full);
    }
  };
  walk(root);
  return found.sort();
}

const isPositive = (n) => Number.isFinite(n) && n > 0;
const noFix = (rule, reason) => ({ rule, fix: null, no_fix_reason: reason });

/**
 * CLS: unsized <img>. Uses only the natural size recorded for that image in the lab run
 * (issue.naturalWidth / issue.naturalHeight). Missing measurement => no fix.
 */
function fixUnsizedImage(issue, workspaceRoot, content) {
  const rule = 'cls-unsized-image';
  if (!isPositive(issue.naturalWidth) || !isPositive(issue.naturalHeight)) {
    return noFix(rule, 'Natural image size was not measured (naturalWidth/naturalHeight missing); not inferring dimensions.');
  }
  const selector = issue.location?.element;
  if (!selector) return noFix(rule, 'Issue has no element selector.');

  let imgRegex;
  if (selector.startsWith('#')) {
    imgRegex = new RegExp(`<img\\s+[^>]*?id=["']${escapeRegExp(selector.slice(1))}["'][^>]*?\\/?>`, 'gi');
  } else if (selector.startsWith('.')) {
    imgRegex = new RegExp(`<img\\s+[^>]*?class=["'][^"']*?\\b${escapeRegExp(selector.slice(1))}\\b[^"']*?["'][^>]*?\\/?>`, 'gi');
  } else {
    return noFix(rule, `Selector "${selector}" is not an id or class selector, so the <img> tag cannot be located unambiguously.`);
  }

  const matches = content.match(imgRegex) || [];
  if (matches.length === 0) return noFix(rule, `No <img> matching ${selector} in ${issue.location.file} (it may be created by script).`);
  if (matches.length > 1) return noFix(rule, `${matches.length} <img> tags match ${selector}; refusing to guess which one.`);

  const originalTag = matches[0];
  const hasWidth = /\swidth=/i.test(originalTag);
  const hasHeight = /\sheight=/i.test(originalTag);
  if (hasWidth && hasHeight) return noFix(rule, 'The <img> tag already declares width and height.');
  if (hasWidth || hasHeight) return noFix(rule, 'The <img> tag declares only one of width/height; the other cannot be derived without changing its aspect ratio.');

  const w = issue.naturalWidth;
  const h = issue.naturalHeight;
  const replacementTag = originalTag.endsWith('/>')
    ? originalTag.slice(0, -2).trimEnd() + ` width="${w}" height="${h}" />`
    : originalTag.slice(0, -1).trimEnd() + ` width="${w}" height="${h}">`;

  return {
    rule,
    fix: {
      strategy: 'rule-based',
      file: issue.location.file,
      edits: [{ original_snippet: originalTag, replacement_snippet: replacementTag }],
      description: `Add width="${w}" and height="${h}" to ${selector}, the natural size recorded for this image in the lab run.`,
      why_it_works: `Declaring width and height lets the browser compute the aspect ratio (${(w / h).toFixed(2)}) before the image downloads and reserve that box, so content below is not pushed when the image arrives.`,
      tradeoffs: 'The attributes must match the image\'s natural aspect ratio, and responsive CSS (max-width: 100%; height: auto) is needed for the image to scale.'
    }
  };
}

/**
 * CLS: container that did not reserve space for late-inserted content. Uses only the container selector and the
 * inserted node's height recorded in the lab run (issue.container.selector / .measuredHeight). The CSS rule is
 * located by searching the workspace; it must declare min-height: 0.
 */
function fixUnreservedContainer(issue, workspaceRoot, options) {
  const rule = 'cls-unreserved-container';
  const containerSelector = issue.container?.selector;
  if (!containerSelector) return noFix(rule, 'Container selector was not measured.');
  const height = issue.container?.measuredHeight;
  if (!isPositive(height)) return noFix(rule, 'Inserted node height after insertion was not measured; not estimating a height.');

  const searchRoot = options.searchRoot || workspaceRoot;
  const found = [];
  for (const file of listStyleFiles(searchRoot)) {
    const text = fs.readFileSync(file, 'utf-8');
    for (const form of selectorForms(containerSelector)) {
      const ruleRegex = new RegExp(`(?<![\\w-])${escapeRegExp(form)}\\s*\\{[^}]*?min-height:\\s*0(?:px)?\\s*;?[^}]*?\\}`, 'i');
      const match = text.match(ruleRegex);
      if (match) { found.push({ file, block: match[0] }); break; }
    }
  }
  if (found.length === 0) return noFix(rule, `No CSS rule for ${containerSelector} declaring min-height: 0 was found under the workspace.`);

  let chosen = found[0];
  if (found.length > 1) {
    // Several files declare the rule: prefer the document the lab run actually loaded (options.pageFile), then the issue's own file.
    const pagePath = options.pageFile ? path.resolve(searchRoot, options.pageFile.replace(/^\//, '')) : null;
    let preferred = pagePath ? found.filter(f => f.file === pagePath) : [];
    if (preferred.length !== 1) preferred = found.filter(f => issue.location?.file && f.file.endsWith(issue.location.file));
    if (preferred.length !== 1) return noFix(rule, `A rule for ${containerSelector} was found in ${found.length} files and none is identified as the analyzed page; refusing to guess which to edit.`);
    chosen = preferred[0];
  }

  const replacementBlock = chosen.block.replace(/min-height:\s*0(?:px)?\s*;?/i, `min-height: ${height}px;`);
  return {
    rule,
    fix: {
      strategy: 'rule-based',
      file: path.relative(workspaceRoot, chosen.file).replace(/\\/g, '/'),
      edits: [{ original_snippet: chosen.block, replacement_snippet: replacementBlock }],
      description: `Reserve min-height: ${height}px on ${containerSelector}, the height of the inserted node recorded in the lab run.`,
      why_it_works: isPositive(issue.container?.heightBefore)
        ? `Reserves ${height}px, the recorded height of the inserted node. The container already held ${issue.container.heightBefore}px of content before the insertion and that is not included, so part of the shift may remain; re-measure to confirm.`
        : `With ${height}px reserved before insertion (the container was empty), the later-inserted node fills space that already exists instead of pushing the content below it down.`,
      tradeoffs: 'Reserving vertical space leaves a blank placeholder area until the inserted content arrives.'
    }
  };
}

/** LCP: add fetchpriority="high" to the LCP image tag, located by its id selector. */
function fixLcpFetchPriority(issue, content) {
  const rule = 'lcp-fetchpriority';
  const selector = issue.location?.element;
  if (!selector || !selector.startsWith('#')) return noFix(rule, 'LCP element has no id selector, so its <img> tag cannot be located unambiguously.');
  const imgRegex = new RegExp(`<img\\s+[^>]*?id=["']${escapeRegExp(selector.slice(1))}["'][^>]*?\\/?>`, 'gi');
  const matches = content.match(imgRegex) || [];
  if (matches.length !== 1) return noFix(rule, `${matches.length} <img> tags match ${selector}.`);
  const originalTag = matches[0];
  if (/fetchpriority=/i.test(originalTag)) return noFix(rule, 'The <img> tag already sets fetchpriority.');
  const replacementTag = originalTag.endsWith('/>')
    ? originalTag.slice(0, -2).trimEnd() + ' fetchpriority="high" />'
    : originalTag.slice(0, -1).trimEnd() + ' fetchpriority="high">';
  return {
    rule,
    fix: {
      strategy: 'rule-based',
      file: issue.location.file,
      edits: [{ original_snippet: originalTag, replacement_snippet: replacementTag }],
      description: 'Add fetchpriority="high" to prioritize the LCP image request',
      why_it_works: 'Telling the browser the image is high priority makes the network stack request it ahead of non-critical assets, which can lower resource load delay.',
      tradeoffs: 'Overusing fetchpriority="high" on non-critical images can starve critical CSS and fonts of bandwidth.'
    }
  };
}

/** Add font-display: swap to the first @font-face block that lacks it. */
function fixFontDisplay(issue, content) {
  const rule = 'font-display-swap';
  const match = content.match(/@font-face\s*\{([^}]*?)\}/i);
  if (!match) return noFix(rule, 'No @font-face block found in the file.');
  if (/font-display:\s*swap/i.test(match[1])) return noFix(rule, '@font-face already sets font-display: swap.');
  const originalBlock = match[0];
  return {
    rule,
    fix: {
      strategy: 'rule-based',
      file: issue.location.file,
      edits: [{ original_snippet: originalBlock, replacement_snippet: originalBlock.replace(/\{/, '{\n      font-display: swap;') }],
      description: 'Add font-display: swap to prevent render-blocking FOIT',
      why_it_works: 'font-display: swap instructs the browser to use a fallback font immediately until the custom font is downloaded, avoiding blank text render delays.',
      tradeoffs: 'Can introduce minor layout shift if fallback font metrics differ noticeably from custom font metrics.'
    }
  };
}

/**
 * Deterministic rule-based fixer. Returns { rule, fix, no_fix_reason } when a rule applies to the issue
 * (fix is null with a reason when a required measurement or the code location is missing), or null when no rule
 * applies. Rules are selected by rootCauseCategory only; values come from the issue's recorded measurements.
 *
 * @param {Object} issue
 * @param {string} [workspaceRoot]
 * @param {{pageFile?: string, searchRoot?: string}} [options] searchRoot: directory searched for CSS rules (default workspaceRoot);
 *   pageFile: path, relative to searchRoot, of the HTML document the lab run loaded
 * @returns {{rule: string, fix: Object|null, no_fix_reason?: string}|null}
 */
export function diagnoseRuleBasedFix(issue, workspaceRoot = process.cwd(), options = {}) {
  if (!issue) return null;

  const category = issue.rootCauseCategory;
  const isContainerRule = issue.metric === 'CLS' && category === 'unreserved-container-shift';
  const isImageRule = issue.metric === 'CLS' && category === 'unsized-image-shift';
  const isLcpHint = issue.metric === 'LCP' && category === 'late-resource-discovery';
  const isFont = category === 'missing-font-display';
  if (!isContainerRule && !isImageRule && !isLcpHint && !isFont) return null;

  if (isContainerRule) return fixUnreservedContainer(issue, workspaceRoot, options);

  if (!issue.location || !issue.location.file) {
    return noFix(isImageRule ? 'cls-unsized-image' : isLcpHint ? 'lcp-fetchpriority' : 'font-display-swap', 'Source location unresolved.');
  }
  const fullPath = resolveFilePath(issue.location.file, workspaceRoot);
  if (!fs.existsSync(fullPath)) return noFix('source-file', `Source file not found: ${issue.location.file}`);
  const content = fs.readFileSync(fullPath, 'utf-8');

  if (isImageRule) return fixUnsizedImage(issue, workspaceRoot, content);
  if (isLcpHint) return fixLcpFetchPriority(issue, content);
  return fixFontDisplay(issue, content);
}

/**
 * Convenience wrapper: the fix, or null when no rule applies or a required value was not measured.
 * Use diagnoseRuleBasedFix to obtain the reason.
 */
export function generateRuleBasedFix(issue, workspaceRoot = process.cwd(), options = {}) {
  return diagnoseRuleBasedFix(issue, workspaceRoot, options)?.fix ?? null;
}
