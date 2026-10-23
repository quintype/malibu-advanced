import { ReadableStream as WebReadableStream } from 'stream/web';
import nodeFetch from 'node-fetch';

if (typeof globalThis.ReadableStream === 'undefined' && WebReadableStream) {
  globalThis.ReadableStream = WebReadableStream;
}

if (typeof globalThis.fetch === 'undefined' && nodeFetch) {
  globalThis.fetch = nodeFetch;
}

import * as chromeLauncher from 'chrome-launcher';
import lighthouse, { desktopConfig } from 'lighthouse';
import puppeteer from 'puppeteer';

/**
 * Extracts score and key metrics from Lighthouse report JSON.
 */
export function extractScores(reportJson) {
  const audits = reportJson.audits;
  return {
    performanceScore: reportJson.categories.performance.score * 100,
    lcp: {
      value: audits['largest-contentful-paint']?.numericValue !== undefined ? audits['largest-contentful-paint'].numericValue : 0,
      score: (audits['largest-contentful-paint']?.score || 0) * 100,
      displayValue: audits['largest-contentful-paint']?.displayValue || 'N/A'
    },
    cls: {
      value: audits['cumulative-layout-shift']?.numericValue !== undefined ? audits['cumulative-layout-shift'].numericValue : 0,
      score: (audits['cumulative-layout-shift']?.score || 0) * 100,
      displayValue: audits['cumulative-layout-shift']?.displayValue || '0'
    },
    tbt: {
      value: audits['total-blocking-time']?.numericValue !== undefined ? audits['total-blocking-time'].numericValue : 0,
      score: (audits['total-blocking-time']?.score || 0) * 100,
      displayValue: audits['total-blocking-time']?.displayValue || '0ms'
    },
    inp: {
      value: audits['interaction-to-next-paint']?.numericValue || audits['inp']?.numericValue || 0,
      score: (audits['interaction-to-next-paint']?.score !== undefined ? audits['interaction-to-next-paint']?.score : audits['inp']?.score || 0) * 100,
      displayValue: audits['interaction-to-next-paint']?.displayValue || audits['inp']?.displayValue || 'N/A'
    },
    inpInteractions: (() => {
      const audit = audits['interaction-to-next-paint'] || audits['inp'];
      if (!audit || !audit.details || !Array.isArray(audit.details.items)) return [];
      return audit.details.items.map(item => ({
        type: item.interactionType || 'click',
        selector: item.node?.selector || '',
        nodeLabel: item.node?.nodeLabel || '',
        inputDelay: item.inputDelay || 0,
        processingDuration: item.processingDuration || 0,
        presentationDelay: item.presentationDelay || 0
      }));
    })(),
    speedIndex: {
      value: audits['speed-index']?.numericValue,
      score: audits['speed-index']?.score * 100,
      displayValue: audits['speed-index']?.displayValue
    },
    fcp: {
      value: audits['first-contentful-paint']?.numericValue,
      score: audits['first-contentful-paint']?.score * 100,
      displayValue: audits['first-contentful-paint']?.displayValue
    },
    clsElements: (() => {
      const clsScore = audits['cumulative-layout-shift']?.numericValue || 0;
      const audit = audits['layout-shift-elements'];
      let items = [];
      if (audit && audit.details && Array.isArray(audit.details.items)) {
        items = audit.details.items;
      }

      const mapped = items.map(item => ({
        selector: item.node?.selector || 'Unknown Node (Removed or no DOM element)',
        nodeLabel: item.node?.nodeLabel || 'N/A',
        snippet: item.node?.snippet || 'N/A',
        score: item.score || 0
      }));

      // If Lighthouse detected a shift but provided NO details, force a generic fallback
      if (mapped.length === 0 && clsScore > 0.001) {
        mapped.push({
          selector: 'Global/Unknown (Lighthouse trace parsing failed to attribute elements)',
          nodeLabel: 'N/A',
          snippet: 'N/A',
          score: clsScore
        });
      }

      return mapped;
    })(),
    opportunities: Object.keys(audits)
      .filter(key => {
        const audit = audits[key];
        if (!audit) return false;
        if (audit.details?.type === 'opportunity' && audit.score < 1) return true;
        if (key === 'uses-rel-preconnect' && ((Array.isArray(audit.warnings) && audit.warnings.length > 0) || (audit.score !== null && audit.score < 1))) {
          return true;
        }
        return false;
      })
      .map(key => {
        const audit = audits[key];
        const warningStr = Array.isArray(audit.warnings) && audit.warnings.length > 0
          ? audit.warnings.join('; ')
          : '';
        return {
          id: key,
          title: audit.title,
          description: audit.description,
          score: audit.score !== null && audit.score !== undefined ? audit.score * 100 : 50,
          numericValue: audit.numericValue,
          displayValue: audit.displayValue || warningStr
        };
      })
  };
}

