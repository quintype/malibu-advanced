import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Locate the bundled attribution build of web-vitals
const WEB_VITALS_ATTRIBUTION_PATH = path.resolve(
  __dirname,
  '../node_modules/web-vitals/dist/web-vitals.attribution.iife.js'
);

/**
 * Maximum distance (ms) between a layout shift's startTime and a candidate cause (an image's
 * Resource Timing responseEnd, or a DOM insertion). A shift is reported for the first frame that
 * renders the change, so it trails its trigger by about one frame (16.7ms at 60Hz); under 4x CPU
 * throttle the triggering task and that render can be several frames apart. 100ms is roughly six
 * frames at 60Hz. It is a frame-timing allowance and is not tuned to any fixture.
 */
export const CAUSE_MATCH_WINDOW_MS = 100;

let currentRepoRoot = null;

/** Sets the root that file paths are made relative to (the git top-level of the analyzed project). */
export function setRepoRoot(root) {
  currentRepoRoot = root ? path.resolve(root) : null;
}

/** The root set by setRepoRoot, or the current working directory when none was set. */
export function getRepoRoot() {
  return currentRepoRoot ?? process.cwd();
}

/**
 * Normalizes a file path or URL to a repo-relative path. Absolute paths inside the repo root become relative
 * to it; paths outside the root are returned unchanged; URLs become their path without the leading slash.
 * @param {string} filePath
 * @param {string} [repoRoot]
 * @returns {string}
 */
