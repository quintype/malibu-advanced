const quintypeBuildConfig = require("@quintype/build/config/quintype-build");

const loadableConfigObj = {
  loadableConfig: {
    entryFiles: {
      topbar: "./app/isomorphic/components/layouts/header",
      navbar: "./app/isomorphic/components/layouts/header/nav-bar",
      footer: "./app/isomorphic/components/layouts/footer",
      arrowElevenStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/ElevenStories/11-stories.m.css",
      arrowFourColGridCssChunk: "./app/isomorphic/arrow/components/Rows/FourColGrid/fours-col.m.css",
      arrowFourColTwelveStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/FourColTwelveStories/four-col-twelve-story.m.css",
      arrowFullScreenSliderCssChunk: "./app/isomorphic/arrow/components/Rows/FullScreenSlider/full-screen-slider.m.css",
      arrowOneColStoryListCssChunk: "./app/isomorphic/arrow/components/Rows/OneColStoryList/one-col-story-list.m.css",
      arrowThreeColGridCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColGrid/three-col.m.css",
      arrowThreeColSevenStoryCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColSevenStory/three-col-seven-story.m.css",
      arrowTwoColFourStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/TwoColFourStories/three-col-four-story.m.css",
      authorPage: "./app/isomorphic/components/pages/author-page/index.js"
    }
  }
};
const modifiedBuildConfig = { ...quintypeBuildConfig, ...loadableConfigObj };

module.exports = modifiedBuildConfig;
