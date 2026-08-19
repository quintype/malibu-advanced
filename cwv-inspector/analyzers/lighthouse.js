import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import puppeteer from 'puppeteer';

/**
 * Extracts score and key metrics from Lighthouse report JSON.
 */
function extractScores(reportJson) {
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
      const audit = audits['layout-shift-elements'];
      if (!audit || !audit.details || !Array.isArray(audit.details.items)) return [];
      return audit.details.items
        .filter(item => item.node)
        .map(item => ({
          selector: item.node.selector || '',
          nodeLabel: item.node.nodeLabel || '',
          snippet: item.node.snippet || '',
          score: item.score || 0
        }));
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
 */
async function preScrollPage(url, port) {
  console.log(`🤖 Bot Scrolling: Connecting Puppeteer to port ${port} to trigger lazy-loaded assets...`);
  let browser = null;
  try {
    browser = await puppeteer.connect({
      browserURL: `http://localhost:${port}`
    });
    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

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
    console.log('🤖 Bot Scrolling completed successfully. Cache and DOM primed.');
  } catch (err) {
    console.warn('⚠️ Bot scrolling warning:', err.message);
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

  let chrome = null;
  try {
    console.log(`\n🚀 Launching headless Chrome for dual Lighthouse audit on: ${url}...`);
    
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    });

    // Run bot scrolling to trigger lazy loaders and initialize assets
    await preScrollPage(url, chrome.port);

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
      desktop: desktopData
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
