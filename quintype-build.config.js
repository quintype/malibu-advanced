const quintypeBuildConfig = require("@quintype/build/config/quintype-build");

const loadableConfigObj = {
  loadableConfig: {
    entryFiles: {
      topbar: "./app/isomorphic/components/layouts/header",
      navbar: "./app/isomorphic/components/layouts/header/nav-bar",
      footer: "./app/isomorphic/components/layouts/footer",
      ugcPage: "./app/isomorphic/components/pages/ugc-page/index.js",
      arrowElevenStoriesCssChunk: "@quintype/arrow/ElevenStories/styles.arrow.css",
      arrowFourColGridCssChunk: "@quintype/arrow/FourColGrid/styles.arrow.css",
      arrowFourColTwelveStoriesCssChunk: "@quintype/arrow/FourColTwelveStories/styles.arrow.css",
      arrowFullScreenSliderCssChunk: "@quintype/arrow/FullScreenSlider/styles.arrow.css",
      arrowOneColStoryListCssChunk: "@quintype/arrow/OneColStoryList/styles.arrow.css",
      arrowThreeColGridCssChunk: "@quintype/arrow/ThreeColGrid/styles.arrow.css",
      arrowThreeColSevenStoryCssChunk: "@quintype/arrow/ThreeColSevenStory/styles.arrow.css",
      arrowTwoColFourStoriesCssChunk: "@quintype/arrow/TwoColFourStories/styles.arrow.css",
      authorPage: "./app/isomorphic/components/pages/author-page/index.js",
      arrowTextStoryCssChunk: "@quintype/arrow/TextStoryTemplate/styles.arrow.css",
      arrowVideoStoryCssChunk: "@quintype/arrow/VideoStoryTemplate/styles.arrow.css",
      arrowPhotoStoryCssChunk: "@quintype/arrow/PhotoStoryTemplate/styles.arrow.css",
      arrowListicleStoryCssChunk: "@quintype/arrow/ListicleStoryTemplate/styles.arrow.css",
      arrowLiveBlogStoryCssChunk: "@quintype/arrow/LiveBlogStoryTemplate/styles.arrow.css",
    },
  },
};
const modifiedBuildConfig = { ...quintypeBuildConfig, ...loadableConfigObj };

module.exports = modifiedBuildConfig;
