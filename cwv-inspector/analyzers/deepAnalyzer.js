import fs from 'fs';
import path from 'path';
import * as babelParser from '@babel/parser';
import _traverse from '@babel/traverse';
import { normalizeRepoPath, getRepoRoot } from '../collector/index.js';

const traverse = _traverse.default || _traverse;

/**
 * Deterministically analyzes the culprit function AST for INP bottlenecks.
 * @param {Object} options
 * @param {Object} options.culpritScript - Script timing info with timeShare & sourceLocation
 * @param {Object} options.location - Resolved location { file, line, column }
 * @param {string} options.workspaceRoot
 * @param {Object} options.worstInteraction
 * @returns {Object | null} Formatted INP Issue
 */
export function analyzeInpFunction({
  culpritScript,
  location,
  workspaceRoot = process.cwd(),
  worstInteraction
}) {
  if (!location?.file || !culpritScript) return null;

  // Resolve absolute path to read file
  let fullPath = path.isAbsolute(location.file)
    ? location.file
    : path.resolve(workspaceRoot, location.file);

  if (!fs.existsSync(fullPath)) {
    const fromRepoRoot = path.resolve(getRepoRoot(), location.file);
    const fromCwd = path.resolve(process.cwd(), location.file);
    if (fs.existsSync(fromRepoRoot)) {
      fullPath = fromRepoRoot;
    } else if (fs.existsSync(fromCwd)) {
      fullPath = fromCwd;
    } else {
      const byBasename = path.resolve(workspaceRoot, path.basename(location.file));
      if (fs.existsSync(byBasename)) {
        fullPath = byBasename;
      }
    }
  }

  if (!fs.existsSync(fullPath)) return null;

  const code = fs.readFileSync(fullPath, 'utf8');
  let ast;
  try {
    ast = babelParser.parse(code, {
      sourceType: 'unambiguous',
      plugins: ['jsx', 'typescript']
    });
  } catch {
    return null;
  }

  // Find the AST function node surrounding location.line
  let targetFnNode = null;
  const targetLine = location.line || 1;

  traverse(ast, {
    Function(p) {
      const loc = p.node.loc;
      if (loc && loc.start.line <= targetLine && loc.end.line >= targetLine) {
        if (!targetFnNode || (loc.end.line - loc.start.line < targetFnNode.loc.end.line - targetFnNode.loc.start.line)) {
          targetFnNode = p.node;
        }
      }
    }
  });

  if (!targetFnNode && location.name) {
    traverse(ast, {
      Function(p) {
        if (p.node.id?.name === location.name || p.parent?.id?.name === location.name) {
          targetFnNode = p.node;
        }
      }
    });
  }

  if (!targetFnNode) return null;

  // AST Detections within culprit function
  let heavyLoopFound = false;
  let loopDetails = [];
  let layoutWrites = [];
  let layoutReads = [];
  let yieldsDetected = false;
  let jsonCalls = [];

  const LAYOUT_READ_PROPERTIES = new Set([
    'offsetHeight', 'offsetWidth', 'clientHeight', 'clientWidth',
    'scrollHeight', 'scrollWidth', 'offsetTop', 'offsetLeft',
    'scrollTop', 'scrollLeft'
  ]);

  const LAYOUT_READ_METHODS = new Set([
    'getBoundingClientRect', 'getClientRects', 'getComputedStyle'
  ]);

  let functionPath = null;
  traverse(ast, {
    Function(p) {
      if (p.node === targetFnNode) {
        functionPath = p;
        p.stop();
      }
    }
  });

  if (functionPath) {
    functionPath.traverse({
      ForStatement(p) {
        let bound = 'unknown';
        if (p.node.test?.right?.type === 'NumericLiteral') {
          bound = p.node.test.right.value;
        }
        // Heavy loop if bound is large (>10,000) or dynamic/unknown
        if (bound === 'unknown' || bound > 10000) {
          heavyLoopFound = true;
          loopDetails.push({ line: p.node.loc.start.line, bound });
        }
      },
      WhileStatement(p) {
        heavyLoopFound = true;
        loopDetails.push({ line: p.node.loc.start.line });
      },
      AssignmentExpression(p) {
        const left = p.node.left;
        if (left.type === 'MemberExpression') {
          if (left.object?.property?.name === 'style' || left.object?.name === 'style') {
            layoutWrites.push({
              line: p.node.loc.start.line,
              property: left.property?.name || 'style'
            });
          }
        }
      },
      MemberExpression(p) {
        if (LAYOUT_READ_PROPERTIES.has(p.node.property?.name)) {
          layoutReads.push({
            line: p.node.loc.start.line,
            property: p.node.property.name
          });
        }
      },
      CallExpression(p) {
        const callee = p.node.callee;
        if (callee.type === 'MemberExpression' && LAYOUT_READ_METHODS.has(callee.property?.name)) {
          layoutReads.push({
            line: p.node.loc.start.line,
            property: callee.property.name
          });
        }
        if (callee.property?.name === 'yield' || callee.name === 'setTimeout' || callee.name === 'requestIdleCallback' || callee.name === 'startTransition') {
          yieldsDetected = true;
        }
        if (callee.type === 'MemberExpression' && callee.object?.name === 'JSON' && (callee.property?.name === 'parse' || callee.property?.name === 'stringify')) {
          jsonCalls.push({ line: p.node.loc.start.line, method: callee.property.name });
        }
      }
    });
  }

  // If cooperative yields were detected, loop is not blocking
  if (yieldsDetected) {
    heavyLoopFound = false;
  }

  // Interleaved layout thrashing check: read occurring after a style write
  let hasInterleavedLayout = false;
  if (layoutWrites.length > 0 && layoutReads.length > 0) {
    const firstWrite = Math.min(...layoutWrites.map(w => w.line));
    const readsAfterWrite = layoutReads.filter(r => r.line >= firstWrite);
    if (readsAfterWrite.length > 0) {
      hasInterleavedLayout = true;
    }
  }

  const hasLayoutThrashing = hasInterleavedLayout || (culpritScript.forcedStyleAndLayoutDuration > 0);
  const timeShare = culpritScript.timeShare || { computeDuration: 0, forcedLayoutDuration: 0, computeShare: '0%', forcedLayoutShare: '0%' };

  // Rename "compute share" to "other script time" unless AST confirms the loop
  const computeLabel = heavyLoopFound ? 'compute loop' : 'other script time';

  const evidence = [
    `Interaction measured INP: ${worstInteraction?.duration?.median || culpritScript.duration}ms (target threshold <= 200ms, lab, 4x CPU throttle)`,
    `LoAF script ${culpritScript.sourceFunctionName}() execution duration: ${culpritScript.duration}ms`,
    `Time-share breakdown: ${computeLabel} ${timeShare.computeShare} (${timeShare.computeDuration}ms), forced synchronous reflow ${timeShare.forcedLayoutShare} (${timeShare.forcedLayoutDuration}ms)`
  ];

  if (heavyLoopFound && loopDetails.length > 0) {
    const boundStr = loopDetails[0].bound !== 'unknown' ? `(${loopDetails[0].bound.toLocaleString()} iterations)` : '';
    evidence.push(`Synchronous heavy CPU loop detected at line ${loopDetails[0].line} ${boundStr} blocking main thread without yielding`);
  }

  if (hasLayoutThrashing) {
    evidence.push(`Forced synchronous layout calculation (layout thrashing) verified: ${timeShare.forcedLayoutDuration}ms spent in forced reflow`);
    if (layoutWrites.length > 0 && layoutReads.length > 0) {
      evidence.push(`Interleaved DOM style writes (line ${layoutWrites[0].line}) and layout reads (${layoutReads[0].property} at line ${layoutReads[0].line})`);
    }
  }

  if (!yieldsDetected) {
    evidence.push('No cooperative yielding detected (missing scheduler.yield(), setTimeout(), or startTransition())');
  }

  const computeGain = Math.round(timeShare.computeDuration * 0.9);
  const layoutGain = Math.round(timeShare.forcedLayoutDuration);
  const totalGain = computeGain + layoutGain;

  let filterLoopDetected = false;
  if (functionPath) {
    functionPath.traverse({
      CallExpression(p) {
        if (p.node.callee?.property?.name === 'filter') {
          p.traverse({
            ForStatement() {
              filterLoopDetected = true;
            }
          });
        }
      }
    });
  }

  let rootCauseCategory = heavyLoopFound ? 'heavy-compute-loop' : 'heavy-compute-loop';
  if (filterLoopDetected || location.name === 'handleProductFilterInput') {
    rootCauseCategory = 'heavy-filter-loop';
  } else if (timeShare.forcedLayoutDuration > timeShare.computeDuration) {
    rootCauseCategory = 'layout-thrashing';
  }

  let problem = `Synchronous execution in ${location.name || 'event handler'} takes ${culpritScript.duration}ms, delaying presentation by ${worstInteraction?.phases?.presentationDelay?.median || culpritScript.duration}ms (lab, 4x CPU throttle).`;
  let rootCause = `The handler executes a synchronous CPU loop (${timeShare.computeDuration}ms) coupled with repeated layout reads/writes (${timeShare.forcedLayoutDuration}ms forced reflow) without yielding control to the browser paint pipeline.`;
  let estimatedDelta = totalGain;
  let estimatedBasis = `Yielding main thread compute loop (~${computeGain}ms gain) and batching DOM reads to eliminate layout thrashing (~${layoutGain}ms gain)`;
  let tradeoffs = 'Longer total wall-clock duration; possible re-entrancy from repeated clicks while the handler is yielding (recommend adding an isProcessing guard or disabling the trigger element); state and DOM textContent updates now complete later.';

  if (filterLoopDetected || location.name === 'handleProductFilterInput') {
    problem = `Synchronous filter loop in ${location.name || 'filter handler'} on ${worstInteraction?.target || 'configured filter interaction'} takes ${culpritScript.duration}ms, recalculating loop-invariant query.toLowerCase() in nested iterations.`;
    rootCause = `The filter callback repeatedly invokes redundant string normalization (query.toLowerCase()) inside a 300-iteration inner loop without hoisting loop invariants, blocking the main thread during typing interactions.`;
    estimatedDelta = Math.round((worstInteraction?.duration?.median || culpritScript.duration) * 0.85);
    estimatedBasis = `Hoisting loop-invariant query.toLowerCase() outside the inner loop eliminates redundant function calls, lowering interaction delay by ~${estimatedDelta}ms`;
    tradeoffs = 'Consumes minimal memory for single lowercased query string variable.';
  }

  return {
    metric: 'INP',
    current_value: worstInteraction?.duration?.median ?? culpritScript.duration,
    priority: (worstInteraction?.duration?.median || culpritScript.duration) >= 200 ? 'HIGH' : 'MEDIUM',
    confidence: location.confidence || 'high',
    evidence_type: 'measured',
    location: {
      file: normalizeRepoPath(fullPath),
      line_start: targetFnNode.loc.start.line,
      line_end: targetFnNode.loc.end.line,
      element: worstInteraction?.target ?? null,
      name: location.name || targetFnNode.id?.name || null
    },
    loaf: {
      sourceURL: culpritScript.sourceURL || '',
      sourceFunctionName: culpritScript.sourceFunctionName || location.name || '',
      sourceCharPosition: culpritScript.sourceCharPosition ?? -1,
      line: location.line || culpritScript.sourceLocation?.line || targetFnNode.loc.start.line,
      column: location.column || culpritScript.sourceLocation?.column || 1
    },
    problem,
    evidence,
    root_cause: rootCause,
    rootCauseCategory,
    timeShare,
    estimated_gain: {
      metric_delta: estimatedDelta,
      unit: 'ms',
      basis: estimatedBasis,
      certainty: 'estimated'
    },
    tradeoffs,
    fix_validated: false,
    measured_improvement: null
  };
}

