const quintypeBuildConfig = require("@quintype/build/config/quintype-build");

const loadableConfigObj = {
  loadableConfig: {
    entryFiles: {
      topbar: "./app/isomorphic/components/layouts/header",
      navbar: "./app/isomorphic/components/layouts/header/nav-bar",
      footer: "./app/isomorphic/components/layouts/footer",
      arrowElevenStoriesCssChunk: "./app/isomorphic/components/arrow/components/Rows/ElevenStories/11-stories.m.css",
      arrowFourColGridCssChunk: "./app/isomorphic/components/arrow/components/Rows/FourColGrid/four-col.m.css",
      arrowFourColTwelveStoriesCssChunk: "./app/isomorphic/components/arrow/components/Rows/FourColTwelveStory/four-col-twelve-story.m.css",
      arrowFullScreenSliderCssChunk: "./app/isomorphic/components/arrow/components/Rows/FullScreenSlider/full-screen-slider.m.css",
      arrowOneColStoryListCssChunk: "./app/isomorphic/components/arrow/components/Rows/OneColStoryList/one-col-story-list.m.css",
      arrowThreeColGridCssChunk: "./app/isomorphic/components/arrow/components/Rows/ThreeColGrid/three-col.m.css",
      arrowThreeColSevenStoryCssChunk: "./app/isomorphic/components/arrow/components/Rows/ThreeColSevenStory/three-col-seven-story.m.css",
      arrowTwoColFourStoriesCssChunk: "./app/isomorphic/components/arrow/components/Rows/TwoColFourStory/two-col-four-story.m.css",
      authorPage: "./app/isomorphic/components/pages/author-page/index.js",
    },
  },
};
const modifiedBuildConfig = { ...quintypeBuildConfig, ...loadableConfigObj };

module.exports = modifiedBuildConfig;
