const quintypeBuildConfig = require("@quintype/build/config/quintype-build");

const loadableConfigObj = {
  loadableConfig: {
    entryFiles: {
      topbar: "./app/isomorphic/components/layouts/header",
      navbar: "./app/isomorphic/components/layouts/header/nav-bar",
      footer: "./app/isomorphic/components/layouts/footer",
      arrowElevenStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/ElevenStories",
      arrowFourColGridCssChunk: "./app/isomorphic/arrow/components/Rows/FourColGrid",
      arrowFourColTwelveStoriesCssChunk:
         "./app/isomorphic/arrow/components/Rows/FourColTwelveStory",
      arrowFullScreenSliderCssChunk: "./app/isomorphic/arrow/components/Rows/FullScreenSlider",
      arrowOneColStoryListCssChunk: "./app/isomorphic/arrow/components/Rows/OneColStoryList",
      arrowThreeColGridCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColGrid",
      arrowThreeColSevenStoryCssChunk:
         "./app/isomorphic/arrow/components/Rows/ThreeColSevenStory",
      arrowTwoColFourStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/TwoColFourStory",
      authorPage: "./app/isomorphic/components/pages/author-page/index.js",
    },
  },
};
const modifiedBuildConfig = { ...quintypeBuildConfig, ...loadableConfigObj };

module.exports = modifiedBuildConfig;