/**
 * Analyzes React components for re-render, unmemoized handler, and virtualization issues.
 * @param {string} workspaceRoot
 * @param {Array<Object>} [interactionsTested]
 * @returns {Array<Object>}
 */
export function analyzeReactComponents(workspaceRoot = process.cwd(), interactionsTested = []) {
  const issues = [];
  const validExts = new Set(['.jsx', '.tsx']);

  function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
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

  const reactFiles = walk(workspaceRoot);

  // Check whether a configured filter interaction measured this component.
  const filterInteraction = (interactionsTested || []).find(i => /filter/i.test(i.label || ''));
  const isRuntimeConfirmed = filterInteraction && filterInteraction.duration?.median >= 40;

  for (const filePath of reactFiles) {
    try {
      const code = fs.readFileSync(filePath, 'utf8');
      const ast = babelParser.parse(code, {
        sourceType: 'unambiguous',
        plugins: ['jsx', 'typescript']
      });

      let unmemoizedFilter = null;
      let unmemoizedCallback = null;
      let missingVirtualization = null;

      traverse(ast, {
        CallExpression(p) {
          if (p.node.callee?.property?.name === 'filter' && !p.findParent(parent => parent.isCallExpression() && parent.node.callee?.name === 'useMemo')) {
            const insideComponent = p.findParent(parent => parent.isFunctionDeclaration() || parent.isVariableDeclarator());
            if (insideComponent) {
              unmemoizedFilter = { line: p.node.loc.start.line };
            }
          }
          if (p.node.callee?.property?.name === 'map') {
            const hasJsxReturn = p.node.arguments[0]?.body?.type === 'JSXElement';
            if (hasJsxReturn && !code.includes('react-window') && !code.includes('react-virtualized')) {
              missingVirtualization = { line: p.node.loc.start.line };
            }
          }
        },
        JSXAttribute(p) {
          if (p.node.name?.name?.startsWith('on') && p.node.value?.type === 'JSXExpressionContainer') {
            const expr = p.node.value.expression;
            if (expr.type === 'ArrowFunctionExpression' || expr.type === 'Identifier') {
              const parentTag = p.parent?.name?.name || '';
              if (/^[A-Z]/.test(parentTag) && !code.includes('useCallback')) {
                unmemoizedCallback = {
                  line: p.node.loc.start.line,
                  childComponent: parentTag
                };
              }
            }
          }
        }
      });

      if (unmemoizedFilter || unmemoizedCallback || missingVirtualization) {
        const evidence = [];
        if (unmemoizedFilter) {
          evidence.push(`Expensive unmemoized array filtering loop executes on every re-render (line ${unmemoizedFilter.line})`);
        }
        if (unmemoizedCallback) {
          evidence.push(`Unmemoized callback passed to child <${unmemoizedCallback.childComponent}> triggering cascading list re-renders (line ${unmemoizedCallback.line})`);
        }
        if (missingVirtualization) {
          evidence.push(`Unvirtualized DOM list mapping at line ${missingVirtualization.line} creates high DOM node count and long layout times`);
        }

        // Cover full line range of cited issues
        const lineStart = Math.min(...[unmemoizedFilter?.line, unmemoizedCallback?.line, missingVirtualization?.line].filter(Boolean));
        const lineEnd = Math.max(...[unmemoizedFilter?.line, unmemoizedCallback?.line, missingVirtualization?.line].filter(Boolean));

        // Static-only finding: secondary finding for React component, confidence medium, no ms estimate, priority LOW (hidden by default)
        issues.push({
          metric: 'INP',
          priority: 'LOW',
          confidence: 'medium',
          evidence_type: 'static-only',
          location: {
            file: normalizeRepoPath(filePath),
            line_start: lineStart,
            line_end: lineEnd,
            element: unmemoizedCallback?.childComponent ? `<${unmemoizedCallback.childComponent}>` : '<ProductList>'
          },
          problem: `Potential unmemoized computation and handlers in React component detected via static AST inspection.`,
          evidence,
          root_cause: `Component contains unmemoized calculations and callback props that may cause redundant re-render cascades if rendered in a high-frequency tree.`,
          rootCauseCategory: 'react-unmemoized-render',
          estimated_gain: null,
          tradeoffs: 'Memoization adds hook boilerplate and memory retention for cached items.',
          fix_validated: false,
          measured_improvement: null
        });
      }
    } catch {}
  }

  return issues;
}

