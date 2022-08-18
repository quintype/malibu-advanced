import { boolean, color, text } from "@storybook/addon-knobs";
import React from "react";
import { optionalSelect, withStore } from "../../../../../storybook";
import { AdPlaceholder } from "../../../Atoms/AdPlaceholder";
import { generateCollection, generateStory } from "../../../Fixture";
import { slotData } from "../../../Fixture/slot-config";
import PhotoStory from "./index";

const story = generateStory("photo-story");
const collection = generateCollection({ stories: 4 });
const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Aside Collection Name Border Color";

const imageTypeOptions = {
  "Full Bleed": "fullBleed",
  "With In Container": "container"
};

const templates = {
  "Hero Priority Left": "default",
  "Hero Priority Center": "hero-priority-center",
  "Headline Priority": "headline-priority"
};

const iconTypeOptions = {
  "Circular Color Svg": "circular-color-svg",
  "Circular Plain Svg": "circular-plain-svg",
  "Plain Svg": "plain-svg",
  "Plain Color Svg": "plain-color-svg",
  "Square Svg": "square-svg"
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

const label = "BG Color";
const defaultvalue = "#ffffff";

const authorTemplate = {
  default: "default",
  leftAligned: "leftAligned",
  centerAligned: "centerAligned"
};

const shareType = {
  "Vertical Share": "sticky",
  "Horizontal Share": ""
};

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

withStore("Rows/Story Templates/Photo Story Template", {
  qt: {
    config: {
      "cdn-image": "thumbor-stg.assettype.com",
      mountAt: "/sub-directory"
    }
  }
}).add("Default", () => {
  const templateConfig = {
    shareIconType: optionalSelect("Social Share Icon Type", iconTypeOptions),
    verticalShare: optionalSelect("Share Type", shareType),
    theme: color(label, defaultvalue),
    noOfVisibleCards: -1,
    showSection: boolean("Show Section Tag", true),
    templateType: optionalSelect("Template Options", templates),
    imageRender: optionalSelect("image Options", imageTypeOptions),
    publishedDetails: {
      enablePublishedTime: boolean("Show Published Time", true),
      enableUpdatedTime: boolean("Show Updated Time", false),
      showReadTime: boolean("Read time", true)
    },
    authorDetails: {
      template: optionalSelect("temp", authorTemplate),
      opts: {
        showBio: boolean("bio", true),
        showImage: boolean("image", true),
        showName: boolean("Author Name", true)
      }
    },
    premiumStoryIconConfig: {
      iconColor: "#F7B500",
      iconType: "star",
      enablePremiumStoryIcon: true
    },
    asideCollection: {
      data: collection,
      config: {
        collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
        title: text("Aside Collection Title", "Trending"),
        theme: color(label, defaultvalue),
        adSlot: [{ type: "ad", component: configurableSlot }],
        showAuthor: boolean("Author", true),
        showTime: boolean("Timestamp", true)
      },
      slots: slotData
    }
  };

  return (
    <div>
      <PhotoStory
        story={story}
        config={templateConfig}
        storyElementsConfig={storyElementsConfig}
        adComponent={configurableSlot}
        widgetComp={configurableSlot}
        firstChild={<AdPlaceholder height="250px" width="300px" />}
        secondChild={<AdPlaceholder height="250px" width="300px" />}
      />
    </div>
  );
});
