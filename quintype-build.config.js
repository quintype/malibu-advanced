const quintypeBuildConfig = require("@quintype/build/config/quintype-build");

const loadableConfigObj = {
  loadableConfig: {
    entryFiles: {
      topbar: "./app/isomorphic/components/layouts/header",
      navbar: "./app/isomorphic/components/layouts/header/nav-bar",
      footer: "./app/isomorphic/components/layouts/footer",
      ugcPage: "./app/isomorphic/components/pages/ugc-page/index.js",
      arrowElevenStoriesCssChunk: "./app/isomorphic/components/collection-templates/arrow-rows/eleven-stories/index.js",
      arrowFourColGridCssChunk: "./app/isomorphic/components/collection-templates/arrow-rows/four-col-grid/index.js",
      arrowFourColTwelveStoriesCssChunk: "./app/isomorphic/components/collection-templates/arrow-rows/four-col-12-stories/index.js",
      arrowFullScreenSliderCssChunk: "./app/isomorphic/components/collection-templates/arrow-rows/full-screen-slider/index.js",
      arrowOneColStoryListCssChunk: "./app/isomorphic/components/collection-templates/arrow-rows/one-col-story-list/index.js",
      arrowThreeColGridCssChunk: "./app/isomorphic/components/collection-templates/arrow-rows/three-col-grid/index.js",
      arrowThreeColSevenStoryCssChunk: "./app/isomorphic/components/collection-templates/arrow-rows/three-col-seven-stories/index.js",
      arrowTwoColFourStoriesCssChunk: "./app/isomorphic/components/collection-templates/arrow-rows/two-col-four-stories/index.js",
      authorPage: "./app/isomorphic/components/pages/author-page/index.js",
      arrowTextStoryCssChunk: "./app/isomorphic/components/story-templates/text-story/index.js",
      arrowVideoStoryCssChunk: "./app/isomorphic/components/story-templates/video-story/index.js",
      arrowPhotoStoryCssChunk: "./app/isomorphic/components/story-templates/photo-story/index.js",
      arrowListicleStoryCssChunk: "./app/isomorphic/components/story-templates/listicle-story/index.js",
      arrowLiveBlogStoryCssChunk: "./app/isomorphic/components/story-templates/live-blog/index.js",
    },
  },
};
const modifiedBuildConfig = { ...quintypeBuildConfig, ...loadableConfigObj };

module.exports = modifiedBuildConfig;
