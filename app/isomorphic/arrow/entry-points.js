/**
 * #### IMPORTANT NOTE ####
 * - be careful while changing the 'name' of a component
 * - rollup uses this name to create the folder in which the CSS file for that component is placed
 * - so if you change the name, it basically will change Arrow's API
 * Example:
 * - if you change {name: "Text"} to {name: "Text123"},
 * - arrow users will have to change `import "@quintype/arrow/Text/styles.arrow.css"` to `import "@quintype/arrow/Text123/styles.arrow.css"` everywhere.
 * ----x----x----x----x----
 *
 * Every component that arrow exports should export its CSS separately
 * Entries here have to match with components exported in src/index.js
 *
 */

const path = require("path");

function getEntryPoints() {
  const entryPoints = [
    {
      // this is the main bundle containing all components. It's name must be "index"
      name: "index",
      path: path.resolve(path.join(__dirname, "/index.js"))
    },
    ...storyElementsEntryPoints(),
    ...atomsEntryPoints(),
    ...moleculesEntryPoints(),
    ...rowsEntryPoints()
  ];
  return entryPoints.reduce((accumulator, currentBundle) => {
    accumulator[currentBundle.name] = currentBundle.path;
    return accumulator;
  }, {});
}

function storyElementsEntryPoints() {
  const basePath = path.resolve(path.join(__dirname, "/components/Atoms/StoryElements"));
  return [
    {
      name: "Text",
      path: `${basePath}/Text`
    },
    {
      name: "Quote",
      path: `${basePath}/Quote`
    },
    {
      name: "Blurb",
      path: `${basePath}/Blurb`
    },
    {
      name: "AlsoRead",
      path: `${basePath}/AlsoRead`
    },
    {
      name: "Summary",
      path: `${basePath}/Summary`
    },
    {
      name: "BlockQuote",
      path: `${basePath}/BlockQuote`
    },
    {
      name: "Image",
      path: `${basePath}/Image`
    },
    {
      name: "Video",
      path: `${basePath}/Video`
    },
    {
      name: "BigFact",
      path: `${basePath}/BigFact`
    },
    {
      name: "StoryElement",
      path: `${basePath}/StoryElement`
    },
    {
      name: "QuestionAnswer",
      path: `${basePath}/QuestionAnswer`
    },
    {
      name: "ImageGallery",
      path: `${basePath}/imageGallery`
    },
    {
      name: "Reference",
      path: `${basePath}/Reference`
    },
    {
      name: "Attachment",
      path: `${basePath}/Attachment`
    },
    {
      name: "ImageSlideshow",
      path: `${basePath}/ImageSlideshow`
    }
  ];
}

function atomsEntryPoints() {
  const basePath = path.resolve(path.join(__dirname, "/components/Atoms"));
  return [
    {
      name: "Author",
      path: `${basePath}/Author`
    },
    {
      name: "AuthorWithTime",
      path: `${basePath}/AuthorWithTimestamp`
    },
    {
      name: "CollectionName",
      path: `${basePath}/CollectionName`
    },
    {
      name: "Headline",
      path: `${basePath}/Headline`
    },
    {
      name: "HeroImage",
      path: `${basePath}/HeroImage`
    },
    {
      name: "LoadmoreButton",
      path: `${basePath}/Loadmore`
    },
    {
      name: "SectionTag",
      path: `${basePath}/SectionTag`
    },
    {
      name: "Subheadline",
      path: `${basePath}/Subheadline`
    },
    {
      name: "TimeStamp",
      path: `${basePath}/TimeStamp`
    },
    {
      name: "ScrollSnap",
      path: `${basePath}/ScrollSnap`
    }
  ];
}

function moleculesEntryPoints() {
  const basePath = path.resolve(path.join(__dirname, "/components/Molecules"));
  return [
    {
      name: "StoryCard",
      path: `${basePath}/StoryCard`
    },
    {
      name: "StorycardContent",
      path: `${basePath}/StorycardContent`
    },
    {
      name: "StoryElementCard",
      path: `${basePath}/StoryElementCard`
    },
    {
      name: "KeyEvents",
      path: `${basePath}/KeyEvents`
    },
    {
      name: "SocialShareTemplate",
      path: `${basePath}/SocialShareTemplate`
    },
    {
      name: "PageIntroductionCard",
      path: `${basePath}/PageIntroductionCard`
    }
  ];
}

