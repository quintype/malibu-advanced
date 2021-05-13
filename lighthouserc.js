const url = `https://${process.env.LH_USER}:${process.env.LH_PASSWORD}@lighthouse-ci.staging.quinpress.com/`;
const lhciConfig = {
  ci: {
    collect: {
      method: "node",
      numberOfRuns: 5,
      url: JSON.parse(process.env.LHCI_SITES),
      settings: {
        emulatedFormFactor: "mobile",
        throttlingMethod: "devtools"
      }
    },
    assert: {
      preset: "lighthouse:no-pwa",
      assertions: {
        "meta-description": "warn",
        "errors-in-console": "warn",
        "no-document-write": "warn",
        "total-byte-weight": "warn",
        "unused-css-rules": "warn",
        "unused-javascript": "warn",
        "uses-text-compression": "warn",
        "categories:performance": ["warn", { aggregationMethod: "optimistic", minScore: 0.9 }]
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
