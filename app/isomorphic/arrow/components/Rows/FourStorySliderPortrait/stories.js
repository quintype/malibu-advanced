import React from "react";
import { withStore, optionalSelect, sectionTagTemplates, collectionNameTemplates } from "../../../../storybook";
import FourStorySliderPortrait from "./index.js";
import { generateCollection } from "../../Fixture";
import { color, boolean, text, number } from "@storybook/addon-knobs";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";
import Readme from "./README.md";

const collection = generateCollection({ stories: 13 });

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
const borderTemplate = {
  default: " ",
  border: "full",
};
const footerButton = {
  NavigateToPage: "NavigateToPage",
  SubsequentLoadCount: "SubsequentLoadCount",
};
const footerSlot = () => {
  return <AdPlaceholder />;
};

withStore(
  "Rows/Four Story Slider Portrait",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        language: {
          direction: "ltr",
        },
      },
    },
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1172px", margin: "auto" }}>{story()}</div>)
  .add("Default", () => {
    const contextConfig = {
      collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
      borderColor: color(sectionTagBorderColor, sectionTagDefaultvalue),
      theme: color(label, defaultvalue),
      border: optionalSelect("Border", borderTemplate),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      showSection: boolean("section disable", true),
      showAuthor: boolean("Author disable", true),
      showRowTitle: boolean("Row Title disable", true),
      showTime: boolean("Timestamp disable", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      numberOfStoriesToShow: number("Number of slide to show", 10),
      navigationArrows: boolean("Arrows enable", true),
      isInfinite: boolean("Autoplay", false),
      slideIndicator: optionalSelect("Slide Indicator", navigationStyle),
      footerSlotConfig: { footerSlot: footerSlot },
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
    };

    return <FourStorySliderPortrait collection={collection} config={contextConfig} />;
  });

withStore(
  "Rows/Four Story Slider Portrait",
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
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      showSection: boolean("section disable", true),
      showAuthor: boolean("Author disable", true),
      showRowTitle: boolean("Row Title disable", true),
      showTime: boolean("Timestamp disable", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      numberOfStoriesToShow: number("Number of slide to show", 10),
      navigationArrows: boolean("Arrows enable", true),
      isInfinite: boolean("Autoplay", false),
      slideIndicator: optionalSelect("Slide Indicator", navigationStyle),
      footerSlotConfig: { footerSlot: footerSlot },
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
    };

    return <FourStorySliderPortrait collection={collection} config={contextConfig} />;
  });