function rowsEntryPoints() {
  const basePath = path.resolve(path.join(__dirname, "/components/Rows"));
  return [
    {
      name: "FourColGrid",
      path: `${basePath}/FourColGrid`
    },
    {
      name: "OneColStoryList",
      path: `${basePath}/OneColStoryList`
    },
    {
      name: "ThreeColGrid",
      path: `${basePath}/ThreeColGrid`
    },
    {
      name: "TwoColFourStories",
      path: `${basePath}/TwoColFourStory`
    },
    {
      name: "TwoColThreeStories",
      path: `${basePath}/TwoColThreeStory`
    },
    {
      name: "TwoColSevenStories",
      path: `${basePath}/TwoColSevenStories`
    },
    {
      name: "ThreeColSixStories",
      path: `${basePath}/ThreeColSixStories`
    },
    {
      name: "ThreeColSevenStory",
      path: `${basePath}/ThreeColSevenStory`
    },
    {
      name: "ElevenStories",
      path: `${basePath}/ElevenStories`
    },
    {
      name: "CollectionFilter",
      path: `${basePath}/CollectionFilter`
    },
    {
      name: "HalfScreenSlider",
      path: `${basePath}/HalfScreenSlider`
    },
    {
      name: "FourStorySlider",
      path: `${basePath}/FourStorySlider`
    },
    {
      name: "FourStorySliderPortrait",
      path: `${basePath}/FourStorySliderPortrait`
    },
    {
      name: "FullScreenSlider",
      path: `${basePath}/FullScreenSlider`
    },
    {
      name: "ThreeColFourteenStories",
      path: `${basePath}/ThreeColFourteenStory`
    },
    {
      name: "FourColTwelveStories",
      path: `${basePath}/FourColTwelveStory`
    },
    {
      name: "TagIntroductionCard",
      path: `${basePath}/TagIntroductionCard`
    },
    {
      name: "AuthorIntroductionCard",
      path: `${basePath}/AuthorIntroductionCard`
    },
    {
      name: "AsideCollection",
      path: `${basePath}/AsideCollection`
    },
    {
      name: "StoryCollection",
      path: `${basePath}/AsideCollection`
    },
    {
      name: "VideoStoryTemplate",
      path: `${basePath}/StoryTemplates/VideoStoryTemplates`
    },
    {
      name: "TextStoryTemplate",
      path: `${basePath}/StoryTemplates/TextStoryTemplates`
    },
    {
      name: "LiveBlogStoryTemplate",
      path: `${basePath}/StoryTemplates/LiveBlogStorytemplates`
    },
    {
      name: "ListicleStoryTemplate",
      path: `${basePath}/StoryTemplates/ListicleStoryTemplates`
    },
    {
      name: "ListComponent",
      path: `${basePath}/ListComponent`
    },
    {
      name: "MagazineEditions",
      path: `${basePath}/MagazineEditions`
    },
    {
      name: "MagazineWidget",
      path: `${basePath}/MagazineWidget`
    },
    {
      name: "MagazineHeaderCard",
      path: `${basePath}/MagazineHeaderCard`
    },
    {
      name: "PhotoStoryTemplate",
      path: `${basePath}/StoryTemplates/PhotoStoryTemplates`
    },
    {
      name: "AuthorsList",
      path: `${basePath}/AuthorsList`
    },
    {
      name: "FourColSixteenStories",
      path: `${basePath}/FourColSixteenStories`
    },
    {
      name: "FourColFiveStories",
      path: `${basePath}/FourColFiveStories`
    },
    {
      name: "TwoColSixStories",
      path: `${basePath}/TwoColSixStories`
    },
    {
      name: "TwoColFourStoryHighlight",
      path: `${basePath}/TwoColFourStoryHighlight`
    },
    { name: "OpinionCollection", path: `${basePath}/OpinionCollection` },
    {
      name: "ThreeColFlexStories",
      path: `${basePath}/ThreeColFlexStories`
    },
    {
      name: "SixColSixStories",
      path: `${basePath}/SixColSixStories`
    },
    {
      name: "TwoColTenStoriesSidebar",
      path: `${basePath}/TwoColTenStoriesSidebar`
    },
    {
      name: "ThreeColTwelveStories",
      path: `${basePath}/ThreeColTwelveStories`
    },
    {
      name: "FourTabbedBigStorySlider",
      path: `${basePath}/FourTabbedBigStorySlider`
    },
    {
      name: "AlternateCollectionFilter",
      path: `${basePath}/AlternateCollectionFilter`
    },
    {
      name: "Listicles",
      path: `${basePath}/Listicles`
    },
    {
      name: "FourColPortraitStories",
      path: `${basePath}/FourColPortraitStories`
    },
    {
      name: "AstrologyCollection",
      path: `${basePath}/AstrologyCollection`
    }
  ];
}

module.exports = { getEntryPoints };
