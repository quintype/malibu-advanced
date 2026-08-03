import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';

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

    const mobileOptions = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port
    };

    const desktopOptions = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance'],
      port: chrome.port,
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
