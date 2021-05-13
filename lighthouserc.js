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
        "categories:performance": ["error", { minScore: 0.9 }]
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
