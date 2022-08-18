const quintypeBuildConfig = require("@quintype/build/config/quintype-build");

const loadableConfigObj = {
  loadableConfig: {
    entryFiles: {
      topbar: "./app/isomorphic/components/layouts/header",
      navbar: "./app/isomorphic/components/layouts/header/nav-bar",
      footer: "./app/isomorphic/components/layouts/footer",
      arrowElevenStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/ElevenStories/11-stories.m.css",
      arrowFourColGridCssChunk: "./app/isomorphic/arrow/components/Rows/FourColGrid/four-col.m.css",
      arrowFourColTwelveStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/FourColTwelveStory/four-col-twelve-story.m.css",
      arrowFullScreenSliderCssChunk: "./app/isomorphic/arrow/components/Rows/FullScreenSlider/full-screen-slider.m.css",
      arrowOneColStoryListCssChunk: "./app/isomorphic/arrow/components/Rows/OneColStoryList/one-col-story-list.m.css",
      arrowThreeColGridCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColGrid/three-col.m.css",
      arrowThreeColSevenStoryCssChunk: "./app/isomorphic/arrow/components/Rows/ThreeColSevenStory/three-col-seven-story.m.css",
      arrowTwoColFourStoriesCssChunk: "./app/isomorphic/arrow/components/Rows/TwoColFourStory/two-col-four-story.m.css",
      authorPage: "./app/isomorphic/components/pages/author-page/index.js",
      arrowTextStoryCssChunk: "./app/isomorphic/arrow/components/Rows/StoryTemplates/TextStoryTemplates/text-story.m.css",
      arrowVideoStoryCssChunk: "./app/isomorphic/arrow/components/Rows/StoryTemplates/VideoStoryTemplates/video-story.m.css",
      arrowPhotoStoryCssChunk: "./app/isomorphic/arrow/components/Rows/StoryTemplates/PhotoStoryTemplates/photo.m.css",
      arrowListicleStoryCssChunk: "./app/isomorphic/arrow/components/Rows/StoryTemplates/ListicleStoryTemplates/listicle-story.m.css",
      arrowLiveBlogStoryCssChunk: "./app/isomorphic/arrow/components/Rows/StoryTemplates/LiveBlogStoryTemplates/live-blog.m.css",
    },
  },
};
const modifiedBuildConfig = { ...quintypeBuildConfig, ...loadableConfigObj };

module.exports = modifiedBuildConfig;
