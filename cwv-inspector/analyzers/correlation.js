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
 * Correlates runtime CLS element shifts with AST code definitions.
 * 
 * @param {Array<object>} lhClsElements Elements flagged by Lighthouse for layout shifts.
 * @param {Array<object>} astElements JSX elements parsed from project files.
 * @returns {Array<object>} Array of correlated findings.
 */
export function correlateCls(lhClsElements, astElements) {
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

    // Step 1: Initial filtering of AST elements based on tag, ID, and class definitions
    let candidates = astElements.filter(astEl => {
      // Match tag name (Lighthouse reports standard lowercase, match either exact or JSX custom Component)
      const tagMatch = !targetParsed.tagName || 
        astEl.tagName.toLowerCase() === targetParsed.tagName.toLowerCase() ||
        (targetParsed.tagName.toLowerCase() === 'img' && astEl.tagName === 'Image');
      
      if (!tagMatch) return false;

      // Match ID if defined in selector
      if (targetParsed.id && astEl.id !== targetParsed.id) return false;

      // Match classes if defined in selector
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

    if (candidates.length === 0) {
      correlated.push({
        lhEl,
        source: null,
        confidence: 'UNRESOLVED',
        evidence: [`No matching source elements found for tag "${targetParsed.tagName || 'any'}"`]
      });
      return;
    }

    // Step 3: Confidence evaluation and disambiguation
    let matchedCandidate = null;
    let confidence = 'UNRESOLVED';
    const evidence = [];

    if (candidates.length === 1) {
      matchedCandidate = candidates[0];
      evidence.push(`Tag matched: "${matchedCandidate.tagName}"`);
      if (targetParsed.id) evidence.push(`ID matched: "${targetParsed.id}"`);
      if (targetParsed.classes.length > 0) evidence.push(`Classes matched: "${targetParsed.classes.join(', ')}"`);
      evidence.push('Unique candidate found in codebase.');
      confidence = 'HIGH';
    } else {
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
            confidence = 'HIGH';
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
          confidence = 'MEDIUM';
        }
      }

      if (!matchedCandidate) {
        evidence.push(`Ambiguous: Found ${candidates.length} candidates with matching tag/classes.`);
        confidence = 'UNRESOLVED';
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
        src: matchedCandidate.src
      } : null,
      confidence,
      evidence
    });
  });

  return correlated;
}
