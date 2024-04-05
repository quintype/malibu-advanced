import { boolean, color, text } from "@storybook/addon-knobs";
import React from "react";
import { optionalSelect, withStore } from "../../../../../storybook";
import { AdPlaceholder } from "../../../Atoms/AdPlaceholder";
import { generateCollection, generateStory } from "../../../Fixture";
import { slotData } from "../../../Fixture/slot-config";
import TextStoryTemplate from "./index";
import Readme from "./README.md";

const story = generateStory();
const collection = generateCollection({ stories: 4 });
const authorTemplate = {
  default: "default",
  leftAligned: "leftAligned",
  centerAligned: "centerAligned",
  "No value": ""
};
const imageTypeOptions = {
  "Full Bleed": "fullBleed",
  "With In Container": "container"
};

const iconTypeOptions = {
  "Circular Color Svg": "circular-color-svg",
  "Circular Plain Svg": "circular-plain-svg",
  "Plain Svg": "plain-svg",
  "Plain Color Svg": "plain-color-svg",
  "Square Svg": "square-svg"
};

const templates = {
  "Hero Priority Left": "default",
  "Hero Priority Center": "hero-priority-center",
  "Headline Hero Priority": "headline-hero-priority",
  "Hero Vertical Priority": "hero-vertical-priority",
  "Headline Priority": "headline-priority",
  "Headline Overlay Priority": "headline-overlay-priority"
};

const storyElementsConfig = {
  summary: {},
  blurb: {},
  blockquote: {},
  quote: {},
  "also-read": {},
  "q-and-a": {},
  question: {},
  answer: {}
};

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

const sortFirstOptions = {
  "Headline First": "headline-first",
  "Image First": "image-first"
};

const shareType = {
  "Vertical Share": "sticky",
  "Horizontal Share": ""
};

withStore(
  "Rows/Story Templates/Text Story Template",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory"
      }
    }
  },
  Readme
).add("default", () => {
  const templateConfig = {
    shareIconType: optionalSelect("Social Share Icon Type", iconTypeOptions),
    verticalShare: optionalSelect("Share Type", shareType),
    theme: color("BG Color", "#ffffff"),
    imageRender: optionalSelect("Image Type", imageTypeOptions),
    sort: optionalSelect("Sort Options", sortFirstOptions),
    noOfVisibleCards: -1,
    showSection: boolean("Show Section Tag", true),
    templateType: optionalSelect("Template Options", templates),
    publishedDetails: {
      enablePublishedTime: boolean("Show Published Time", true),
      enableUpdatedTime: boolean("Show Updated Time", false),
      showReadTime: boolean("Read time", true)
    },
    premiumStoryIconConfig: {
      iconColor: "#F7B500",
      iconType: "star",
      enablePremiumStoryIcon: true
    },
    asideCollection: {
      data: collection,
      config: {
        collectionNameBorderColor: color("Aside Collection Name Border Color", "#3a9fdd"),
        title: text("Aside Collection Title", "Trending"),
        theme: color("BG Color", "#ffffff")
      },
      slots: slotData
    },
    authorDetails: {
      template: optionalSelect("Author Template Options", authorTemplate, "default"),
      opts: {
        showBio: false,
        showImage: true,
        showName: true,
        showLabels: boolean("show labels", true),
        showGuestAuthorName: boolean("show guest author name", false),
        showGuestAuthorImage: boolean("show guest author image", false)
      }
    }
  };
  return (
    <TextStoryTemplate
      story={story}
      config={templateConfig}
      storyElementsConfig={storyElementsConfig}
      adComponent={configurableSlot}
      widgetComp={configurableSlot}
      firstChild={<AdPlaceholder height="250px" width="300px" />}
      secondChild={<AdPlaceholder height="250px" width="300px" />}
    />
  );
});
