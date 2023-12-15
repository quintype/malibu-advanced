const quintypeBuildConfig = require("@quintype/build/config/quintype-build");

const loadableConfigObj = {
  loadableConfig: {
    entryFiles: {
      topbar: "./app/isomorphic/components/layouts/header",
      navbar: "./app/isomorphic/components/layouts/header/nav-bar",
      footer: "./app/isomorphic/components/layouts/footer",
      ugcPage: "./app/isomorphic/components/pages/ugc-page/index.js",
      arrowElevenStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/ElevenStories",
      arrowFourColGridCssChunk: "./app/isomorphic/arrow/components/Rows/FourColGrid",
      arrowFourColTwelveStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/FourColTwelveStory",
      arrowFullScreenSliderCssChunk: "./app/isomorphic/arrow/components/Rows/FullScreenSlider",
      arrowOneColStoryListCssChunk: "./app/isomorphic/arrow/components/Rows/OneColStoryList",
      arrowThreeColGridCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColGrid",
      arrowTwoColFourStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/TwoColFourStory",
      arrowThreeColSevenStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColSevenStory",
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
      arrowThreeColTwelveStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColTwelveStories",
      arrowFourTabbedBigStorySliderCssChunk: "./app/isomorphic/arrow/components/Rows/FourTabbedBigStorySlider",
      arrowFourColPortraitStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/FourColPortraitStories",
      arrowCollectionFilterCssChunk: "./app/isomorphic/arrow/components/Rows/CollectionFilter",
      arrowAlternateCollectionFilterCssChunk: "./app/isomorphic/arrow/components/Rows/AlternateCollectionFilter",
      arrowAstrologyCollectionCssChunk: "./app/isomorphic/arrow/components/Rows/AstrologyCollection",
      arrowListiclesCssChunk: "./app/isomorphic/arrow/components/Rows/Listicles",
      arrowMagazineWidgetCssChunk: "./app/isomorphic/arrow/components/Rows/MagazineWidget",
      arrowMagazineEditionsCssChunk: "./app/isomorphic/arrow/components/Rows/MagazineEditions",
      arrowListComponentCssChunk: "./app/isomorphic/arrow/components/Rows/ListComponent",
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