/**
 * Connects Puppeteer to Chrome's debugging WebSocket endpoint with retries.
 */
async function connectPuppeteerToPort(port, retries = 20) {
  let webSocketDebuggerUrl = '';
  while (retries > 0) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (!response.ok) throw new Error('Not ok');
      const data = await response.json();
      webSocketDebuggerUrl = data.webSocketDebuggerUrl;
      if (webSocketDebuggerUrl) break;
    } catch (e) {
      retries--;
      if (retries === 0) throw e;
      await new Promise(r => setTimeout(r, 200));
    }
  }
  return await puppeteer.connect({ browserWSEndpoint: webSocketDebuggerUrl });
}

/**
 * Configures Puppeteer page viewport, user agent, cache, and CDP network/CPU throttling
 * to match official Lighthouse Mobile or Desktop constants.
 */
async function configurePageEmulation(page, device = 'mobile') {
  if (device === 'mobile') {
    await page.setUserAgent('Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36');
    await page.setViewport({ width: 412, height: 823, deviceScaleFactor: 1.75, isMobile: true, hasTouch: true });
  } else {
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1350, height: 940, deviceScaleFactor: 1, isMobile: false, hasTouch: false });
  }
  await page.setCacheEnabled(false);
  await page.setExtraHTTPHeaders({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  // Emulate Network & CPU Conditions (matching official Lighthouse constants)
  const client = await page.target().createCDPSession();
  if (device === 'mobile') {
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024 * 0.9) / 8,
      uploadThroughput: (750 * 1024 * 0.9) / 8,
      connectionType: 'cellular3g'
    });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  } else {
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      latency: 40,
      downloadThroughput: (10 * 1024 * 1024) / 8,
      uploadThroughput: (5 * 1024 * 1024) / 8,
      connectionType: 'wifi'
    });
    await client.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  }
}

/**
 * Injects a PerformanceObserver into the document before scripts run to capture layout shifts
 * and resolve element selectors even if elements detach post-shift.
 */
async function injectLayoutShiftObserver(page) {
  await page.evaluateOnNewDocument(() => {
    if (window.__cwv_layout_shifts_injected) return;
    window.__cwv_layout_shifts_injected = true;
    window.__cwv_layout_shifts = [];
    try {
      window.__cwv_observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.hadRecentInput) continue;
          let sources = [];
          if (entry.sources) {
            sources = entry.sources.map(s => {
              const node = s.node;
              if (!node) return { selector: 'Unknown/Removed' };

              // Check if the node is still attached to the live document
              const isDetached = !document.contains(node);

              let path = [];
              let el = node;
              while (el && el.nodeType === 1) {
                let sel = el.nodeName.toLowerCase();
                if (el.id) sel += '#' + el.id;
                else if (el.className && typeof el.className === 'string') {
                  const c = el.className.trim().split(/\s+/).filter(Boolean);
                  if (c.length > 0) sel += '.' + c.join('.');
                }
                path.unshift(sel);
                el = el.parentNode;
              }

              let selectorStr = path.join(' > ');
              if (isDetached) {
                selectorStr = `Detached Node: ${selectorStr}`;
              }

              let snippetRaw = node.outerHTML ? node.outerHTML.substring(0, 150) : '';
              if (isDetached && snippetRaw) {
                snippetRaw = `[Captured post-shift; element detached] ${snippetRaw}`;
              }

              return {
                selector: selectorStr,
                nodeName: node.nodeName,
                snippet: snippetRaw,
                previousRect: s.previousRect ? { x: s.previousRect.x, y: s.previousRect.y, width: s.previousRect.width, height: s.previousRect.height } : null,
                currentRect: s.currentRect ? { x: s.currentRect.x, y: s.currentRect.y, width: s.currentRect.width, height: s.currentRect.height } : null,
                isDetached
              };
            });
          }
          window.__cwv_layout_shifts.push({
            value: entry.value,
            time: entry.startTime,
            sources
          });
        }
      });
      window.__cwv_observer.observe({ type: 'layout-shift', buffered: true });
    } catch (e) { }
  });
}

