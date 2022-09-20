import React from "react";
import { color, boolean, text } from "@storybook/addon-knobs";
import {
  withStore,
  optionalSelect,
  sectionTagTemplates,
  collectionNameTemplates,
  footerButton,
} from "../../../../storybook";
import ThreeColSevenStory from "./index";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";
import Readme from "./README.md";

import { generateCollection } from "../../Fixture";

const collection = generateCollection({ stories: 8 });

const label = "color";
const defaultvalue = "#ffffff";

const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Collection Name Border Color";

const sectionTagBorderColor = "Section Tag Border Color";
const sectionTagDefaultvalue = "#3a9fdd";

const borderTemplate = {
  default: "",
  border: "bottom",
};

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};
const footerSlot = () => {
  return <AdPlaceholder />;
};
withStore(
  "Rows/Three Col Seven Stories ",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1000px", margin: "auto" }}>{story()}</div>)
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
      showTime: boolean("Timestamp disable", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      showRowTitle: boolean("Row title", true),
      slotConfig: [{ type: "story", component: configurableSlot }],
      footerSlotConfig: { footerSlot: footerSlot },
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
    };

    return <ThreeColSevenStory collection={collection} config={contextConfig} />;
  });