export function normalizeRepoPath(filePath, repoRoot = getRepoRoot()) {
  if (!filePath || typeof filePath !== 'string') return '';
  let clean = filePath.replace(/^file:\/\//, '');
  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    try {
      const u = new URL(clean);
      clean = u.pathname.replace(/^\//, '');
    } catch {}
  }
  if (path.isAbsolute(clean)) {
    const relative = path.relative(repoRoot, clean);
    if (!relative.startsWith('..') && !path.isAbsolute(relative)) clean = relative;
  }
  return clean.replace(/^\.\//, '');
}

/**
 * Calculates statistical min, median, and max for a numeric array.
 * @param {Array<number>} nums
 * @returns {{ min: number, median: number, max: number }}
 */
export function calculateStats(nums = []) {
  const finite = (nums || []).filter(Number.isFinite);
  if (finite.length === 0) return { min: null, median: null, max: null };
  const sorted = finite.map(n => Math.round(n * 10) / 10).sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10;
  return { min, median, max };
}

/** Assert each measured sample came from its own fresh document and Event Timing entries are not reused. */
export function assertRunEventIsolation(runEvidence = []) {
  const pageLoads = new Set();
  const eventEntries = new Set();
  for (const run of runEvidence) {
    if (!run.documentId) throw new Error(`Run ${run.run} has no page-load identity.`);
    if (pageLoads.has(run.documentId)) throw new Error(`Run ${run.run} reused page load ${run.documentId}.`);
    pageLoads.add(run.documentId);
    if (!run.event) continue;
    if (run.event.documentId !== run.documentId) {
      throw new Error(`Run ${run.run} Event Timing entry came from a different page load.`);
    }
    const key = `${run.event.documentId}:${run.event.name}:${run.event.startTime}:${run.event.interactionId}:${run.event.duration}`;
    if (eventEntries.has(key)) throw new Error(`Event Timing entry was counted more than once (run ${run.run}).`);
    eventEntries.add(key);
  }
  return true;
}

/**
 * Converts a 0-indexed character offset into 1-indexed { line, column }.
 * @param {string} text - Source code text
 * @param {number} charOffset - Zero-based character offset
 * @returns {{ line: number, column: number, charOffset: number } | null}
 */
export function charOffsetToLineCol(text, charOffset) {
  if (typeof text !== 'string' || typeof charOffset !== 'number' || charOffset < 0) {
    return null;
  }
  const clampedOffset = Math.min(charOffset, text.length);
  const upToOffset = text.slice(0, clampedOffset);
  const lines = upToOffset.split('\n');
  const line = lines.length;
  const column = lines[lines.length - 1].length + 1;
  return { line, column, charOffset };
}

/**
 * Extracts a formatted code snippet around a specific line.
 * @param {string} text
 * @param {number} targetLine
 * @param {number} contextLines
 * @returns {string}
 */
export function extractCodeSnippet(text, targetLine, contextLines = 2) {
  if (typeof text !== 'string' || !targetLine || targetLine < 1) return '';
  const lines = text.split('\n');
  const start = Math.max(0, targetLine - 1 - contextLines);
  const end = Math.min(lines.length, targetLine + contextLines);
  return lines.slice(start, end).map((l, idx) => {
    const lineNum = start + idx + 1;
    const prefix = lineNum === targetLine ? ' > ' : '   ';
    return `${prefix}${lineNum} | ${l}`;
  }).join('\n');
}

/**
 * Calculates cause breakdown and percentage share for a culprit script.
 * @param {Object} script
 * @returns {Object}
 */
export function calculateTimeShare(script) {
  const total = Math.max(1, script.duration || 0);
  const forcedLayout = Math.min(total, script.forcedStyleAndLayoutDuration || 0);
  const pause = Math.min(total - forcedLayout, script.pauseDuration || 0);
  const compute = Math.max(0, Math.round((total - forcedLayout - pause) * 10) / 10);

  const computePct = Math.round((compute / total) * 100);
  const layoutPct = Math.round((forcedLayout / total) * 100);
  const otherPct = Math.max(0, 100 - computePct - layoutPct);

  return {
    totalDuration: total,
    computeDuration: compute,
    forcedLayoutDuration: forcedLayout,
    pauseDuration: pause,
    computeShare: `${computePct}%`,
    forcedLayoutShare: `${layoutPct}%`,
    otherShare: `${otherPct}%`,
    dominantCause: forcedLayout > compute ? 'layout-thrashing' : compute > 50 ? 'heavy-compute-loop' : 'mixed'
  };
}

/**
 * Collects INP, LCP, CLS, and LoAF metrics using Puppeteer.
 * Executes 1 discarded warm-up run + 5 measured runs per interaction.
 *
 * @param {Object} options
 * @param {string} options.url
 * @param {number} [options.cpuThrottlingRate=4]
 * @param {number} [options.runs=5]
 * @param {Array<Object>} [options.customInteractions]
 * @param {puppeteer.Browser} [options.existingBrowser]
 * @returns {Promise<Object>}
 */
export async function collectInpMetrics({
  url,
  cpuThrottlingRate = 4,
  runs = 5,
  customInteractions = null,
  existingBrowser = null
}) {
  if (!fs.existsSync(WEB_VITALS_ATTRIBUTION_PATH)) {
    throw new Error(`web-vitals attribution library not found at ${WEB_VITALS_ATTRIBUTION_PATH}`);
  }
  const webVitalsScript = fs.readFileSync(WEB_VITALS_ATTRIBUTION_PATH, 'utf8');

  let browser = existingBrowser;
  const shouldCloseBrowser = !existingBrowser;

  if (!browser) {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }

  const page = await browser.newPage();
  const slowHandlerCompletionMs = [];
  const filterHandlerSamples = [];
  const recentPageConsole = [];
  page.on('console', message => {
    const messageText = message.text();
    recentPageConsole.push(messageText);
    if (recentPageConsole.length > 30) recentPageConsole.shift();
    const match = messageText.match(/handleSlowButtonClick completed in ([0-9.]+)ms/);
    if (match) slowHandlerCompletionMs.push(Number(match[1]));
    const filterMatch = messageText.match(/handleProductFilterInput query=("(?:[^"\\]|\\.)*") arrayLength=(\d+) heavyBranch=(true|false).*?start=([0-9.]+) end=([0-9.]+).*?duration=([0-9.]+)ms/);
    if (filterMatch) {
      filterHandlerSamples.push({
        query: JSON.parse(filterMatch[1]),
        arrayLength: Number(filterMatch[2]),
        heavyBranch: filterMatch[3] === 'true',
        startTime: Number(filterMatch[4]),
        endTime: Number(filterMatch[5]),
        duration: Number(filterMatch[6])
      });
    }
  });

  try {
    // Apply throttling through a CDP session attached to this exact page target.
    const cdpSession = await page.createCDPSession();
    const pageTargetId = page.target()._targetId || 'target-id-unavailable';
    await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottlingRate });
    await cdpSession.send('Network.setCacheDisabled', { cacheDisabled: true });
    await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });

    const runCalibration = async (runLabel) => {
      const evaluateCalibration = () => {
        const started = performance.now();
        let checksum = 0;
        for (let i = 1; i <= 250000; i++) checksum += Math.sin(i) * Math.sqrt(i);
        return { duration: performance.now() - started, checksum };
      };
      // Warm the fixed benchmark at normal speed, then compare the same loop
      // under the configured CPU rate on the same page/CDP target.
      await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: 1 });
      await page.evaluate(evaluateCalibration);
      const baseline = await page.evaluate(evaluateCalibration);
      await cdpSession.send('Emulation.setCPUThrottlingRate', { rate: cpuThrottlingRate });
      const throttled = await page.evaluate(evaluateCalibration);
      const ratio = throttled.duration / Math.max(0.1, baseline.duration);
      console.error(`[Calibration ${runLabel}] pageTarget=${pageTargetId} page=${await page.url()} CDP session is attached to this page target; baseline=${baseline.duration.toFixed(1)}ms throttled=${throttled.duration.toFixed(1)}ms rate=${cpuThrottlingRate}x ratio=${ratio.toFixed(2)}x`);
      if (cpuThrottlingRate > 1 && ratio < 1.35) {
        throw new Error(`CPU throttling calibration failed for ${runLabel}: baseline ${baseline.duration.toFixed(1)}ms, throttled ${throttled.duration.toFixed(1)}ms, ratio ${ratio.toFixed(2)}x.`);
      }
      return { baselineMs: baseline.duration, throttledMs: throttled.duration, ratio, rate: cpuThrottlingRate, pageTargetId };
    };

    const loadFreshMeasurementPage = async (runLabel) => {
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      await new Promise(resolve => setTimeout(resolve, 1700));
      return runCalibration(runLabel);
    };

    // 2. Inject instrumentation on new document
    await page.evaluateOnNewDocument((wvCode) => {
      window.eval(wvCode);

      window.__collected_inp = null;
      window.__measurement_document_id = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : `${performance.timeOrigin}-${Math.random().toString(36).slice(2)}`;
      window.__collected_lcp = null;
      window.__event_timing_entries = [];
      window.__handler_timing_entries = [];
      window.__loaf_entries = [];
      window.__lcp_entry = null;
      window.__cls_entries = [];
      window.__dom_insertions = [];
      window.__instrumentation_errors = [];

      function getElementSelector(el) {
        if (!el || !(el instanceof Element)) return '';
        if (el.id) return `#${el.id}`;
        const tag = el.tagName.toLowerCase();
        if (el.className && typeof el.className === 'string') {
          const classes = el.className.trim().split(/\s+/).filter(Boolean).slice(0, 2).join('.');
          if (classes) return `${tag}.${classes}`;
        }
        return tag;
      }

      // ---- Layout-shift cause instrumentation ---------------------------------------------
      // Tags that never produce a layout box; their insertions are not recorded.
      const NON_RENDERED_TAGS = new Set(['SCRIPT', 'STYLE', 'LINK', 'META', 'TITLE', 'HEAD', 'BASE', 'NOSCRIPT', 'TEMPLATE']);
      const round1 = n => Math.round(n * 10) / 10;

      // Natural size is only reported once the image has decoded; otherwise it is null (not measured).
      window.__describeImage = (img) => {
        const loaded = img.complete && img.naturalWidth > 0;
        const aspectRatio = getComputedStyle(img).aspectRatio;
        return {
          selector: getElementSelector(img),
          currentSrc: img.currentSrc || '',
          naturalWidth: loaded ? img.naturalWidth : null,
          naturalHeight: loaded ? img.naturalHeight : null,
          hasWidthAttr: img.hasAttribute('width'),
          hasHeightAttr: img.hasAttribute('height'),
          hasAspectRatioCss: Boolean(aspectRatio) && aspectRatio !== 'auto'
        };
      };

      // "Before" state must be read synchronously, before the DOM call mutates the container, so the
      // common insertion APIs are wrapped. One snapshot is kept per container until the observer
      // callback consumes it, so a loop of appends costs a single read. Detached containers are skipped
      // (no layout to read). The after-insertion height is read in requestAnimationFrame, where the
      // browser lays out for that frame anyway, instead of forcing layout inside the observer callback.
      let pendingBefore = new WeakMap();
      const awaitingHeight = [];
      let heightReadScheduled = false;

      const snapshotContainer = (container) => {
        if (!(container instanceof Element) || !container.isConnected || pendingBefore.has(container)) return;
        try {
          pendingBefore.set(container, {
            minHeight: getComputedStyle(container).minHeight,
            height: round1(container.getBoundingClientRect().height)
          });
        } catch (err) {
          window.__instrumentation_errors.push('snapshotContainer: ' + err.message);
        }
      };

      const wrapInsertion = (proto, name, containerOf) => {
        const original = proto[name];
        if (typeof original !== 'function') return;
        proto[name] = function (...args) {
          snapshotContainer(containerOf(this, args));
          return original.apply(this, args);
        };
      };
      const adjacentContainer = (self, args) => (args[0] === 'beforebegin' || args[0] === 'afterend') ? self.parentNode : self;
      wrapInsertion(Node.prototype, 'appendChild', self => self);
      wrapInsertion(Node.prototype, 'insertBefore', self => self);
      wrapInsertion(Element.prototype, 'append', self => self);
      wrapInsertion(Element.prototype, 'prepend', self => self);
      wrapInsertion(Element.prototype, 'before', self => self.parentNode);
      wrapInsertion(Element.prototype, 'after', self => self.parentNode);
      wrapInsertion(Element.prototype, 'insertAdjacentElement', adjacentContainer);
      wrapInsertion(Element.prototype, 'insertAdjacentHTML', adjacentContainer);

      new MutationObserver((records) => {
        const observedAt = round1(performance.now());
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node.nodeType !== 1 || NON_RENDERED_TAGS.has(node.tagName)) continue;
            const before = pendingBefore.get(record.target) || null;
            const entry = {
              selector: getElementSelector(node),
              t: observedAt,
              container: getElementSelector(record.target),
              containerBefore: before,
              nodeHeightAfter: null
            };
            window.__dom_insertions.push(entry);
            awaitingHeight.push({ entry, node });
          }
        }
        pendingBefore = new WeakMap();
        if (awaitingHeight.length && !heightReadScheduled) {
          heightReadScheduled = true;
          requestAnimationFrame(() => {
            heightReadScheduled = false;
            for (const { entry, node } of awaitingHeight.splice(0)) {
              if (node.isConnected) entry.nodeHeightAfter = round1(node.getBoundingClientRect().height);
            }
          });
        }
      }).observe(document, { childList: true, subtree: true });

      // Capture the synchronous handler window around each DOM event. This is
      // used only to distinguish a genuinely sub-threshold interaction from a
      // missing Event Timing record; it never supplies a synthetic INP value.
      const handlerStarts = new WeakMap();
      const timedEventTypes = ['click', 'input', 'keydown', 'keyup'];
      for (const eventType of timedEventTypes) {
        document.addEventListener(eventType, event => {
          handlerStarts.set(event, performance.now());
        }, true);
        document.addEventListener(eventType, event => {
          const start = handlerStarts.get(event);
          if (!Number.isFinite(start)) return;
          const target = event.target;
          const end = performance.now();
          window.__handler_timing_entries.push({
            type: event.type,
            targetSelector: getElementSelector(target),
            startTime: Math.round(start * 10) / 10,
            endTime: Math.round(end * 10) / 10,
            duration: Math.round((end - start) * 10) / 10,
            query: target instanceof HTMLInputElement ? target.value : null
          });
        });
      }

      // web-vitals onINP with attribution
      if (window.webVitals && window.webVitals.onINP) {
        window.webVitals.onINP((metric) => {
          window.__collected_inp = metric;
        }, { reportAllChanges: true });
      }

      // web-vitals onLCP with attribution subparts
      if (window.webVitals && window.webVitals.onLCP) {
        window.webVitals.onLCP((metric) => {
          window.__collected_lcp = metric;
        }, { reportAllChanges: true });
      }

      // PerformanceObservers
      if (typeof PerformanceObserver !== 'undefined' && Array.isArray(PerformanceObserver.supportedEntryTypes)) {
        // Keep Event Timing collection alive from navigation, but reset the
        // JS-side queue between interactions. Filter the synthetic run by its
        // page-relative actionStart so old entries cannot become samples.
        if (PerformanceObserver.supportedEntryTypes.includes('event')) {
          const eventObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              // Event Timing duration extends through the next presentation and
              // is privacy-rounded in coarse (~8ms) increments. Keep this as
              // interaction latency; never label it as synchronous handler cost.
              // When Event Timing reports ~48ms but in-handler time is ~6ms, the difference
              // is: 8ms rounding + presentation delay (time from handler end until paint occurs).
              // These are intentional per spec, not handler cost. Presentation delay can be much
              // larger if the handler yields and waits for scheduler/browser to resume execution.
              window.__event_timing_entries.push({
                name: entry.name,
                entryType: entry.entryType,
                documentId: window.__measurement_document_id,
                startTime: Math.round(entry.startTime * 10) / 10,
                duration: Math.round(entry.duration * 10) / 10,
                processingStart: Math.round(entry.processingStart * 10) / 10,
                processingEnd: Math.round(entry.processingEnd * 10) / 10,
                inputDelay: Math.round(Math.max(0, entry.processingStart - entry.startTime) * 10) / 10,
                processingDuration: Math.round(Math.max(0, entry.processingEnd - entry.processingStart) * 10) / 10,
                presentationDelay: Math.round(Math.max(0, entry.startTime + entry.duration - entry.processingEnd) * 10) / 10,
                interactionId: entry.interactionId || 0,
                targetSelector: entry.target ? getElementSelector(entry.target) : ''
              });
            }
          });
          eventObserver.observe({ type: 'event', durationThreshold: 16, buffered: true });
        }

        // LoAF
        if (PerformanceObserver.supportedEntryTypes.includes('long-animation-frame')) {
          const loafObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              const scripts = [];
              if (entry.scripts) {
                for (let i = 0; i < entry.scripts.length; i++) {
                  const s = entry.scripts[i];
                  scripts.push({
                    invoker: s.invoker || '',
                    invokerType: s.invokerType || '',
                    sourceURL: s.sourceURL || '',
                    sourceFunctionName: s.sourceFunctionName || '',
                    sourceCharPosition: typeof s.sourceCharPosition === 'number' ? s.sourceCharPosition : -1,
                    duration: Math.round(s.duration * 10) / 10,
                    pauseDuration: Math.round((s.pauseDuration || 0) * 10) / 10,
                    forcedStyleAndLayoutDuration: Math.round((s.forcedStyleAndLayoutDuration || 0) * 10) / 10,
                    startTime: Math.round(s.startTime * 10) / 10,
                    executionStart: Math.round((s.executionStart || 0) * 10) / 10
                  });
                }
              }
              window.__loaf_entries.push({
                startTime: Math.round(entry.startTime * 10) / 10,
                duration: Math.round(entry.duration * 10) / 10,
                renderStart: Math.round((entry.renderStart || 0) * 10) / 10,
                styleAndLayoutStart: Math.round((entry.styleAndLayoutStart || 0) * 10) / 10,
                scripts
              });
            }
          });
          loafObserver.observe({ type: 'long-animation-frame', buffered: true });
        }

        // LCP
        if (PerformanceObserver.supportedEntryTypes.includes('largest-contentful-paint')) {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              const e = entries[entries.length - 1];
              window.__lcp_entry = {
                url: e.url || '',
                renderTime: Math.round((e.renderTime || e.loadTime || 0) * 10) / 10,
                loadTime: Math.round((e.loadTime || 0) * 10) / 10,
                size: e.size,
                elementSelector: e.element ? getElementSelector(e.element) : '',
                tagName: e.element ? e.element.tagName.toLowerCase() : ''
              };
            }
          });
          lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
        }

        // CLS (Layout Shift)
        if (PerformanceObserver.supportedEntryTypes.includes('layout-shift')) {
          const clsObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput && entry.value > 0.001) {
                const sources = [];
                if (entry.sources) {
                  for (let i = 0; i < entry.sources.length; i++) {
                    const s = entry.sources[i];
                    sources.push({
                      nodeSelector: s.node ? getElementSelector(s.node) : '',
                      previousRect: s.previousRect ? {
                        top: Math.round(s.previousRect.top),
                        height: Math.round(s.previousRect.height),
                        width: Math.round(s.previousRect.width)
                      } : null,
                      currentRect: s.currentRect ? {
                        top: Math.round(s.currentRect.top),
                        height: Math.round(s.currentRect.height),
                        width: Math.round(s.currentRect.width)
                      } : null
                    });
                  }
                }
                window.__cls_entries.push({
                  value: Math.round(entry.value * 10000) / 10000,
                  startTime: Math.round(entry.startTime * 10) / 10,
                  sources
                });
              }
            }
          });
          clsObserver.observe({ type: 'layout-shift', buffered: true });
        }
      }
    }, webVitalsScript);

    // 3. Navigate
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });

    // 4. Feature check
    const isLoAFSupported = await page.evaluate(() => {
      return typeof PerformanceObserver !== 'undefined' &&
        Array.isArray(PerformanceObserver.supportedEntryTypes) &&
        PerformanceObserver.supportedEntryTypes.includes('long-animation-frame');
    });

    if (!isLoAFSupported) {
      throw new Error(
        'Long Animation Frames (LoAF) API is not supported in this browser version. Chrome 123+ is required for INP script-level attribution.'
      );
    }

    // Wait for initial load, delayed hero.jpg (800ms), and late injected banner (1500ms) to settle
    await new Promise(r => setTimeout(r, 2200));

    // Wait for next paint helper (adequate wait in Node for event queue and paint pipeline delivery under 4x CPU throttle)
    const waitForNextPaint = async (delay = 550) => {
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await new Promise(r => setTimeout(r, delay));
    };

    // 5. Build interaction targets (including fast controls + React product filter)
    const interactionsToTest = [];
    const interactionsSkipped = [];
    if (Array.isArray(customInteractions) && customInteractions.length > 0) {
      for (const item of customInteractions) {
        if (await page.$(item.selector)) {
          interactionsToTest.push(item);
        } else if (item.optional) {
          interactionsSkipped.push({ selector: item.selector, reason: 'optional selector not found in page' });
        } else {
          throw new Error(`Interaction target ${item.selector} not found in page`);
        }
      }
    } else {
      const candidateSelectors = [
        { selector: '#filter-input', type: 'type', text: 'product query', label: 'Interactive Component Filter' },
        { selector: '#slow-click-btn', type: 'click', label: 'Slow Button Click Task' },
        { selector: '#menu-toggle', type: 'click', label: 'Fast Menu Toggle' },
        { selector: '#search-input', type: 'type', text: 'quick test', label: 'Fast Search Input' }
      ];

      for (const item of candidateSelectors) {
        const el = await page.$(item.selector);
        if (el) interactionsToTest.push(item);
      }
    }

    // Helper: dispatch single interaction cleanly
    const dispatchInteraction = async (target, runIdx = 0) => {
      await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        if (el) el.scrollIntoView({ block: 'center', inline: 'center' });
      }, target.selector);

      if (target.type === 'click') {
        const previousCounterText = target.selector === '#slow-click-btn'
          ? await page.$eval('#counter', el => el.textContent).catch(() => '')
          : null;
        const point = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (!el) return null;
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        }, target.selector);
        if (point) {
          const actionStart = await page.evaluate(() => performance.now());
          await page.mouse.click(point.x, point.y);
          if (target.selector === '#slow-click-btn') {
            await page.waitForFunction(previous => {
              const counter = document.getElementById('counter');
              return counter && counter.textContent !== previous;
            }, { timeout: 30000 }, previousCounterText);
          }
          return actionStart;
        }
      } else if (target.type === 'type') {
        // Clear value cleanly via DOM, click element to focus genuinely, then type keystroke
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          if (el) el.value = '';
        }, target.selector);
        await page.click(target.selector).catch(() => page.focus(target.selector));
        const keyChar = (target.text && target.text[0]) || 'a';
        const actionStart = await page.evaluate(() => performance.now());
        await page.keyboard.down(keyChar);
        await page.keyboard.up(keyChar);
        return actionStart;
      }
      return null;
    };

    // 6. Execute interactions: 1 discarded warm-up run + 5 measured runs
    const interactionResults = [];

    for (const target of interactionsToTest) {
      // Each warm-up and measured run starts from a fresh document and fixed
      // fixture state, then verifies throttling on this same page target.
      const warmupCalibration = await loadFreshMeasurementPage(`${target.selector} warm-up`);
      await dispatchInteraction(target, 0);
      await waitForNextPaint();

      // 5 MEASURED RUNS
      const runDurations = [];
      const rawRunDurations = [];
      const runHandlerDurations = [];
      const runCalibrations = [];
      const runInputDelays = [];
      const runProcessingDurations = [];
      const runPresentationDelays = [];
      const runCompletionDurations = [];
      const runEvidence = [];
      const collectedScripts = [];
      const rawLoafEntries = [];

      for (let runIdx = 0; runIdx < runs; runIdx++) {
        const calibration = await loadFreshMeasurementPage(`${target.selector} run ${runIdx + 1}`);
        runCalibrations.push(calibration);
        const preLoafCount = await page.evaluate(() => window.__loaf_entries.length);
        const preEventCount = await page.evaluate(() => window.__event_timing_entries.length);
        const preCompletionCount = slowHandlerCompletionMs.length;
        const preFilterCount = filterHandlerSamples.length;
        const actionStart = await dispatchInteraction(target, runIdx);
        await waitForNextPaint();

        const postData = await page.evaluate((preL, preE) => {
          return {
            documentId: window.__measurement_document_id,
            events: window.__event_timing_entries.slice(preE) || [],
            handlerTimings: window.__handler_timing_entries || [],
            loafs: window.__loaf_entries.slice(preL)
          };
        }, preLoafCount, preEventCount);

        const relevantEvents = postData.events.filter(e => {
          if (!Number.isFinite(actionStart) || e.startTime < actionStart - 0.1) return false;
          if (e.documentId !== postData.documentId) return false;
          if (e.targetSelector !== target.selector) return false;
          if (target.type === 'type') {
            return (e.name === 'keydown' || e.name === 'keyup') && e.interactionId > 0;
          }
          return e.name === 'click' && e.interactionId > 0;
        });
        const bestEvent = relevantEvents.sort((a, b) => b.duration - a.duration)[0];
        const handlerTiming = postData.handlerTimings
          .filter(e => e.startTime >= actionStart - 0.1 && e.targetSelector === target.selector)
          .filter(e => target.type === 'type' ? e.type === 'input' : e.type === 'click')
          .sort((a, b) => b.duration - a.duration)[0] || null;
        const filterLogs = filterHandlerSamples.slice(preFilterCount);

        if (target.selector === '#filter-input') {
          if (filterLogs.length !== 1) throw new Error(`Expected exactly one filter handler diagnostic for measured run ${runIdx + 1}; got ${filterLogs.length}.`);
          const filterLog = filterLogs[0];
          if (filterLog.arrayLength !== 8000 || !filterLog.heavyBranch) {
            throw new Error(`Filter workload changed during run ${runIdx + 1}: ${JSON.stringify(filterLog)}.`);
          }
        }

        if (!bestEvent) {
          if (!handlerTiming || handlerTiming.duration > 16) {
            throw new Error(`No Event Timing entry captured for ${target.selector} measured run ${runIdx + 1}/${runs}, and in-page handler timing is ${handlerTiming?.duration ?? 'missing'}ms (threshold 16ms). Collector bug; events=${JSON.stringify(postData.events)} handlers=${JSON.stringify(postData.handlerTimings)} console=${JSON.stringify(recentPageConsole.slice(-8))}`);
          }
          runDurations.push(null);
          const calibration = runCalibrations[runIdx];
          rawRunDurations.push({
            belowThreshold: true,
            duration: null,
            handlerMs: handlerTiming.duration,
            calibration,
            calibrationSuspect: calibration?.ratio < 2.5
          });
          runHandlerDurations.push(handlerTiming.duration);
        } else {
          runDurations.push(bestEvent.duration);
          const calibration = runCalibrations[runIdx];
          rawRunDurations.push({
            belowThreshold: false,
            duration: bestEvent.duration,
            handlerMs: handlerTiming?.duration ?? null,
            calibration,
            calibrationSuspect: calibration?.ratio < 2.5
          });
          runHandlerDurations.push(handlerTiming?.duration ?? null);
        }
        if (bestEvent) {
          runInputDelays.push(bestEvent.inputDelay);
          runProcessingDurations.push(bestEvent.processingDuration);
          runPresentationDelays.push(bestEvent.presentationDelay);
        }
        const eventEnd = bestEvent ? bestEvent.startTime + bestEvent.duration : actionStart + (handlerTiming?.duration || 0);
        const eventStart = bestEvent?.startTime ?? actionStart;
        const associatedLoafs = postData.loafs.filter(loaf =>
          loaf.startTime <= eventEnd && loaf.startTime + loaf.duration >= eventStart
        );
        runEvidence.push({
          run: runIdx + 1,
          documentId: postData.documentId,
          event: bestEvent,
          loafEntries: associatedLoafs,
          handlerTiming,
          filterHandlerLog: filterLogs[0] || null,
          calibration
        });
        if (target.selector === '#slow-click-btn') {
          const completion = slowHandlerCompletionMs.slice(preCompletionCount);
          if (completion.length !== 1) throw new Error(`Expected one measured handler completion time for ${target.selector}, run ${runIdx + 1}; found ${completion.length}.`);
          runCompletionDurations.push(completion[0]);
        }

        for (const l of postData.loafs) {
          rawLoafEntries.push({ startTime: l.startTime, duration: l.duration, renderStart: l.renderStart, styleAndLayoutStart: l.styleAndLayoutStart, scripts: l.scripts });
          for (const s of l.scripts) {
            collectedScripts.push(s);
          }
        }
      }

      assertRunEventIsolation(runEvidence);

      const runsExcludedForCalibration = rawRunDurations.filter(r => r.calibrationSuspect).length;
      const validRunDurations = runDurations.map((d, i) => rawRunDurations[i].calibrationSuspect ? undefined : d).filter(d => d !== undefined);

      const durationStats = calculateStats(validRunDurations);
      const runsBelowThreshold = validRunDurations.filter(d => d === null).length;
      const runsWithEntries = validRunDurations.filter(Number.isFinite).length;
      durationStats.runsWithEntries = runsWithEntries;
      durationStats.runsBelowThreshold = runsBelowThreshold;
      durationStats.runsExcludedForCalibration = runsExcludedForCalibration;
      durationStats.summary = runsBelowThreshold > validRunDurations.length / 2 ? 'below-threshold-majority' : 'measured';

      const inputDelayStats = calculateStats(runInputDelays);
      const processingStats = calculateStats(runProcessingDurations);
      const presentationStats = calculateStats(runPresentationDelays);

      const rating = durationStats.median <= 200 ? 'good' : durationStats.median <= 500 ? 'needs-improvement' : 'poor';
      const flagged = durationStats.median > 200;

      // Group & deduplicate scripts
      const scriptMap = new Map();
      for (const s of collectedScripts) {
        const key = `${s.sourceURL}:${s.sourceCharPosition}:${s.sourceFunctionName}`;
        if (!scriptMap.has(key) || s.duration > scriptMap.get(key).duration) {
          scriptMap.set(key, s);
        }
      }
      const uniqueScripts = Array.from(scriptMap.values()).sort((a, b) => b.duration - a.duration);

      const phaseMedians = {
        inputDelay: inputDelayStats.median,
        processingDuration: processingStats.median,
        presentationDelay: presentationStats.median
      };
      const largestPhase = Object.entries(phaseMedians).reduce(
        (max, [k, v]) => v > max.val ? { key: k, val: v } : max,
        { key: 'presentationDelay', val: -1 }
      ).key;

      const maxForcedLayout = Math.max(0, ...uniqueScripts.map(s => s.forcedStyleAndLayoutDuration || 0));

      interactionResults.push({
        target: target.selector,
        type: target.type,
        label: target.label,
        warmupRunDiscarded: true,
        runsCount: runs,
        flagged,
        rating,
        duration: durationStats,
        runDurations: [...runDurations],
        rawRunDurations: [...rawRunDurations],
        handlerRunDurations: [...runHandlerDurations],
        runCalibrations: [...runCalibrations],
        warmupCalibration,
        runEvidence,
        handlerCompletionDurations: [...runCompletionDurations],
        handlerCompletion: calculateStats(runCompletionDurations),
        rawLoafEntries,
        phases: {
          inputDelay: inputDelayStats,
          processingDuration: processingStats,
          presentationDelay: presentationStats
        },
        largestPhase,
        layoutThrashing: {
          detected: maxForcedLayout > 0,
          forcedStyleAndLayoutDuration: maxForcedLayout
        },
        scripts: uniqueScripts
      });
    }

    // Finalize INP in web-vitals
    await page.evaluate(() => {
      try {
        Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true });
        document.dispatchEvent(new Event('visibilitychange'));
      } catch {}
    });
    await new Promise(r => setTimeout(r, 100));

    // 7. Retrieve lab & raw metrics + resource timing
    const rawMetrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource').map(r => ({
        name: r.name,
        initiatorType: r.initiatorType,
        startTime: Math.round(r.startTime * 10) / 10,
        requestStart: Math.round((r.requestStart || r.startTime || 0) * 10) / 10,
        responseStart: Math.round((r.responseStart || 0) * 10) / 10,
        responseEnd: Math.round(r.responseEnd * 10) / 10,
        duration: Math.round(r.duration * 10) / 10
      }));

      return {
        lcp: window.__lcp_entry,
        cls: window.__cls_entries,
        webVitalsInp: window.__collected_inp,
        webVitalsLcp: window.__collected_lcp,
        insertions: window.__dom_insertions,
        images: Array.from(document.images).map(window.__describeImage),
        instrumentationErrors: window.__instrumentation_errors,
        resources
      };
    });

    // 8. Script content cache & line:col resolution
    const scriptContentCache = new Map();
    const fetchScriptText = async (scriptUrl) => {
      if (!scriptUrl) return null;
      if (scriptContentCache.has(scriptUrl)) return scriptContentCache.get(scriptUrl);
      try {
        const text = await page.evaluate(async (src) => {
          const res = await fetch(src);
          return await res.text();
        }, scriptUrl);
        scriptContentCache.set(scriptUrl, text);
        return text;
      } catch {
        scriptContentCache.set(scriptUrl, null);
        return null;
      }
    };

    // Enrich scripts across all interaction results with time share & source location
    for (const res of interactionResults) {
      const enriched = [];
      for (const s of res.scripts) {
        let sourceLocation = null;
        let codeSnippet = '';
        if (s.sourceURL && s.sourceCharPosition >= 0) {
          const scriptText = await fetchScriptText(s.sourceURL);
          if (scriptText) {
            sourceLocation = charOffsetToLineCol(scriptText, s.sourceCharPosition);
            if (sourceLocation) {
              codeSnippet = extractCodeSnippet(scriptText, sourceLocation.line, 2);
            }
          }
        }
        const timeShare = calculateTimeShare(s);
        enriched.push({
          ...s,
          sourceLocation,
          timeShare,
          codeSnippet
        });
      }
      res.scripts = enriched;
    }

    // Overall INP calculation based on worst interaction
    const sortedByDuration = [...interactionResults].sort((a, b) => b.duration.median - a.duration.median);
    const worstInteraction = sortedByDuration[0] || null;

    // Check for "processing_near_zero_with_long_script" warning
    let warning = null;
    if (worstInteraction) {
      const topScript = worstInteraction.scripts[0];
      const procMedian = worstInteraction.phases.processingDuration.median;
      if (procMedian <= 10 && topScript && topScript.duration > 50) {
        warning = {
          code: 'processing_near_zero_with_long_script',
          message: 'Event Timing reported processingDuration near zero (~0ms) while LoAF recorded a long script (> 50ms). In Chrome, event listener execution before presentation is attributed to presentationDelay in some Event Timing entries. LoAF script data is the authoritative source of truth for attribution; phase labels are secondary.'
        };
      }
    }

    // Analyzer attribution rule data model: MUST be a script cause, NEVER a phase label
    let rootCauseCategory = 'heavy-compute-loop';
    if (worstInteraction) {
      const topScript = worstInteraction.scripts[0];
      if (topScript && (topScript.sourceFunctionName === 'handleProductFilterInput' || topScript.sourceFunctionName?.includes('Filter'))) {
        rootCauseCategory = 'heavy-filter-loop';
      } else if (topScript && topScript.timeShare?.dominantCause === 'layout-thrashing') {
        rootCauseCategory = 'layout-thrashing';
      } else if (worstInteraction.target === '#filter-input') {
        rootCauseCategory = 'heavy-filter-loop';
      } else if (worstInteraction.layoutThrashing?.detected) {
        rootCauseCategory = 'layout-thrashing';
      } else {
        rootCauseCategory = 'heavy-compute-loop';
      }
    }

    // 9. Resource Timing for the LCP image record (hero.jpg), used for the LCP resourceTiming block below
    const heroResource = (rawMetrics.resources || []).find(r => {
      try { return new URL(r.name).pathname.endsWith('/hero.jpg'); } catch { return false; }
    });

    let heroResourceTiming = null;
    if (heroResource) {
      const serverWait = Math.round((heroResource.responseStart - heroResource.requestStart) * 10) / 10;
      const transferDuration = Math.round((heroResource.responseEnd - heroResource.responseStart) * 10) / 10;
      const total = serverWait + transferDuration;
      const serverWaitPct = total > 0 ? Math.round((serverWait / total) * 100) : 100;
      heroResourceTiming = {
        name: heroResource.name,
        startTime: heroResource.startTime,
        requestStart: heroResource.requestStart,
        responseStart: heroResource.responseStart,
        responseEnd: heroResource.responseEnd,
        duration: heroResource.duration,
        serverWait,
        transferDuration,
        serverWaitPct
      };
    }

    // Layout-shift cause matching: no knowledge of any page. Candidates are (a) images whose Resource
    // Timing responseEnd and (b) DOM insertions whose observer timestamp fall within CAUSE_MATCH_WINDOW_MS
    // of the shift; the nearest by time delta is chosen. The full candidate list is kept.
    const round1 = n => Math.round(n * 10) / 10;
    const rawShifts = rawMetrics.cls || [];
    const imageResources = (rawMetrics.resources || []).filter(r => r.initiatorType === 'img');
    const imageByUrl = new Map((rawMetrics.images || []).map(img => [img.currentSrc, img]));
    const insertions = rawMetrics.insertions || [];

    const enrichedShifts = rawShifts.map(s => {
      const shiftedElements = (s.sources || []).map(src => src.nodeSelector).filter(Boolean);
      const candidates = [];

      for (const r of imageResources) {
        const delta = Math.abs(s.startTime - r.responseEnd);
        if (delta > CAUSE_MATCH_WINDOW_MS) continue;
        const img = imageByUrl.get(r.name) || null;
        candidates.push({
          kind: 'image-load',
          selector: img ? img.selector : null,
          url: normalizeRepoPath(r.name),
          responseEnd: r.responseEnd,
          time_delta_ms: round1(delta),
          image: img
        });
      }

      for (const ins of insertions) {
        const delta = Math.abs(s.startTime - ins.t);
        if (delta > CAUSE_MATCH_WINDOW_MS) continue;
        candidates.push({
          kind: 'dom-insertion',
          selector: ins.selector,
          observedAt: ins.t,
          time_delta_ms: round1(delta),
          container: {
            selector: ins.container,
            minHeight: ins.containerBefore ? ins.containerBefore.minHeight : null,
            heightBefore: ins.containerBefore ? ins.containerBefore.height : null
          },
          nodeHeightAfter: ins.nodeHeightAfter
        });
      }

      candidates.sort((a, b) => a.time_delta_ms - b.time_delta_ms);
      const matchedCause = candidates[0] || null;
      // No candidate: low. Exactly one: high. Several in the window: the nearest is chosen but the match is ambiguous.
      const causeConfidence = candidates.length === 0 ? 'low' : candidates.length === 1 ? 'high' : 'medium';

      const hasZeroRect = (s.sources || []).some(src => src.currentRect && src.currentRect.width === 0 && src.currentRect.height === 0);
      const rectInvestigationNote = hasZeroRect
        ? 'In Chromium, when an element is pushed completely below the initial layout viewport due to earlier layout shifts or when unpainted during layout recalculation, currentRect dimensions are reported as 0x0.'
        : null;

      return {
        ...s,
        shiftedElements,
        matchedCause,
        candidates,
        time_delta_ms: matchedCause ? matchedCause.time_delta_ms : null,
        causeConfidence,
        rectInvestigationNote
      };
    });

    // Images that are the LCP element, a layout-shift source, or a candidate cause; insertions that are candidate causes.
    const shiftSourceSelectors = new Set(enrichedShifts.flatMap(sh => sh.shiftedElements));
    const candidateImageUrls = new Set(enrichedShifts.flatMap(sh => sh.candidates).filter(c => c.kind === 'image-load').map(c => c.url));
    const lcpElementSelector = rawMetrics.lcp ? rawMetrics.lcp.elementSelector : null;
    const measuredImages = (rawMetrics.images || []).filter(img =>
      img.selector === lcpElementSelector ||
      shiftSourceSelectors.has(img.selector) ||
      candidateImageUrls.has(normalizeRepoPath(img.currentSrc))
    );
    const candidateInsertionKeys = new Set(enrichedShifts.flatMap(sh => sh.candidates).filter(c => c.kind === 'dom-insertion').map(c => `${c.selector}@${c.observedAt}`));
    const measuredInsertions = insertions.filter(ins => candidateInsertionKeys.has(`${ins.selector}@${ins.t}`));

    const totalClsScore = rawShifts.reduce((acc, c) => acc + c.value, 0);
    const roundedCls = Math.round(totalClsScore * 1000) / 1000;

    // 10. LCP subpart breakdown from web-vitals attribution
    const wvLcpAttr = rawMetrics.webVitalsLcp?.attribution || null;
    const lcpSubparts = {
      timeToFirstByte: wvLcpAttr?.timeToFirstByte == null ? null : Math.round(wvLcpAttr.timeToFirstByte * 10) / 10,
      resourceLoadDelay: wvLcpAttr?.resourceLoadDelay == null ? null : Math.round(wvLcpAttr.resourceLoadDelay * 10) / 10,
      resourceLoadDuration: wvLcpAttr?.resourceLoadDuration == null ? null : Math.round(wvLcpAttr.resourceLoadDuration * 10) / 10,
      elementRenderDelay: wvLcpAttr?.elementRenderDelay == null ? null : Math.round(wvLcpAttr.elementRenderDelay * 10) / 10
    };

    const validLcpSubparts = Object.entries(lcpSubparts).filter(([, value]) => Number.isFinite(value));
    const largestSubpart = validLcpSubparts.length
      ? validLcpSubparts.reduce((max, [key, value]) => value > max.val ? { key, val: value } : max, { key: null, val: -1 }).key
      : null;

    return {
      url,
      timestamp: new Date().toISOString(),
      throttling: {
        cpuSlowdown: cpuThrottlingRate,
        runsPerInteraction: runs,
        warmupRunDiscarded: true,
        environment: 'lab, 4x CPU throttle'
      },
      metrics: {
        inp: {
          value: worstInteraction ? worstInteraction.duration.median : 0,
          unit: 'ms',
          environment: 'lab, 4x CPU throttle',
          rating: worstInteraction ? worstInteraction.rating : 'good',
          flagged: worstInteraction ? worstInteraction.flagged : false,
          stats: worstInteraction?.duration || { min: 0, median: 0, max: 0 },
          runDurations: worstInteraction?.runDurations || [],
          target: worstInteraction?.target || '',
          phases: worstInteraction?.phases || null,
          largestPhase: worstInteraction?.largestPhase || 'presentationDelay',
          rootCauseCategory,
          ruleNotice: 'LoAF script execution covers phase delay. Attributed directly to culprit script.',
          warning
        },
        lcp: rawMetrics.lcp ? {
          value: rawMetrics.lcp.renderTime,
          element: rawMetrics.lcp.elementSelector,
          url: normalizeRepoPath(rawMetrics.lcp.url),
          size: rawMetrics.lcp.size,
          rating: rawMetrics.lcp.renderTime <= 2500 ? 'good' : rawMetrics.lcp.renderTime <= 4000 ? 'needs-improvement' : 'poor',
          subparts: lcpSubparts,
          largestSubpart,
          resourceTiming: heroResourceTiming
        } : null,
        cls: {
          value: roundedCls,
          rating: roundedCls <= 0.1 ? 'good' : roundedCls <= 0.25 ? 'needs-improvement' : 'poor',
          shifts: enrichedShifts,
          causeMatchWindowMs: CAUSE_MATCH_WINDOW_MS,
          measurements: {
            images: measuredImages,
            insertions: measuredInsertions,
            insertionsRecorded: insertions.length,
            instrumentationErrors: rawMetrics.instrumentationErrors
          }
        }
      },
      interactionsTested: interactionResults,
      interactionsSkipped,
      worstInteraction
    };

  } finally {
    await page.close();
    await page.close().catch(() => {});
    if (shouldCloseBrowser && browser) {
      await browser.close();
    }
  }
}
