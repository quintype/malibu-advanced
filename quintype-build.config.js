// module.exports = require("@quintype/build/config/quintype-build");

module.exports = {
  modifyWebpackConfig: {
    includeLoadableConfig: {
      loadableConfig: true,
      entryFiles: {
        topbarCriticalCss: "./app/isomorphic/components/header",
        navbarCriticalCss: "./app/isomorphic/components/header/nav-bar"
      }
    }
  },
  modifyBabelConfig: {
    includeLoadableConfig: {
      loadableConfig: true,
      loadableBabelPlugin: "@loadable/babel-plugin"
    }
  }
};
