import { boolean, color, text } from "@storybook/addon-knobs";
import React from "react";
import ListicleStoryTemplate from ".";
import { optionalSelect, withStore } from "../../../../../storybook";
import { AdPlaceholder } from "../../../Atoms/AdPlaceholder";
import { generateCollection, generateStory } from "../../../Fixture";
import { slotData } from "../../../Fixture/slot-config";
import Readme from "./README.md";

const story = generateStory("listicle-story");
const collection = generateCollection({ stories: 4 });
const label = "BG Color";
const defaultvalue = "#ffffff";

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

const storyTemplates = {
  Default: "default",
  "Hero Priority": "hero-priority",
  "Headline Priority": "headline-priority",
  "Headline Hero Priority": "headline-hero-priority",
  "Hero Overlay": "hero-overlay",
  "Headline Sideway": "headline-sideway"
};

const sectionTagTemplates = {
  Default: "",
  "Border Bottom Small": "borderBottomSml",
  Solid: "solid",
  "Border Left": "borderLeft"
};

const authorTemplates = {
  default: "default",
  leftAligned: "leftAligned",
  centerAligned: "centerAligned"
};

withStore(
  "Rows/Story Templates/Listicle Story Template",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory"
      }
    }
  },
  Readme
).add("Default", () => {
  const templateConfig = {
    templateType: optionalSelect("Template Options", storyTemplates),
    theme: color(label, defaultvalue),
    noOfVisibleCards: -1,
    showSection: boolean("Show Section Tag", true),
    publishedDetails: {
      showReadTime: boolean("Read time", true),
      enablePublishedTime: boolean("Show Published Time", true),
      enableUpdatedTime: boolean("Show Updated Time", false)
    },
    authorDetails: {
      template: optionalSelect("Author Templates", authorTemplates) || "default",
      opts: {
        showBio: boolean("Author Bio", false),
        showImage: boolean("Author Image", true),
        showName: boolean("Author Name", true)
      }
    },
    sectionTagSettings: {
      template: optionalSelect("Section Template", sectionTagTemplates) || "borderBottomSml",
      borderColor: color("Section Tag Border Color", "#ff214b")
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
        theme: color(label, defaultvalue),
        adSlot: [{ type: "ad", component: configurableSlot }],
        showAuthor: boolean("Author", true),
        showTime: boolean("Timestamp", true)
      },
      slots: slotData
    }
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
    references: {}
  };
  return (
    <ListicleStoryTemplate
      story={story}
      config={templateConfig}
      storyElementsConfig={storyElementsConfig}
      firstChild={<AdPlaceholder height="250px" width="300px" />}
      secondChild={<AdPlaceholder height="250px" width="300px" />}
      adComponent={configurableSlot}
      widgetComp={configurableSlot}
    />
  );
});
