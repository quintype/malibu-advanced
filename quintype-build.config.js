const quintypeBuildConfig = require("@quintype/build/config/quintype-build");

const loadableConfigObj = {
  loadableConfig: {
    entryFiles: {
      topbar: "./app/isomorphic/components/layouts/header",
      navbar: "./app/isomorphic/components/layouts/header/nav-bar",
      footer: "./app/isomorphic/components/layouts/footer",
      arrowElevenStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/ElevenStories",
      arrowFourColGridCssChunk: "./app/isomorphic/arrow/components/Rows/FourColGrid",
      arrowFourColTwelveStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/FourColTwelveStory",
      arrowFullScreenSliderCssChunk: "./app/isomorphic/arrow/components/Rows/FullScreenSlider",
      arrowOneColStoryListCssChunk: "./app/isomorphic/arrow/components/Rows/OneColStoryList",
      arrowThreeColGridCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColGrid",
      arrowThreeColSevenStoryCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColSevenStory",
      arrowTwoColFourStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/TwoColFourStory",
      arrowTwoColThreeStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/TwoColThreeStory",
      arrowTwoColSevenStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/TwoColSevenStories",
      arrowThreeColSixStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColSixStories",
      arrowHalfScreenSliderCssChunk: "./app/isomorphic/arrow/components/Rows/HalfScreenSlider",
      arrowFourStorySliderCssChunk: "./app/isomorphic/arrow/components/Rows/FourStorySlider",
      arrowFourStorySliderPortraitCssChunk: "./app/isomorphic/arrow/components/Rows/FourStorySliderPortrait",
      arrowThreeColFourteenStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColFourteenStory",
      arrowFourColSixteenStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/FourColSixteenStories",
      arrowFourColFiveStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/FourColFiveStories",
      arrowTwoColSixStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/TwoColSixStories",
      arrowTwoColFourStoryHighlightCssChunk: "./app/isomorphic/arrow/components/Rows/TwoColFourStoryHighlight",
      arrowThreeColFlexStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColFlexStories",
      arrowSixColSixStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/SixColSixStories",
      arrowTwoColTenStoriesSidebarCssChunk: "./app/isomorphic/arrow/components/Rows/TwoColTenStoriesSidebar",
      arrowThreeColTwelveStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColTwelveStories",
      arrowFourTabbedBigStorySliderCssChunk: "./app/isomorphic/arrow/components/Rows/FourTabbedBigStorySlider",
      arrowFourColPortraitStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/FourColPortraitStories",
      authorPage: "./app/isomorphic/components/pages/author-page/index.js",
      arrowTextStoryCssChunk: "./app/isomorphic/arrow/components/Rows/StoryTemplates/TextStoryTemplates",
      arrowVideoStoryCssChunk: "./app/isomorphic/arrow/components/Rows/StoryTemplates/VideoStoryTemplates",
      arrowPhotoStoryCssChunk: "./app/isomorphic/arrow/components/Rows/StoryTemplates/PhotoStoryTemplates",
      arrowListicleStoryCssChunk: "./app/isomorphic/arrow/components/Rows/StoryTemplates/ListicleStoryTemplates",
      arrowLiveBlogStoryCssChunk: "./app/isomorphic/arrow/components/Rows/StoryTemplates/LiveBlogStoryTemplates",
    },
  },
};
const modifiedBuildConfig = { ...quintypeBuildConfig, ...loadableConfigObj };

module.exports = modifiedBuildConfig;
