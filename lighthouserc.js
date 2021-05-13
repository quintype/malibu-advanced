const url = `https://${process.env.LH_USER}:${process.env.LH_PASSWORD}@lighthouse-ci.staging.quinpress.com/`;
const lhciConfig = {
  ci: {
    collect: {
      additive: false,
      headful: false,
      url: JSON.parse(process.env.LHCI_SITES),
      settings: {
        emulatedFormFactor: "mobile"
      }
    },
    assert: {
      preset: "lighthouse:no-pwa",
      assertions: {
        "unused-javascript": "off",
        "heading-order": "off",
        "is-crawlable": "off",
        "tap-targets": "off",
        "uses-responsive-images": "off",
        "errors-in-console": "off",
        "uses-text-compression": "off",
        "categories:performance": ["error", { minScore: 1 }]
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