/**
 * Programmatically scrolls down the page and back to the top to trigger lazy-loaded assets.
 * Also captures unthrottled layout shifts as a fallback attribution source.
 */
async function preScrollPage(url, port, device = 'mobile') {
  console.log(`🤖 Bot Scrolling: Connecting Puppeteer to port ${port} (${device}) to trigger lazy-loaded assets...`);
  let browser = null;
  let customShifts = [];
  try {
    browser = await connectPuppeteerToPort(port);
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    await configurePageEmulation(page, device);
    await injectLayoutShiftObserver(page);

    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

    // Scroll to bottom in increments ensuring full page traversal
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        let lastScrollY = -1;
        let stagnantCount = 0;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          const currentScrollY = window.scrollY;
          if (currentScrollY === lastScrollY) {
            stagnantCount++;
          } else {
            stagnantCount = 0;
          }
          lastScrollY = currentScrollY;

          const reachedBottom = (window.innerHeight + window.scrollY) >= (scrollHeight - 50);
          if (reachedBottom || stagnantCount >= 3 || totalHeight >= 25000) {
            clearInterval(timer);
            // Disconnect layout shift observer before snapping back to top to avoid capturing artificial viewport exit shifts
            try {
              if (window.__cwv_observer) window.__cwv_observer.disconnect();
            } catch (_) {}
            // Scroll back to top
            window.scrollTo(0, 0);
            resolve();
          }
        }, 120);
      });
    });

    // Short wait at the top for layout stability
    await new Promise(r => setTimeout(r, 1500));
    customShifts = await page.evaluate(() => window.__cwv_layout_shifts || []);
    console.log(`🤖 Bot Scrolling (${device}) completed successfully. Cache and DOM primed. Captured`, customShifts.length, 'layout shifts.');
  } catch (err) {
    console.warn('⚠️ Bot scrolling warning:', err.message);
  } finally {
    if (browser) {
      try {
        await browser.disconnect();
      } catch (e) { }
    }
  }
  return customShifts;
}

/**
 * Runs a specially throttled diagnostic pass to capture layout shifts when Lighthouse trace parsing fails.
 * Emulates exactly Lighthouse Mobile/Desktop throttling & screen metrics.
 */
async function throttledDiagnosticPass(url, port, device = 'mobile') {
  console.log(`🤖 Lighthouse trace parser failed. Running Custom Throttled Diagnostic Pass for ${device} on port ${port}...`);
  let browser = null;
  let customShifts = [];
  try {
    browser = await connectPuppeteerToPort(port);
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    await configurePageEmulation(page, device);
    await injectLayoutShiftObserver(page);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

    // Quick scroll to trigger lazy elements
    await page.evaluate(async () => {
      window.scrollBy(0, 500);
      await new Promise(r => setTimeout(r, 500));
      try {
        if (window.__cwv_observer) window.__cwv_observer.disconnect();
      } catch (_) {}
      window.scrollTo(0, 0);
    });

    await new Promise(r => setTimeout(r, 2000));
    customShifts = await page.evaluate(() => window.__cwv_layout_shifts || []);
    console.log(`🤖 Custom Throttled Pass captured ${customShifts.length} layout shifts.`);
  } catch (err) {
    console.warn('⚠️ Custom Throttled Pass warning:', err.message);
  } finally {
    if (browser) {
      try {
        await browser.disconnect();
      } catch (e) { }
    }
  }
  return customShifts;
}

