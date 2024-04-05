import { boolean, color, text } from "@storybook/addon-knobs";
import React from "react";
import { withStore, optionalSelect } from "../../../../../storybook";
import { AdPlaceholder } from "../../../Atoms/AdPlaceholder";
import { generateCollection, generateStory } from "../../../Fixture";
import { slotData } from "../../../Fixture/slot-config";
import VideoStoryTemplate from "./index";
import Readme from "./README.md";

const story = generateStory();
const collection = generateCollection({ stories: 4 });
const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Aside Collection Name Border Color";
const authorTemplates = {
  default: "default",
  leftAligned: "leftAligned",
  centerAligned: "centerAligned",
};

const shareType = {
  "Vertical Share": "sticky",
  "Horizontal Share": "",
};

const label = "BG Color";
const defaultvalue = "#ffffff";
const iconTypeOptions = {
  "Circular Color Svg": "circular-color-svg",
  "Circular Plain Svg": "circular-plain-svg",
  "Plain Svg": "plain-svg",
  "Plain Color Svg": "plain-color-svg",
  "Square Svg": "square-svg",
};

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

withStore(
  "Rows/Story Templates/Video Story Template",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory",
      },
    },
  },
  Readme
)
  .add("Default", () => {
    const templateConfig = {
      shareIconType: optionalSelect("Social Share Icon Type", iconTypeOptions),
      verticalShare: optionalSelect("Share Type", shareType),
      theme: color(label, defaultvalue),
      noOfVisibleCards: 1,
      showSection: boolean("Show Section Tag", true),
      publishedDetails: {
        enablePublishedTime: boolean("Show Published Time", true),
        enableUpdatedTime: boolean("Show Updated Time", false),
        showReadTime: boolean("Read time", true),
      },
      premiumStoryIconConfig: {
        iconColor: "#F7B500",
        iconType: "star",
        enablePremiumStoryIcon: true,
      },
      asideCollection: {
        data: collection,
        config: {
          collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
          title: text("Aside Collection Title", "Trending"),
          theme: color(label, defaultvalue),
          showAuthor: boolean("Author", true),
          showTime: boolean("Timestamp", true),
        },
        slots: slotData,
      },
      authorDetails: {
        template: optionalSelect("Author Templates", authorTemplates) || "default",
        opts: {
          showBio: boolean("Author Bio", false),
          showImage: boolean("Author Image", true),
          showName: boolean("Author Name", true),
          showLabels: boolean("show labels", true),
          showGuestAuthorName: boolean("show guest author name", false),
          showGuestAuthorImage: boolean("show guest author image", false),
        },
      },
    };
    const storyElementsConfig = {
      summary: {},
      blurb: {},
      blockquote: {},
      quote: {},
      "also-read": {},
      "q-and-a": {},
      question: {},
      answer: {},
      references: {},
    };
    return (
      <VideoStoryTemplate
        story={story}
        config={templateConfig}
        storyElementsConfig={storyElementsConfig}
        adComponent={configurableSlot}
        widgetComp={configurableSlot}
        firstChild={<AdPlaceholder height="250px" width="300px" />}
        secondChild={<AdPlaceholder height="250px" width="300px" />}
      />
    );
  })
  .add("Hero Priority", () => {
    const templateConfig = {
      shareIconType: optionalSelect("Social Share Icon Type", iconTypeOptions),
      verticalShare: optionalSelect("Share Type", shareType),
      theme: color(label, defaultvalue),
      noOfVisibleCards: -1,
      templateType: "hero-priority",
      showSection: boolean("Show Section Tag", true),
      publishedDetails: {
        enablePublishedTime: boolean("Show Published Time", true),
        enableUpdatedTime: boolean("Show Updated Time", false),
        showReadTime: boolean("Read time", true),
      },
      premiumStoryIconConfig: {
        iconColor: "#F7B500",
        iconType: "star",
        enablePremiumStoryIcon: true,
      },
      asideCollection: {
        data: collection,
        config: {
          collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
          title: text("Aside Collection Title", "Trending"),
          theme: color(label, defaultvalue),
          showAuthor: boolean("Author", true),
          showTime: boolean("Timestamp", true),
        },
        slots: slotData,
      },
    };
    const storyElementsConfig = {
      summary: {},
      blurb: {},
      blockquote: {},
      quote: {},
      "also-read": {},
      "q-and-a": {},
      question: {},
      answer: {},
      references: {},
    };
    return (
      <VideoStoryTemplate
        story={story}
        config={templateConfig}
        storyElementsConfig={storyElementsConfig}
        adComponent={configurableSlot}
        widgetComp={configurableSlot}
        firstChild={<AdPlaceholder height="250px" width="300px" />}
        secondChild={<AdPlaceholder height="250px" width="300px" />}
      />
    );
  })
  .add("Headline Priority", () => {
    const templateConfig = {
      shareIconType: optionalSelect("Social Share Icon Type", iconTypeOptions),
      verticalShare: optionalSelect("Share Type", shareType),
      theme: color(label, defaultvalue),
      noOfVisibleCards: -1,
      templateType: "headline-priority",
      showSection: boolean("Show Section Tag", true),
      publishedDetails: {
        enablePublishedTime: boolean("Show Published Time", true),
        enableUpdatedTime: boolean("Show Updated Time", false),
        showReadTime: boolean("Read time", true),
      },
      premiumStoryIconConfig: {
        iconColor: "#F7B500",
        iconType: "star",
        enablePremiumStoryIcon: true,
      },
      asideCollection: {
        data: collection,
        config: {
          collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
          title: text("Aside Collection Title", "Trending"),
          theme: color(label, defaultvalue),
          adSlot: [{ type: "ad", component: configurableSlot }],
          showAuthor: boolean("Author", true),
          showTime: boolean("Timestamp", true),
        },
        slots: slotData,
      },
    };
    const storyElementsConfig = {
      summary: {},
      blurb: {},
      blockquote: {},
      quote: {},
      "also-read": {},
      "q-and-a": {},
      question: {},
      answer: {},
      references: {},
    };
    return (
      <VideoStoryTemplate
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