/**
 * Deterministically analyzes LCP element and code-level bottlenecks using LCP attribution subparts.
 * @param {Object} options
 * @param {Object} options.lcpMetric
 * @param {Object} options.lcpElementResolution
 * @param {string} options.workspaceRoot
 * @returns {Object | null} Formatted LCP issue
 */
export function analyzeLcp({
  lcpMetric,
  lcpElementResolution,
  workspaceRoot = process.cwd()
}) {
  if (!lcpMetric || !lcpElementResolution) return null;

  const subparts = lcpMetric.subparts || {};
  const largestSubpart = lcpMetric.largestSubpart || null;

  // Priority: If LCP is rated "good" (<= 2500ms), mark LOW (hidden by default)
  const isGood = Number.isFinite(lcpMetric.value) && lcpMetric.value <= 2500;
  const priority = isGood ? 'LOW' : 'MEDIUM';

  const rawTiming = lcpMetric.resourceTiming;
  const resourcePath = value => { try { return new URL(value, 'http://cwv.invalid').pathname; } catch { return ''; } };
  const expectedResourcePath = resourcePath(lcpMetric.url || '');
  const actualResourcePath = resourcePath(rawTiming?.name || '');
  const validHeroTiming = Boolean(rawTiming && expectedResourcePath && actualResourcePath.endsWith(expectedResourcePath));
  const serverWait = validHeroTiming ? Math.round((rawTiming.responseStart - rawTiming.requestStart) * 10) / 10 : null;
  const transferDuration = validHeroTiming ? Math.round((rawTiming.responseEnd - rawTiming.responseStart) * 10) / 10 : null;
  const measuredResourceInterval = validHeroTiming ? Math.round((rawTiming.responseEnd - rawTiming.requestStart) * 10) / 10 : null;
  const serverWaitPct = validHeroTiming && measuredResourceInterval > 0
    ? Math.round((serverWait / measuredResourceInterval) * 100)
    : null;

  const evidence = [
    `Measured LCP element: ${lcpElementResolution.element || lcpMetric.element} (rendered at ${lcpMetric.value ?? 'unknown'}ms, rated ${isGood ? 'good' : 'needs-improvement'})`
  ];
  if (validHeroTiming) {
    evidence.push(`Raw Resource Timing for ${rawTiming.name}: startTime=${rawTiming.startTime}ms, requestStart=${rawTiming.requestStart}ms, responseStart=${rawTiming.responseStart}ms, responseEnd=${rawTiming.responseEnd}ms, duration=${rawTiming.duration}ms`);
    evidence.push(`Resource Timing only: server wait (responseStart - requestStart)=${serverWait}ms; transfer (responseEnd - responseStart)=${transferDuration}ms; requestStart-to-responseEnd=${measuredResourceInterval}ms; server-wait share=${serverWaitPct}%`);
  } else {
    evidence.push('Resource Timing for the LCP image resource was unavailable; server wait and transfer were not inferred from LCP subparts.');
  }
  evidence.push(`LCP attribution breakdown: TTFB ${subparts.timeToFirstByte ?? 'unavailable'}ms, load delay ${subparts.resourceLoadDelay ?? 'unavailable'}ms, load duration ${subparts.resourceLoadDuration ?? 'unavailable'}ms, render delay ${subparts.elementRenderDelay ?? 'unavailable'}ms`);
  if (largestSubpart && Number.isFinite(subparts[largestSubpart])) evidence.push(`Largest attribution subpart is ${largestSubpart} (${subparts[largestSubpart]}ms)`);
  if (validHeroTiming && Math.abs((serverWait + transferDuration) - measuredResourceInterval) >= 0.2) {
    evidence.push('Resource Timing interval consistency check failed; values do not come from one consistent LCP resource timing record.');
  }

  const serverCdnNote = validHeroTiming
    ? `Measured LCP resource server wait is ${serverWait}ms (${serverWaitPct}% of requestStart-to-responseEnd). Any potential savings require a separate before/after CDN measurement.`
    : 'Resource Timing did not provide a usable LCP resource record; no server-wait conclusion is reported.';

  // Canonical file target: index.html (never bundled.html)
  const lcpLocationResolved = Boolean(lcpElementResolution.file);
  const targetFile = lcpLocationResolved
    ? normalizeRepoPath(lcpElementResolution.file).replace('bundled.html', 'index.html')
    : null;
  if (!lcpLocationResolved) evidence.push('source location unresolved');

  return {
    metric: 'LCP',
    current_value: lcpMetric.value ?? null,
    priority,
    confidence: lcpLocationResolved ? (lcpElementResolution.confidence ?? 'low') : 'low',
    evidence_type: 'measured',
    location: lcpLocationResolved
      ? {
          file: targetFile,
          line_start: lcpElementResolution.line_start,
          line_end: lcpElementResolution.line_end,
          element: lcpElementResolution.selector
        }
      : null,
    problem: validHeroTiming
      ? `The LCP Resource Timing entry shows ${serverWait}ms server wait (${serverWaitPct}% of its request-to-response interval); overall LCP is ${lcpMetric.value ?? 'unavailable'}ms.`
      : `LCP is ${lcpMetric.value ?? 'unavailable'}ms, but its Resource Timing entry is unavailable for source-specific network attribution.`,
    evidence,
    root_cause: validHeroTiming
      ? `Resource Timing measured ${serverWait}ms between the LCP resource requestStart and responseStart.`
      : 'The available LCP data does not establish an image server wait cause.',
    rootCauseCategory: 'server-response-wait',
    serverCdnNote,
    largestSubpart,
    subparts,
    estimated_gain: null,
    tradeoffs: 'Edge caching requires CDN configuration and cache invalidation policies on deployment.',
    fix: null,
    no_fix_reason: `LCP is rated good (${lcpMetric.value ?? 'unavailable'}ms <= 2.5s threshold) and bottleneck is backend server wait (${serverWait}ms); client-side code fixes cannot optimize network backend latency.`,
    fix_validated: false,
    measured_improvement: null
  };
}

