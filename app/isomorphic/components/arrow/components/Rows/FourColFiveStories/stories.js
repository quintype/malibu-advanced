import React from "react";
import { color, boolean, text } from "@storybook/addon-knobs";
import Readme from "./README.md";
import {
  withStore,
  optionalSelect,
  sectionTagTemplates,
  collectionNameTemplates,
  footerButton
} from "../../../../storybook";
import TwoColSixStories from "./index";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";

import { generateCollection } from "../../Fixture";

const collection = generateCollection({ stories: 5 });

const label = "BG Color";
const defaultvalue = "#ffffff";

const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Collection Name Border Color";

const sectionTagBorderColor = "Section Tag Border Color";
const sectionTagDefaultvalue = "#3a9fdd";

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

const border = {
  default: "fullBorder",
  noBorder: "noBorder"
};

withStore(
  "Rows/Four Col Five Stories ",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com"
      }
    }
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1000px", margin: "auto" }}>{story()}</div>)
  .add("Default", () => {
    const contextConfig = {
      collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
      borderColor: color(sectionTagBorderColor, sectionTagDefaultvalue),
      theme: color(label, defaultvalue),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      slotConfig: [{ type: "story", component: configurableSlot }],
      showSection: boolean("Section tag", true),
      showAuthor: boolean("Author", true),
      showTime: boolean("Timestamp", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      showButton: boolean("Show button", true),
      buttonText: text("Button text", "Read More"),
      showRowTitle: boolean("Row title", true),
      showReadTime: boolean("Read time", true),
      border: optionalSelect("Border settings", border)
    };
    return <TwoColSixStories collection={collection} config={contextConfig} />;
  });
