import { color, boolean, number } from "@storybook/addon-knobs";
import {
  withStore,
  optionalSelect,
  sectionTagTemplates,
  collectionNameTemplates,
  footerButton,
} from "../../../../storybook";
import FullScreenSlider from "./index";
import { generateCollection } from "../../Fixture/";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";
import React from "react";
import Readme from "./README.md";

const collection = generateCollection({ stories: 8 });

const label = "color";
const defaultvalue = "#ffffff";

const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Collection Name Border Color";

const sectionTagBorderColor = "Section Tag Border Color";
const sectionTagDefaultvalue = "#3a9fdd";

const navigationStyle = {
  defaultvalue: "none",
  dots: "dots",
  dashes: "dashes",
};
const contentAlignment = {
  defaultvalue: "left",
  center: "center",
};

const footerSlot = () => {
  return <AdPlaceholder />;
};

withStore(
  "Rows/Full Screen Slider ",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
).add("Default", () => {
  const contextConfig = {
    collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
    borderColor: color(sectionTagBorderColor, sectionTagDefaultvalue),
    theme: color(label, defaultvalue),
    collectionNameTemplate: optionalSelect("Collection Templates", collectionNameTemplates),
    sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
    showSection: boolean("section disable", true),
    showAuthor: boolean("Author disable", true),
    showRowTitle: boolean("Row Title disable", true),
    showTime: boolean("Timestamp disable", true),
    showSubheadline: boolean("subheadline enable ", false),
    isFullWidth: boolean("isFullWidth", false),
    numberOfStoriesToShow: number("Number of slide to show", 8),
    isInfinite: boolean("Autoplay", false),
    slideIndicator: optionalSelect("Slide Indicator", navigationStyle),
    navigationArrows: boolean("Arrows enable", true),
    contentAlignment: optionalSelect("content alignment", contentAlignment),
    footerButton: optionalSelect("Footer Button", footerButton),
    footerSlotConfig: { footerSlot: footerSlot },
    showButton: boolean("Show button", true),
    showReadTime: boolean("Read time", true),
  };
  return <FullScreenSlider collection={collection} config={contextConfig} />;
});

withStore(
  "Rows/Full Screen Slider",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        language: {
          direction: "rtl",
        },
      },
    },
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1000px", margin: "auto", direction: "rtl" }}>{story()}</div>)
  .add("Support Rtl ", () => {
    const contextConfig = {
      collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
      borderColor: color(sectionTagBorderColor, sectionTagDefaultvalue),
      theme: color(label, defaultvalue),
      collectionNameTemplate: optionalSelect("Collection Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      showSection: boolean("section disable", true),
      showAuthor: boolean("Author disable", true),
      showRowTitle: boolean("Row Title disable", true),
      showTime: boolean("Timestamp disable", true),
      showSubheadline: boolean("subheadline enable ", false),
      isFullWidth: boolean("isFullWidth", false),
      numberOfStoriesToShow: number("Number of slide to show", 8),
      isInfinite: boolean("Autoplay", false),
      slideIndicator: optionalSelect("Slide Indicator", navigationStyle),
      navigationArrows: boolean("Arrows enable", true),
      contentAlignment: optionalSelect("content alignment", contentAlignment),
      footerButton: optionalSelect("Footer Button", footerButton),
      footerSlotConfig: { footerSlot: footerSlot },
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
    };
    return <FullScreenSlider collection={collection} config={contextConfig} />;
  });