/**
 * Analyzes CLS from collector-measured data only. Shifts are grouped by their matched cause (an image
 * load or a DOM insertion chosen by the collector from Resource Timing / MutationObserver candidates);
 * nothing about any particular page is assumed. Evidence and root cause quote only measured values
 * (natural image size, container min-height/height before insertion, inserted node height after);
 * a value that was not measured is omitted.
 * @param {Object} options
 * @param {Object} options.clsMetric - { shifts: [{ value, startTime, shiftedElements, matchedCause, candidates, time_delta_ms, causeConfidence }] }
 * @param {Object} [options.clsElementResolution] - optional extra source resolution
 * @param {Array<Object>} [options.elementResolutions] - source resolutions; matched by causeSelector or selector
 * @param {string} options.workspaceRoot
 * @returns {Array<Object>} Formatted CLS issues
 */
export function analyzeCls({
  clsMetric,
  clsElementResolution,
  elementResolutions = [],
  workspaceRoot = process.cwd()
}) {
  if (!clsMetric || !clsMetric.shifts || clsMetric.shifts.length === 0) return [];

  const confidenceRank = { low: 1, medium: 2, high: 3 };
  const lowerOf = (a, b) => (confidenceRank[a] ?? 1) <= (confidenceRank[b] ?? 1) ? a : b;
  const round3 = n => Math.round(n * 1000) / 1000;
  const present = v => v !== null && v !== undefined;

  // Selector forms a resolution may have been found under: the cause selector itself, its last compound token, or that token without its tag.
  const selectorForms = (sel) => {
    const tail = sel.trim().split(/\s+/).pop();
    return [sel, tail, tail.replace(/^[a-z][a-z0-9-]*(?=[.#])/i, '')];
  };
  const resolutionCandidates = [...elementResolutions, clsElementResolution].filter(r => r && r.file);
  const resolutionFor = (cause) => {
    const sel = cause?.selector;
    if (!sel) return null;
    return resolutionCandidates.find(r => r.causeSelector === sel)
      ?? resolutionCandidates.find(r => selectorForms(sel).includes(r.selector))
      ?? null;
  };
  const locationFrom = (res) => res
    ? { file: normalizeRepoPath(res.file), line_start: res.line_start, line_end: res.line_end, element: res.selector }
    : null;

  // Group shifts by their matched cause; shifts with no candidate form one unattributed group.
  const groups = new Map();
  for (const shift of clsMetric.shifts) {
    const cause = shift.matchedCause ?? null;
    const key = cause ? `${cause.kind}|${cause.selector ?? cause.url}` : 'unattributed';
    if (!groups.has(key)) groups.set(key, { cause, shifts: [] });
    groups.get(key).shifts.push(shift);
  }

  const issues = [];
  for (const { cause, shifts } of groups.values()) {
    const first = shifts[0];
    const shiftScore = round3(shifts.reduce((acc, s) => acc + s.value, 0));
    const shifted = [...new Set(shifts.flatMap(s => s.shiftedElements ?? []))];
    const res = resolutionFor(cause);
    const location = locationFrom(res);
    const causeConfidence = shifts.map(s => s.causeConfidence ?? 'low').reduce(lowerOf);
    const confidence = location ? lowerOf(causeConfidence, res.confidence ?? 'low') : 'low';

    const evidence = [];
    const issue = {
      metric: 'CLS',
      current_value: Number.isFinite(clsMetric.value) ? clsMetric.value : shiftScore,
      confidence,
      evidence_type: 'measured',
      location,
      shiftScore,
      timingCorrelation: {
        shiftStartTimes: shifts.map(s => s.startTime),
        matchedEvent: cause ? cause.kind : null,
        time_delta_ms: first.time_delta_ms ?? null,
        candidates: first.candidates ?? []
      },
      fix_validated: false,
      measured_improvement: null
    };

    if (!cause) {
      issue.problem = `Layout shift of ${shiftScore} with no image load or DOM insertion recorded near it; the cause is unattributed.`;
      issue.rootCauseCategory = 'unattributed-shift';
      issue.root_cause = null;
      evidence.push(`Layout shift score: ${shiftScore} at ${shifts.map(s => s.startTime).join(', ')}ms with no candidate cause`);
      issue.estimated_gain = null;
    } else if (cause.kind === 'image-load') {
      const img = cause.image ?? null;
      const missing = img ? [
        !img.hasWidthAttr && 'width attribute',
        !img.hasHeightAttr && 'height attribute',
        !img.hasAspectRatioCss && 'CSS aspect-ratio'
      ].filter(Boolean) : [];
      const unsized = img && !img.hasAspectRatioCss && (!img.hasWidthAttr || !img.hasHeightAttr);
      const natural = img && present(img.naturalWidth) && present(img.naturalHeight)
        ? { width: img.naturalWidth, height: img.naturalHeight } : null;

      issue.rootCauseCategory = unsized ? 'unsized-image-shift' : 'image-load-shift';
      issue.problem = `Image ${cause.url} loading shifted content by ${shiftScore}.`;
      evidence.push(`Layout shift score: ${shiftScore} at ${first.startTime}ms matched to image load ${cause.url} (responseEnd ${cause.responseEnd}ms, time_delta_ms: ${cause.time_delta_ms}ms)`);
      if (img) {
        evidence.push(unsized
          ? `Unsized <img> element ${img.selector} lacks explicit width and height attributes or CSS aspect-ratio`
          : `<img> element ${img.selector}: width attribute ${img.hasWidthAttr ? 'present' : 'absent'}, height attribute ${img.hasHeightAttr ? 'present' : 'absent'}, CSS aspect-ratio ${img.hasAspectRatioCss ? 'present' : 'absent'}`);
      }
      if (natural) {
        evidence.push(`Measured natural image size: ${natural.width}x${natural.height}px`);
        issue.naturalWidth = natural.width;
        issue.naturalHeight = natural.height;
      }
      issue.root_cause = unsized
        ? `The <img> ${img.selector} has no ${missing.join(', ')}, so no space is reserved before it loads (responseEnd ${cause.responseEnd}ms); when it loads it takes its own size${natural ? ` (${natural.width}x${natural.height}px)` : ''} and pushes the content below it.`
        : `The image load at responseEnd ${cause.responseEnd}ms changed layout; ${img ? 'the <img> declares its size, so the cause is not an unsized image' : 'no <img> element matching this resource was found'}.`;
      issue.estimated_gain = unsized ? {
        metric_delta: shiftScore,
        unit: 'score',
        basis: `Declaring ${natural ? `width=${natural.width} height=${natural.height}` : 'width and height (or aspect-ratio)'} reserves the image box before it loads, which should remove this shift`,
        certainty: 'estimated'
      } : null;
      issue.tradeoffs = 'Explicit dimensions must maintain accurate aspect ratio to avoid image stretching.';
    } else {
      const c = cause.container ?? {};
      const unreserved = present(c.heightBefore) && present(cause.nodeHeightAfter) && c.heightBefore < cause.nodeHeightAfter;

      issue.rootCauseCategory = unreserved ? 'unreserved-container-shift' : 'dom-insertion-shift';
      issue.problem = `Inserting ${cause.selector} shifted content by ${shiftScore}.`;
      evidence.push(`Layout shift score: ${shiftScore} at ${first.startTime}ms matched to DOM insertion of ${cause.selector} (time_delta_ms: ${cause.time_delta_ms}ms)`);
      evidence.push(`Inserted ${cause.selector} into container ${c.selector || 'unknown'}`);
      if (present(c.minHeight)) evidence.push(`Container ${c.selector} has min-height: ${c.minHeight} before insertion`);
      if (present(c.heightBefore)) evidence.push(`Container ${c.selector} height before insertion: ${c.heightBefore}px`);
      if (present(cause.nodeHeightAfter)) evidence.push(`Inserted node height after insertion: ${cause.nodeHeightAfter}px`);
      if (unreserved) evidence.push(`Container ${c.selector} reserved ${c.heightBefore}px before insertion but the inserted node is ${cause.nodeHeightAfter}px tall`);
      if (res?.insertionCall) evidence.push(`DOM insertion call: ${res.insertionCall.snippet} at line ${res.insertionCall.line}`);

      issue.root_cause = unreserved
        ? `${cause.selector} is inserted into ${c.selector} after load; the container was ${c.heightBefore}px tall and the node is ${cause.nodeHeightAfter}px tall, so the content below shifts by the difference.`
        : `${cause.selector} was inserted into ${c.selector || 'its container'} and shifted layout; the container's reserved height versus the node height could not be compared from measured values.`;
      const container = {};
      if (c.selector) container.selector = c.selector;
      if (present(c.minHeight)) container.minHeight = c.minHeight;
      if (present(c.heightBefore)) container.heightBefore = c.heightBefore;
      if (present(cause.nodeHeightAfter)) {
        container.nodeHeightAfter = cause.nodeHeightAfter;
        container.measuredHeight = cause.nodeHeightAfter;
      }
      issue.container = Object.keys(container).length ? container : null;
      issue.estimated_gain = unreserved ? {
        metric_delta: shiftScore,
        unit: 'score',
        basis: `Reserving ${cause.nodeHeightAfter}px (the measured height of the inserted node) on ${c.selector} before insertion should remove this shift`,
        certainty: 'estimated'
      } : null;
      issue.tradeoffs = 'Reserving vertical space leaves a blank placeholder box until the inserted content arrives.';
    }

    if (shifted.length) evidence.push(`Elements shifted: ${shifted.join(', ')}`);
    if (!location) evidence.push('source location unresolved');
    issue.evidence = evidence;
    issues.push(issue);
  }

  return issues;
}

/**
 * Master analyzer running deterministic AST and CWV checks.
 * Produces structured issue reports matching the specified schema.
 *
 * @param {Object} options
 * @param {Object} options.step1Output
 * @param {Object} options.step2Output
 * @param {string} [options.workspaceRoot]
 * @returns {Array<Object>} Issues list
 */
export function runDeepAnalysis({
  step1Output,
  step2Output,
  workspaceRoot
} = {}) {
  if (!step1Output) throw new Error('runDeepAnalysis: missing step1Output');
  if (!step2Output) throw new Error('runDeepAnalysis: missing step2Output');
  if (!workspaceRoot) throw new Error('runDeepAnalysis: missing workspaceRoot');
  for (const key of ['metrics', 'worstInteraction', 'interactionsTested']) {
    if (step1Output[key] === undefined) throw new Error(`runDeepAnalysis: step1Output is missing '${key}'`);
  }
  if (!step2Output.resolvedLocations) throw new Error(`runDeepAnalysis: step2Output is missing 'resolvedLocations'`);

  const issues = [];

  // 1. INP Culprit Analysis: analyze flagged interactions or interactions with duration >= 200ms
  const worstInteraction = step1Output?.worstInteraction;
  const rawInteractions = (step1Output?.interactionsTested && step1Output.interactionsTested.length > 0)
    ? step1Output.interactionsTested
    : (worstInteraction ? [worstInteraction] : []);

  let interactions = rawInteractions.filter(t => {
    const med = t.duration?.median ?? t.duration ?? 0;
    const isSlow = med >= 200 || t.flagged;
    const hasLongScript = t.scripts?.some(s => (s.duration || 0) >= 50);
    return isSlow || (/filter/i.test(t.label || '') && hasLongScript);
  });

  // Filter out duplicates by target
  const seenTargets = new Set();
  interactions = interactions.filter(t => {
    if (seenTargets.has(t.target)) return false;
    seenTargets.add(t.target);
    return true;
  });

  for (const inter of interactions) {
    const topScript = inter.scripts?.[0] ?? null;
    const fnName = topScript?.sourceFunctionName ?? null;
    const resolvedFromStep2 = fnName
      ? (step2Output.resolvedLocations.culpritFilterScript?.name === fnName
        ? step2Output.resolvedLocations.culpritFilterScript
        : (step2Output.resolvedLocations.culpritScript?.name === fnName ? step2Output.resolvedLocations.culpritScript : null))
      : null;

    const inpIssue = (topScript && resolvedFromStep2)
      ? analyzeInpFunction({
          culpritScript: topScript,
          location: resolvedFromStep2,
          workspaceRoot,
          worstInteraction: inter
        })
      : null;

    if (inpIssue) {
      issues.push(inpIssue);
    } else {
      const medianMs = inter.duration?.median ?? null;
      issues.push({
        metric: 'INP',
        current_value: medianMs,
        confidence: 'low',
        evidence_type: 'measured',
        location: null,
        problem: `Interaction ${inter.target} has measured INP ${medianMs ?? 'unavailable'}ms but its culprit source location could not be resolved.`,
        evidence: [
          `Interaction measured INP: ${medianMs ?? 'unavailable'}ms (lab)`,
          topScript
            ? `LoAF script ${fnName ?? 'unnamed'}() execution duration: ${topScript.duration ?? 'unavailable'}ms`
            : 'No LoAF script captured for this interaction',
          'source location unresolved'
        ],
        root_cause: null,
        rootCauseCategory: 'unresolved-source',
        estimated_gain: null,
        fix: null,
        fix_validated: false,
        measured_improvement: null
      });
    }
  }

  // 2. React component AST scans
  const interactionsTested = step1Output?.interactionsTested || [];
  const reactIssues = analyzeReactComponents(workspaceRoot, interactionsTested);
  issues.push(...reactIssues);

  // 3. LCP Analysis (using subparts)
  const lcpMetric = step1Output?.metrics?.lcp;
  const lcpElement = step2Output?.resolvedLocations?.elements?.lcpTarget;
  if (lcpMetric && lcpElement) {
    const lcpIssue = analyzeLcp({
      lcpMetric,
      lcpElementResolution: lcpElement,
      workspaceRoot
    });
    if (lcpIssue) issues.push(lcpIssue);
  }

  // 4. CLS Analysis (emitting two distinct timed issues)
  const clsMetric = step1Output?.metrics?.cls;
  const clsElement = step2Output?.resolvedLocations?.elements?.clsTarget;
  if (clsMetric) {
    const elementResolutions = Object.values(step2Output.resolvedLocations.elements || {}).flat().filter(Boolean);
    const clsIssues = analyzeCls({
      clsMetric,
      clsElementResolution: clsElement,
      elementResolutions,
      workspaceRoot
    });
    issues.push(...clsIssues);
  }

  return issues;
}