/**
 * Recalculates CLS value and Lighthouse performance score if full-page scrolling
 * observed layout shifts that exceed the static non-scrolling trace.
 */
function updateClsWithObservedShifts(deviceData, shifts, deviceName) {
  if (!deviceData || !shifts || shifts.length === 0) return;
  const shiftSum = shifts.reduce((acc, s) => acc + (Number(s.value) || 0), 0);
  if (shiftSum > (deviceData.cls.value || 0)) {
    console.log(`📊 ${deviceName} full-page scroll observed CLS (${shiftSum.toFixed(3)}) exceeds static viewport CLS (${(deviceData.cls.value || 0).toFixed(3)}). Updating report metrics.`);
    deviceData.cls.value = shiftSum;
    deviceData.cls.displayValue = shiftSum.toFixed(3);
    if (shiftSum > 0.25) {
      deviceData.cls.score = Math.max(0, Math.round((1 - Math.min(1, (shiftSum - 0.25) / 0.5)) * 49));
    } else if (shiftSum > 0.10) {
      deviceData.cls.score = Math.round(50 + ((0.25 - shiftSum) / 0.15) * 39);
    } else {
      deviceData.cls.score = 90 + Math.round(((0.10 - shiftSum) / 0.10) * 10);
    }
  }
}

/**
 * Runs Lighthouse audit on a URL for both Mobile and Desktop.
 *
 * @param {string} url The target page URL.
 * @returns {Promise<object|null>} Lighthouse audit scores for both modes.
 */
