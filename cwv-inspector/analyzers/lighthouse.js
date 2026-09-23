import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

/**
 * Extracts score and key metrics from Lighthouse report JSON.
 */
export function extractScores(reportJson) {
  const audits = reportJson.audits;
  return {
    performanceScore: reportJson.categories.performance.score * 100,
    lcp: {
      value: audits['largest-contentful-paint']?.numericValue,
      score: audits['largest-contentful-paint']?.score * 100,
      displayValue: audits['largest-contentful-paint']?.displayValue
    },
    cls: {
      value: audits['cumulative-layout-shift']?.numericValue,
      score: audits['cumulative-layout-shift']?.score * 100,
      displayValue: audits['cumulative-layout-shift']?.displayValue
    },
    tbt: {
      value: audits['total-blocking-time']?.numericValue,
      score: audits['total-blocking-time']?.score * 100,
      displayValue: audits['total-blocking-time']?.displayValue
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
      .filter(key => audits[key].details?.type === 'opportunity' && audits[key].score < 1)
      .map(key => ({
        id: key,
        title: audits[key].title,
        description: audits[key].description,
        score: audits[key].score * 100,
        numericValue: audits[key].numericValue,
        displayValue: audits[key].displayValue
      }))
  };
}

/**
 * Programmatically scrolls down the page and back to the top to trigger lazy-loaded assets.
 * Also captures unthrottled layout shifts as a fallback attribution source.
 */
async function preScrollPage(url, port) {
  console.log(`🤖 Bot Scrolling: Connecting Puppeteer to port ${port} to trigger lazy-loaded assets...`);
  let browser = null;
  let customShifts = [];
  try {
    let retries = 20;
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
    browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl
    });
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    await page.setViewport({ width: 1350, height: 940 });

    // Inject PerformanceObserver
    await page.evaluateOnNewDocument(() => {
      window.__cwv_layout_shifts = [];
      try {
        new PerformanceObserver((list) => {
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
                    const c = el.className.trim().split(/\\s+/).filter(Boolean);
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
        }).observe({type: 'layout-shift', buffered: true});
      } catch(e) {}
    });

    // Navigate to URL
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });

    // Scroll to bottom in increments
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 250;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
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
    console.log('🤖 Bot Scrolling completed successfully. Cache and DOM primed. Captured', customShifts.length, 'layout shifts.');
  } catch (err) {
    console.warn('⚠️ Bot scrolling warning:', err.message);
  }
  return customShifts;
}

/**
 * Runs Lighthouse audit on a URL for both Mobile and Desktop.
 * 
 * @param {string} url The target page URL.
 * @returns {Promise<object|null>} Lighthouse audit scores for both modes.
 */
export async function runLighthouseAudit(url) {
  if (!url) return null;

  let chrome = null;
  try {
    console.log(`\n🚀 Launching headless Chrome for dual Lighthouse audit on: ${url}...`);
    
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless=new', '--disable-gpu', '--no-sandbox']
    });

    // Run bot scrolling to trigger lazy loaders and initialize assets
    const customShifts = await preScrollPage(url, chrome.port);

    const mobileOptions = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      disableStorageReset: true
    };

    const desktopOptions = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
      disableStorageReset: true,
      formFactor: 'desktop',
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
      }
    };

    console.log(`📱 Running Lighthouse Mobile Audit...`);
    const mobileResult = await lighthouse(url, mobileOptions);
    const mobileData = extractScores(JSON.parse(mobileResult.report));

    console.log(`💻 Running Lighthouse Desktop Audit...`);
    const desktopResult = await lighthouse(url, desktopOptions);
    const desktopData = extractScores(JSON.parse(desktopResult.report));

    return {
      mobile: mobileData,
      desktop: desktopData,
      customShifts
    };
  } catch (err) {
    console.error(`⚠️ Lighthouse execution failed: ${err.message}`);
    return {
      error: err.message,
      mobile: null,
      desktop: null
    };
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}
