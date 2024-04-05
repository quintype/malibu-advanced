import React from "react";
import {
  withStore,
  optionalSelect,
  sectionTagTemplates,
  collectionNameTemplates,
  footerButton,
} from "../../../../storybook";
import { color, boolean, text, number } from "@storybook/addon-knobs";
import HalfScreenSlider from "./index";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";
import { generateCollection } from "../../Fixture";
import Readme from "./README.md";

const collection = generateCollection({ stories: 8 });

const label = "color";
const defaultvalue = "#ffffff";

const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Collection Name Border Color";

const sectionTagBorderColor = "Section Tag Border Color";
const sectionTagDefaultvalue = "#3a9fdd";

const borderTemplate = {
  default: " ",
  border: "full",
};

const navigationStyle = {
  defaultvalue: "none",
  dots: "dots",
  dashes: "dashes",
};
const footerSlot = () => {
  return <AdPlaceholder />;
};

withStore(
  "Rows/Half Screen Slider ",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1140px", margin: "auto" }}>{story()}</div>)
  .add("Default", () => {
    const contextConfig = {
      collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
      borderColor: color(sectionTagBorderColor, sectionTagDefaultvalue),
      theme: color(label, defaultvalue),
      border: optionalSelect("Border", borderTemplate),
      showSection: boolean("section disable", true),
      showAuthor: boolean("Author disable", true),
      showTime: boolean("Timestamp disable", true),
      showRowTitle: boolean("Row title", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      collectionNameTemplate: optionalSelect("Collection row Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      buttonText: text("Footer text"),
      slideIndicator: optionalSelect("Slide Indicator", navigationStyle),
      navigationArrows: boolean("Arrows enable", true),
      isInfinite: boolean("Autoplay", false),
      numberOfStoriesToShow: number("Number of slide to show", 3),
      footerSlotConfig: { footerSlot: footerSlot },
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
    };
    return <HalfScreenSlider collection={collection} config={contextConfig} />;
  });

withStore(
  "Rows/Half Screen Slider",
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
      border: optionalSelect("Border", borderTemplate),
      showSection: boolean("section disable", true),
      showAuthor: boolean("Author disable", true),
      showTime: boolean("Timestamp disable", true),
      showRowTitle: boolean("Row title", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      collectionNameTemplate: optionalSelect("Collection row Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      buttonText: text("Footer text"),
      slideIndicator: optionalSelect("Slide Indicator", navigationStyle),
      navigationArrows: boolean("Arrows enable", true),
      isInfinite: boolean("Autoplay", false),
      numberOfStoriesToShow: number("Number of slide to show", 3),
      footerSlotConfig: { footerSlot: footerSlot },
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
    };
    return <HalfScreenSlider collection={collection} config={contextConfig} />;
  });
