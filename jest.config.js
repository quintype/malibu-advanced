module.exports = {
  testEnvironment: "jsdom",

  setupFiles: ["./jest.setup.js"],

  testPathIgnorePatterns: ["/node_modules/"],

  moduleNameMapper: {
    "\\.(css|scss)$": "identity-obj-proxy",
    "\\.(svg|png|jpg|jpeg|gif|webp)$": "<rootDir>/__mocks__/fileMock.js",
  },

  collectCoverageFrom: [
    "app/**/*.{js,jsx}",
    "!app/**/*.stories.js",
    "!app/**/*.test.js",
    "!app/isomorphic/arrow/components/Fixture/**",
    "!app/isomorphic/arrow/components/Svgs/**",
  ],

  coverageThresholds: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};
