const quintypeBuildConfig = require("@quintype/build/config/quintype-build");

const customConfig = {
  loadableConfig: {
    entryFiles: {
      topbar: "./app/isomorphic/components/layouts/header",
      navbar: "./app/isomorphic/components/layouts/header/nav-bar",
      footer: "./app/isomorphic/components/layouts/footer"
    }
  },
  entryFiles: {
    arrowThreeColSevenStoryChunk: "@quintype/arrow/ThreeColSevenStory/styles.arrow.css",
    arrowThreeColGridChunk: "@quintype/arrow/ThreeColGrid/styles.arrow.css",
    arrowFourColGridChunk: "@quintype/arrow/FourColGrid/styles.arrow.css"
  }
};
const modifiedBuildConfig = { ...quintypeBuildConfig, ...customConfig };

module.exports = modifiedBuildConfig;
