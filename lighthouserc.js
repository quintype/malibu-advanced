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
        "heading-order": "warn",
        "is-crawlable": "warn",
        "tap-targets": "warn",
        "uses-responsive-images": "warn",
        "errors-in-console": "warn",
        "uses-text-compression": "warn",
        "uses-optimized-images": "warn",
        "no-unload-listeners": "warn",
        "no-document-write": "warn",
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
