import path from 'path';

/**
 * Parses a single CSS selector component (e.g. "img.hero-image" or "div#header")
 * to extract the tag name, ID, and list of classes.
 */
function parseSelectorComponent(comp) {
  if (!comp) return null;
  // Match tag, optional #id, optional .classes
  const match = comp.match(/^([a-zA-Z0-9\-]+)?(?:#([a-zA-Z0-9_-]+))?(?:\.([a-zA-Z0-9_.\-]+))?$/);
  if (!match) return null;
  
  return {
    tagName: match[1] || null,
    id: match[2] || null,
    classes: match[3] ? match[3].split('.') : []
  };
}

/**
 * Accurately calculates 1-indexed line and column numbers for a character offset in content,
 * properly supporting LF (\n) and CRLF (\r\n) line breaks.
 *
 * @param {string} content - Full text of the file.
 * @param {number} offset - Character index in content.
 * @returns {{ line: number|null, column: number|null }}
 */
export function getLineAndColumn(content, offset) {
  if (!content || typeof content !== 'string' || typeof offset !== 'number' || offset < 0) {
    return { line: null, column: null };
  }
  let line = 1;
  let column = 1;
  const limit = Math.min(offset, content.length);
  for (let i = 0; i < limit; i++) {
    if (content[i] === '\n') {
      line++;
      column = 1;
    } else if (content[i] !== '\r') {
      column++;
    }
  }
  return { line, column };
}

/**
 * Finds all occurrences of a regex pattern within file content, returning line and column for each.
 *
 * @param {string} content - Full text of the file.
 * @param {RegExp} regex - Pattern to search for.
 * @returns {Array<{ index: number, line: number, column: number, matchText: string }>}
 */
export function findRegexMatchesInFile(content, regex) {
  if (!content || typeof content !== 'string') return [];
  const matches = [];
  const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
  const globalRegex = new RegExp(regex.source, flags);
  let m;
  while ((m = globalRegex.exec(content)) !== null) {
    const { line, column } = getLineAndColumn(content, m.index);
    matches.push({
      index: m.index,
      line,
      column,
      matchText: m[0]
    });
  }
  return matches;
}

/**
 * Parses tags from HTML and EJS templates in a source-preserving manner.
 * Extracts tagName, id, classes, line, and column without choking on EJS delimiters (<% ... %>).
 *
 * @param {string} content - Template content.
 * @param {string} filePath - Path of template file.
 * @returns {Array<object>} Array of parsed template elements.
 */
export function extractTemplateTags(content, filePath) {
  if (!content || typeof content !== 'string') return [];
  const isSingleLine = !content.includes('\n');
  const tags = [];
  
  // Matches opening tags like <footer id="footer" class="footer-wrapper">
  const tagRegex = /<([a-zA-Z0-9\-]+)((?:\s+[^>]*?)?)\s*(\/?)>/g;
  let match;
  while ((match = tagRegex.exec(content)) !== null) {
    const tagName = match[1].toLowerCase();
    if (tagName === '!doctype' || tagName === '%' || tagName.startsWith('!--')) continue;

    const attrStr = match[2] || '';
    const offset = match.index;
    const { line, column } = getLineAndColumn(content, offset);

    // Extract ID
    const idMatch = attrStr.match(/\bid\s*=\s*['"]?([a-zA-Z0-9_-]+)['"]?/i);
    const id = idMatch ? idMatch[1] : null;

    // Extract classes (cleaning out EJS tags like <%= ... %>)
    const classMatch = attrStr.match(/\bclass(?:Name)?\s*=\s*['"]([^'"]*)['"]/i);
    let classes = [];
    if (classMatch && classMatch[1]) {
      const cleanClassStr = classMatch[1].replace(/<%.*?%>/g, ' ').trim();
      classes = cleanClassStr.split(/\s+/).filter(c => c && !c.startsWith('<%'));
    }

    // Extract src if present
    const srcMatch = attrStr.match(/\bsrc\s*=\s*['"]([^'"]*)['"]/i);
    const src = srcMatch ? srcMatch[1] : null;

    tags.push({
      filePath,
      tagName,
      id,
      classes,
      src,
      line: isSingleLine ? 1 : line,
      column: isSingleLine ? 1 : column,
      isSingleLine,
      offset
    });
  }
  return tags;
}

/**
 * Finds CSS rules in scanned stylesheet files matching elements or classes in the selector.
 *
 * @param {Array<object>} files - Scanned project files.
 * @param {Array<string>} selectorParts - Selector segments.
 * @returns {Array<object>} Matching CSS rules with line and file coordinates.
 */
export function findMatchingCssRules(files = [], selectorParts = []) {
  const matches = [];
  files.forEach(f => {
    if (f.ext !== '.css') return;
    selectorParts.forEach(part => {
      const parsed = parseSelectorComponent(part);
      if (!parsed) return;
      if (parsed.id) {
        const idRegex = new RegExp(`#${parsed.id}\\b[^{]*\\{([^}]+)\\}`, 'g');
        let m;
        while ((m = idRegex.exec(f.content)) !== null) {
          const { line, column } = getLineAndColumn(f.content, m.index);
          matches.push({
            file: f.filePath,
            line,
            column,
            selector: `#${parsed.id}`,
            properties: m[1].trim()
          });
        }
      }
      parsed.classes.forEach(cls => {
        if (cls.length > 3 && !['container', 'wrapper', 'main', 'row', 'col'].includes(cls.toLowerCase())) {
          const classRegex = new RegExp(`\\.${cls}\\b[^{]*\\{([^}]+)\\}`, 'g');
          let m;
          while ((m = classRegex.exec(f.content)) !== null) {
            const { line, column } = getLineAndColumn(f.content, m.index);
            matches.push({
              file: f.filePath,
              line,
              column,
              selector: `.${cls}`,
              properties: m[1].trim()
            });
          }
        }
      });
    });
  });
  return matches;
}

/**
 * Locates line number for a regex pattern within file content.
 * Provided for backward-compatibility; returns line, column, and single-line indicator.
 */
function findRegexLineNumber(content, regex) {
  if (!content || typeof content !== 'string') {
    return { line: 1, column: 1, isSingleLine: false, matchCount: 0, allMatches: [] };
  }
  const isSingleLine = !content.includes('\n');
  const matches = findRegexMatchesInFile(content, regex);
  if (matches.length > 0) {
    return {
      line: matches[0].line,
      column: matches[0].column,
      isSingleLine,
      matchCount: matches.length,
      allMatches: matches
    };
  }
  return { line: 1, column: 1, isSingleLine, matchCount: 0, allMatches: [] };
}

/**
 * Correlates runtime CLS element shifts with AST code definitions and template files.
 * 
 * @param {Array<object>} lhClsElements Elements flagged by Lighthouse for layout shifts.
 * @param {Array<object>} astElements JSX elements parsed from project files.
 * @param {Array<object>} allFiles Scanned workspace files.
 * @returns {Array<object>} Array of correlated findings.
 */
export function correlateCls(lhClsElements, astElements = [], allFiles = []) {
  const correlated = [];

  lhClsElements.forEach(lhEl => {
    const selector = lhEl.selector;
    if (!selector) {
      correlated.push({
        lhEl,
        source: null,
        confidence: 'UNRESOLVED',
        evidence: ['No selector provided by Lighthouse.']
      });
      return;
    }

    // Split selector into parts (e.g. "div.header > img.hero")
    const parts = selector.split(/\s*>\s*|\s+/).filter(Boolean);
    if (parts.length === 0) {
      correlated.push({
        lhEl,
        source: null,
        confidence: 'UNRESOLVED',
        evidence: ['Empty CSS selector.']
      });
      return;
    }

    // Target element is the last component in the selector path
    const targetPart = parts[parts.length - 1];
    const targetParsed = parseSelectorComponent(targetPart);
    if (!targetParsed) {
      correlated.push({
        lhEl,
        source: null,
        confidence: 'UNRESOLVED',
        evidence: [`Failed to parse target selector component: "${targetPart}"`]
      });
      return;
    }

    // Step 1: Initial filtering of AST elements (JSX) based on tag, ID, and class definitions
    let candidates = astElements.filter(astEl => {
      const tagMatch = !targetParsed.tagName || 
        astEl.tagName.toLowerCase() === targetParsed.tagName.toLowerCase() ||
        (targetParsed.tagName.toLowerCase() === 'img' && astEl.tagName === 'Image');
      
      if (!tagMatch) return false;
      if (targetParsed.id && astEl.id !== targetParsed.id) return false;

      if (targetParsed.classes.length > 0) {
        if (!astEl.className) return false;
        const astClasses = astEl.className.split(/\s+/);
        const hasAllClasses = targetParsed.classes.every(c => astClasses.includes(c));
        if (!hasAllClasses) return false;
      }

      return true;
    });

    // Step 2: Try attribute matching via element code snippets (e.g. matching src paths)
    if (candidates.length === 0 && lhEl.snippet) {
      const srcMatch = lhEl.snippet.match(/src=["']([^"']+)["']/);
      if (srcMatch) {
        const srcVal = srcMatch[1];
        candidates = astElements.filter(astEl => {
          return astEl.src && astEl.src.includes(path.basename(srcVal));
        });
      }
    }

    let matchedCandidate = null;
    let ambiguousCandidates = null;
    let confidence = 'UNRESOLVED';
    const evidence = [];

    if (candidates.length === 1) {
      matchedCandidate = candidates[0];
      evidence.push(`Tag matched: "${matchedCandidate.tagName}"`);
      if (targetParsed.id) {
        evidence.push(`ID matched: "${targetParsed.id}"`);
        confidence = 'EXACT';
      } else {
        confidence = 'PROBABLE';
      }
      if (targetParsed.classes.length > 0) evidence.push(`Classes matched: "${targetParsed.classes.join(', ')}"`);
      evidence.push('Unique candidate found in codebase.');
    } else if (candidates.length > 1) {
      // Disambiguate by checking image src names if available in element snippet
      if (lhEl.snippet) {
        const snippetSrc = lhEl.snippet.match(/src=["']([^"']+)["']/);
        if (snippetSrc) {
          const srcVal = snippetSrc[1];
          const matched = candidates.find(c => c.src && c.src.includes(path.basename(srcVal)));
          if (matched) {
            matchedCandidate = matched;
            evidence.push(`Tag matched: "${matchedCandidate.tagName}"`);
            evidence.push(`Unique source file src match: "${path.basename(srcVal)}"`);
            confidence = 'EXACT';
          }
        }
      }

      // Check if classes matched exactly to reduce ambiguity
      if (!matchedCandidate && targetParsed.classes.length > 0) {
        const exactClassMatches = candidates.filter(c => c.className === targetParsed.classes.join(' '));
        if (exactClassMatches.length === 1) {
          matchedCandidate = exactClassMatches[0];
          evidence.push(`Tag matched: "${matchedCandidate.tagName}"`);
          evidence.push(`Exact class match: "${matchedCandidate.className}"`);
          confidence = 'PROBABLE';
        }
      }

      if (!matchedCandidate) {
        evidence.push(`Ambiguous: Found ${candidates.length} candidates with matching tag/classes.`);
        confidence = 'AMBIGUOUS';
        ambiguousCandidates = candidates.map(c => ({
          filePath: c.filePath,
          line: c.line,
          column: c.column,
          tagName: c.tagName,
          id: c.id,
          className: c.className
        }));
      }
    }

    // Step 3: Template File Search (EJS, HTML) for the Target Element itself
    if (!matchedCandidate && candidates.length === 0 && allFiles && allFiles.length > 0) {
      const templateFiles = allFiles.filter(f => ['.ejs', '.html', '.vue', '.php', '.hbs'].includes(f.ext));
      let templateMatches = [];

      for (const tFile of templateFiles) {
        const tags = extractTemplateTags(tFile.content, tFile.filePath);
        const matchingTags = tags.filter(t => {
          const tagMatch = !targetParsed.tagName || t.tagName === targetParsed.tagName.toLowerCase();
          if (!tagMatch) return false;
          if (targetParsed.id && t.id !== targetParsed.id) return false;
          if (targetParsed.classes.length > 0) {
            const hasAllClasses = targetParsed.classes.every(c => t.classes.includes(c));
            if (!hasAllClasses) return false;
          }
          return true;
        });
        templateMatches.push(...matchingTags);
      }

      if (templateMatches.length === 1) {
        const tm = templateMatches[0];
        matchedCandidate = {
          filePath: tm.filePath,
          line: tm.line,
          column: tm.column,
          tagName: tm.tagName,
          id: tm.id,
          className: tm.classes.join(' '),
          isParentContainer: false,
          targetSelector: targetPart,
          targetTag: tm.tagName,
          isSingleLine: tm.isSingleLine
        };
        evidence.push(`Template match: Found unique element <${tm.tagName}${tm.id ? '#' + tm.id : ''}> in "${path.basename(tm.filePath)}" at line ${tm.line}:${tm.column}.`);
        confidence = tm.id ? 'EXACT' : 'PROBABLE';
      } else if (templateMatches.length > 1) {
        evidence.push(`Ambiguous: Found ${templateMatches.length} matching template elements across files.`);
        confidence = 'AMBIGUOUS';
        ambiguousCandidates = templateMatches.map(tm => ({
          filePath: tm.filePath,
          line: tm.line,
          column: tm.column,
          tagName: tm.tagName,
          id: tm.id,
          className: tm.classes.join(' ')
        }));
      }
    }

    // Step 4: Fallback Search (Ancestor Parent Container) if target element cannot be matched directly
    if (!matchedCandidate && confidence !== 'AMBIGUOUS' && allFiles && allFiles.length > 0) {
      evidence.push(`No matching AST elements found for tag "${targetParsed.tagName || 'any'}". Falling back to Regex.`);

      // Check if classes look dynamically generated by a bundler (e.g. CSS Modules / styled-components)
      const allClasses = parts.flatMap(p => parseSelectorComponent(p)?.classes || []);
      const hashedClasses = allClasses.filter(c =>
        /^[a-zA-Z0-9_-]{4,10}$/.test(c) &&
        ((/[A-Z]/.test(c) && /[a-z]/.test(c)) || (/[0-9]/.test(c) && /[a-zA-Z]/.test(c))) &&
        !['button', 'header', 'footer', 'layout', 'container', 'wrapper'].includes(c.toLowerCase())
      );
      if (hashedClasses.length > 0) {
        evidence.push(`Class ".${hashedClasses.join(', .')}" appears to be dynamically generated by a bundler (e.g. CSS Modules / hashed components); direct source class matching unavailable.`);
      }

      // Check CSS rules for related styling context
      const matchedCssRules = findMatchingCssRules(allFiles, parts);
      if (matchedCssRules.length > 0) {
        evidence.push(`Found ${matchedCssRules.length} matching CSS rule(s) in stylesheet(s) for selector context.`);
      }

      // Walk backwards up the selector path looking for an identifiable parent (e.g. ID or Class)
      for (let i = parts.length - 1; i >= 0; i--) {
        const fallbackPart = parseSelectorComponent(parts[i]);
        if (!fallbackPart) continue;

        const isTarget = (i === parts.length - 1);

        if (fallbackPart.id) {
          // Handle id="id", id='id', id=id, id = "id"
          const idRegex = new RegExp(`id\\s*=\\s*['"]?${fallbackPart.id}['"]?(?:\\s|>)`, 'i');
          const fileMatches = [];
          allFiles.forEach(f => {
            const matches = findRegexMatchesInFile(f.content, idRegex);
            if (matches.length > 0) {
              fileMatches.push({ file: f, matches });
            }
          });

          const totalOccurrences = fileMatches.reduce((acc, fm) => acc + fm.matches.length, 0);

          if (totalOccurrences > 1) {
            evidence.push(`Ambiguous parent match: Found ${totalOccurrences} occurrences of ID "${fallbackPart.id}" across codebase.`);
            confidence = 'AMBIGUOUS';
            ambiguousCandidates = fileMatches.flatMap(fm =>
              fm.matches.map(m => ({
                filePath: fm.file.filePath,
                line: m.line,
                column: m.column,
                id: fallbackPart.id
              }))
            );
            break;
          }

          if (totalOccurrences === 1) {
            const fileMatch = fileMatches[0].file;
            const matchInfo = fileMatches[0].matches[0];
            const isSingle = !fileMatch.content.includes('\n');

            matchedCandidate = {
              filePath: fileMatch.filePath,
              line: matchInfo.line,
              column: matchInfo.column,
              tagName: fallbackPart.tagName || (isTarget ? (targetParsed.tagName || 'Unknown') : 'container'),
              id: fallbackPart.id,
              className: '',
              isParentContainer: !isTarget,
              targetSelector: isTarget ? null : targetPart,
              targetTag: isTarget ? null : targetParsed.tagName,
              containerTag: fallbackPart.tagName || 'container',
              containerId: fallbackPart.id,
              containerLine: matchInfo.line,
              containerColumn: matchInfo.column,
              targetLine: isTarget ? matchInfo.line : null,
              targetColumn: isTarget ? matchInfo.column : null,
              isSingleLine: isSingle,
              relatedCss: matchedCssRules
            };

            if (isTarget) {
              evidence.push(`Regex fallback: Found unique element ID match "${fallbackPart.id}" in raw file at line ${matchInfo.line}:${matchInfo.column}.`);
              confidence = 'PROBABLE';
            } else {
              evidence.push(`Regex fallback: Found unique parent ID match "${fallbackPart.id}" in raw file at line ${matchInfo.line}:${matchInfo.column}.`);
              confidence = 'PROBABLE';
            }

            if (isSingle) {
              evidence.push('Template file contains entire layout on one line; exact line-level attribution unavailable.');
            }
            break;
          }
        }

        if (fallbackPart.classes && fallbackPart.classes.length > 0) {
          const primaryClass = fallbackPart.classes[0];
          // We only try fallback on classes if they look somewhat unique (not generic like 'div', 'container')
          if (primaryClass.length > 4 && !['container', 'wrapper', 'row', 'col', 'main'].includes(primaryClass)) {
            const classRegex = new RegExp(`class(Name)?\\s*=\\s*['"][^'"]*${primaryClass}[^'"]*['"]`, 'i');
            const fileMatches = [];
            allFiles.forEach(f => {
              const matches = findRegexMatchesInFile(f.content, classRegex);
              if (matches.length > 0) {
                fileMatches.push({ file: f, matches });
              }
            });

            const totalOccurrences = fileMatches.reduce((acc, fm) => acc + fm.matches.length, 0);

            if (totalOccurrences > 1) {
              evidence.push(`Ambiguous parent match: Found ${totalOccurrences} occurrences of Class "${primaryClass}" across codebase.`);
              confidence = 'AMBIGUOUS';
              ambiguousCandidates = fileMatches.flatMap(fm =>
                fm.matches.map(m => ({
                  filePath: fm.file.filePath,
                  line: m.line,
                  column: m.column,
                  className: primaryClass
                }))
              );
              break;
            }

            if (totalOccurrences === 1) {
              const fileMatch = fileMatches[0].file;
              const matchInfo = fileMatches[0].matches[0];
              const isSingle = !fileMatch.content.includes('\n');

              matchedCandidate = {
                filePath: fileMatch.filePath,
                line: matchInfo.line,
                column: matchInfo.column,
                tagName: fallbackPart.tagName || (isTarget ? (targetParsed.tagName || 'Unknown') : 'container'),
                id: null,
                className: primaryClass,
                isParentContainer: !isTarget,
                targetSelector: isTarget ? null : targetPart,
                targetTag: isTarget ? null : targetParsed.tagName,
                containerTag: fallbackPart.tagName || 'container',
                containerClass: primaryClass,
                containerLine: matchInfo.line,
                containerColumn: matchInfo.column,
                targetLine: isTarget ? matchInfo.line : null,
                targetColumn: isTarget ? matchInfo.column : null,
                isSingleLine: isSingle,
                relatedCss: matchedCssRules
              };

              if (isTarget) {
                evidence.push(`Regex fallback: Found unique element Class match "${primaryClass}" in raw file at line ${matchInfo.line}:${matchInfo.column}.`);
                confidence = 'PROBABLE';
              } else {
                evidence.push(`Regex fallback: Found unique parent Class match "${primaryClass}" in raw file at line ${matchInfo.line}:${matchInfo.column}.`);
                confidence = 'AMBIGUOUS';
              }

              if (isSingle) {
                evidence.push('Template file contains entire layout on one line; exact line-level attribution unavailable.');
              }
              break;
            }
          }
        }
      }
    }

    correlated.push({
      lhEl,
      source: matchedCandidate ? {
        filePath: matchedCandidate.filePath,
        line: matchedCandidate.line,
        column: matchedCandidate.column,
        tagName: matchedCandidate.tagName,
        id: matchedCandidate.id,
        className: matchedCandidate.className,
        src: matchedCandidate.src,
        isParentContainer: Boolean(matchedCandidate.isParentContainer),
        targetSelector: matchedCandidate.targetSelector || null,
        targetTag: matchedCandidate.targetTag || null,
        containerTag: matchedCandidate.containerTag || null,
        containerId: matchedCandidate.containerId || null,
        containerClass: matchedCandidate.containerClass || null,
        containerLine: matchedCandidate.containerLine || null,
        containerColumn: matchedCandidate.containerColumn || null,
        targetLine: matchedCandidate.targetLine || null,
        targetColumn: matchedCandidate.targetColumn || null,
        isSingleLine: Boolean(matchedCandidate.isSingleLine),
        relatedCss: matchedCandidate.relatedCss || []
      } : null,
      ambiguousSources: ambiguousCandidates,
      confidence,
      evidence
    });
  });

  return correlated;
}