export async function runLighthouseAudit(url) {
  if (!url) return null;

  // Append unique timestamp parameter to bust CDN and intermediate proxy caches on every run
  const cacheBuster = `_cwv_nocache=${Date.now()}`;
  const auditUrl = url.includes('?') ? `${url}&${cacheBuster}` : `${url}?${cacheBuster}`;

  let chrome = null;
  try {
    console.log(`\n🚀 Launching headless Chrome for dual Lighthouse audit on: ${auditUrl}...`);

    chrome = await chromeLauncher.launch({
      chromeFlags: [
        '--headless=new',
        '--disable-gpu',
        '--no-sandbox',
        '--disable-cache',
        '--disk-cache-size=0',
        '--media-cache-size=0',
        '--disable-application-cache',
        '--disable-offline-load-stale-cache',
        '--aggressive-cache-discard'
      ]
    });

    // Run bot scrolling to trigger lazy loaders and initialize assets (Mobile pass)
    const mobileCustomShifts = await preScrollPage(auditUrl, chrome.port, 'mobile');

    // Official Lighthouse & PageSpeed Insights Reference Configuration
    const mobileOptions = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      disableStorageReset: false,
      formFactor: 'mobile',
      throttlingMethod: 'simulate',
      screenEmulation: {
        mobile: true,
        width: 412,
        height: 823,
        deviceScaleFactor: 1.75,
        disabled: false
      },
      throttling: {
        rttMs: 150,
        throughputKbps: 1.6 * 1024,
        requestLatencyMs: 150 * 3.75,
        downloadThroughputKbps: 1.6 * 1024 * 0.9,
        uploadThroughputKbps: 750 * 0.9,
        cpuSlowdownMultiplier: 4
      },
      emulatedUserAgent: 'Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Mobile Safari/537.36'
    };

    const desktopOptions = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      disableStorageReset: false,
      formFactor: 'desktop',
      throttlingMethod: 'simulate',
      screenEmulation: {
        mobile: false,
        width: 1350,
        height: 940,
        deviceScaleFactor: 1,
        disabled: false
      },
      throttling: {
        rttMs: 40,
        throughputKbps: 10 * 1024,
        cpuSlowdownMultiplier: 1,
        requestLatencyMs: 0,
        downloadThroughputKbps: 0,
        uploadThroughputKbps: 0
      },
      emulatedUserAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    };

    console.log(`📱 Running Lighthouse Mobile Audit (412x823, 1.75x DPR, Slow 4G, 4x CPU)...`);
    const mobileResult = await lighthouse(auditUrl, mobileOptions);
    const mobileData = extractScores(JSON.parse(mobileResult.report));

    // Check if Lighthouse failed to trace DOM nodes and preScrollPage had no custom shifts
    let finalMobileShifts = mobileCustomShifts;
    if (finalMobileShifts.length === 0 && mobileData.clsElements.some(el => el.selector.includes('Global/Unknown'))) {
      const throttledShifts = await throttledDiagnosticPass(auditUrl, chrome.port, 'mobile');
      finalMobileShifts = throttledShifts;
    }

    // Run bot scrolling to trigger lazy loaders and initialize assets (Desktop pass)
    const desktopCustomShifts = await preScrollPage(auditUrl, chrome.port, 'desktop');

    console.log(`💻 Running Lighthouse Desktop Audit (1350x940, 1x DPR, Dense 4G, 1x CPU)...`);
    const desktopResult = await lighthouse(auditUrl, desktopOptions, desktopConfig);
    const desktopData = extractScores(JSON.parse(desktopResult.report));

    let finalDesktopShifts = desktopCustomShifts;
    if (finalDesktopShifts.length === 0 && desktopData.clsElements.some(el => el.selector.includes('Global/Unknown'))) {
      const desktopShifts = await throttledDiagnosticPass(auditUrl, chrome.port, 'desktop');
      finalDesktopShifts = desktopShifts;
    }

    // Incorporate scroll-triggered layout shifts if observed shifts exceed the static non-scrolling trace
    updateClsWithObservedShifts(mobileData, finalMobileShifts, 'Mobile');
    updateClsWithObservedShifts(desktopData, finalDesktopShifts, 'Desktop');

    // Build emulation config metadata for report display
    const emulationConfig = {
      lighthouseVersion: '11.7.1',
      mobile: {
        deviceType: 'Mobile',
        deviceName: 'Moto G Power (2022)',
        formFactor: mobileOptions.formFactor,
        viewport: `${mobileOptions.screenEmulation.width}×${mobileOptions.screenEmulation.height}`,
        viewportWidth: mobileOptions.screenEmulation.width,
        viewportHeight: mobileOptions.screenEmulation.height,
        deviceScaleFactor: mobileOptions.screenEmulation.deviceScaleFactor,
        mobileEmulation: mobileOptions.screenEmulation.mobile,
        throttlingProfile: 'Slow 4G (simulated)',
        networkRtt: `${mobileOptions.throttling.rttMs}ms`,
        networkThroughput: `${(mobileOptions.throttling.throughputKbps / 1024).toFixed(1)} Mbps`,
        cpuSlowdown: `${mobileOptions.throttling.cpuSlowdownMultiplier}x`,
        throttlingMethod: mobileOptions.throttlingMethod,
        configSource: 'Lighthouse Default (MOTOGPOWER_EMULATION_METRICS)'
      },
      desktop: {
        deviceType: 'Desktop',
        deviceName: 'MacOS Desktop',
        formFactor: desktopOptions.formFactor,
        viewport: `${desktopOptions.screenEmulation.width}×${desktopOptions.screenEmulation.height}`,
        viewportWidth: desktopOptions.screenEmulation.width,
        viewportHeight: desktopOptions.screenEmulation.height,
        deviceScaleFactor: desktopOptions.screenEmulation.deviceScaleFactor,
        mobileEmulation: desktopOptions.screenEmulation.mobile,
        throttlingProfile: 'Dense 4G (simulated)',
        networkRtt: `${desktopOptions.throttling.rttMs}ms`,
        networkThroughput: `${(desktopOptions.throttling.throughputKbps / 1024).toFixed(1)} Mbps`,
        cpuSlowdown: `${desktopOptions.throttling.cpuSlowdownMultiplier}x`,
        throttlingMethod: desktopOptions.throttlingMethod,
        configSource: 'Lighthouse Default (DESKTOP_EMULATION_METRICS)'
      }
    };

    return {
      mobile: mobileData,
      desktop: desktopData,
      customShifts: [...finalMobileShifts, ...finalDesktopShifts],
      emulationConfig
    };
  } catch (err) {
    console.error(`⚠️ Lighthouse execution failed: ${err.message}`);
    return {
      error: err.message,
      mobile: null,
      desktop: null,
      emulationConfig: null
    };
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}
