import { boolean, color, text } from "@storybook/addon-knobs";
import React from "react";
import { optionalSelect, withStore } from "../../../../../storybook";
import { AdPlaceholder } from "../../../Atoms/AdPlaceholder";
import { generateCollection, generateStory } from "../../../Fixture";
import { slotData } from "../../../Fixture/slot-config";
import LiveBlog from "./index";
import Readme from "./README.md";

const story = generateStory("live-blog");
const collection = generateCollection({ stories: 4 });

const storyElementsConfig = {
  summary: {},
  blurb: {},
  blockquote: {},
  quote: {},
  "also-read": {},
  "q-and-a": {},
  question: {},
  answer: {},
};

const label = "BG Color";
const defaultvalue = "#ffffff";

const authorTemplate = {
  default: "default",
  leftAligned: "leftAligned",
  centerAligned: "centerAligned",
};

const iconTypeOptions = {
  "Circular Color Svg": "circular-color-svg",
  "Circular Plain Svg": "circular-plain-svg",
  "Plain Svg": "plain-svg",
  "Plain Color Svg": "plain-color-svg",
  "Square Svg": "square-svg",
};

const shareType = {
  "Vertical Share": "sticky",
  "Horizontal Share": "",
};

const templateTypes = {
  default: "default",
  "Hero Overlay": "hero-overlay",
  "Headline Sideway": "headline-sideway",
  "Hero Priority": "hero-priority",
  "Headline Priority": "headline-priority",
  "Headline Hero Priority": "headline-hero-priority",
};

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

withStore(
  "Rows/Story Templates/Live Blog Story Template",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory",
      },
    },
  },
  Readme
).add("Default", () => {
  const templateConfig = {
    shareIconType: optionalSelect("Social Share Icon Type", iconTypeOptions),
    verticalShare: optionalSelect("Share Type", shareType),
    theme: color(label, defaultvalue),
    noOfVisibleCards: -1,
    initialLoadCount: text("Initial key events count", 4),
    showSection: boolean("Show Section Tag", true),
    templateType: optionalSelect("Template", templateTypes),
    buttonText: text("Key Events Button text", "Load More"),
    publishedDetails: {
      enablePublishedTime: boolean("Show Published Time", true),
      enableUpdatedTime: boolean("Show Updated Time", false),
      showReadTime: boolean("Read time", false),
    },
    authorDetails: {
      template: optionalSelect("Author templates", authorTemplate),
      opts: {
        showBio: boolean("Author Bio", false),
        showImage: boolean("Author Image", false),
        showName: boolean("Author Name", true),
        showLabels: boolean("show labels", true),
        showGuestAuthorName: boolean("show guest author name", false),
        showGuestAuthorImage: boolean("show guest author image", false),
      },
    },
    premiumStoryIconConfig: {
      iconColor: "#F7B500",
      iconType: "star",
      enablePremiumStoryIcon: true,
    },
    asideCollection: {
      data: collection,
      config: {
        title: text("Aside Collection Title", "Trending"),
        theme: color(label, defaultvalue),
        showAuthor: boolean("Show Author", true),
        showTime: boolean("Show Timestamp", true),
      },
      slots: slotData,
    },
  };
  return (
    <LiveBlog
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
