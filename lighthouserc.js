const url = `https://${process.env.LH_USER}:${process.env.LH_PASSWORD}@lighthouse-ci.staging.quinpress.com/`;
const lhciConfig = {
  ci: {
    collect: {
      method: "node",
      numberOfRuns: 5,
      additive: false,
      headful: false,
      url: JSON.parse(process.env.LHCI_SITES),
      settings: {
        emulatedFormFactor: "mobile",
        throttlingMethod: "devtools"
      }
    },
    assert: {
      preset: "lighthouse:no-pwa",
      assertions: {
        "unused-javascript": "warn",
        "heading-order": "off", // Heading elements are not in a sequentially-descending order
        "is-crawlable": "warn",
        "tap-targets": "warn", // Tap targets are the areas of a web page that users on touch devices can interact with. Buttons, links, and form elements all have tap targets.
        "uses-responsive-images": "warn",
        "errors-in-console": "warn", // Browser errors were logged to the console
        "uses-text-compression": "warn",
        "uses-optimized-images": "warn",
        "no-unload-listeners": "off",
        "no-document-write": "warn", // Avoid `document.write()`
        "categories:performance": ["error", { minScore: 0.7 }]
      }
    },
    upload: {
      target: "lhci",
      serverBaseUrl: url,
      token: `${process.env.LH_BUILD_TOKEN}`
    }
  }
};

module.exports = lhciConfig;

// Note: Below are the points that are affecting our current scores.
// bootup-time: js execution time
// first-cpu-idle: First CPU Idle is deprecated in Lighthouse 6.0 (but is similar to time to interactive)
// heading-order: Heading elements are not in a sequentially-descending order
// interactive: Time to Interactive
// mainthread-work-breakdown: Main thread execution
// max-potential-fid: First input delay
// no-document-write: Avoid `document.write()`
// no-unload-listeners: Timetaken by event listeners
