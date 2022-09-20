import React from "react";
import { color, boolean, text } from "@storybook/addon-knobs";
import { withStore, optionalSelect, collectionNameTemplates } from "../../../../storybook";
import OpinionCollection from "./index";
import Readme from "./README.md";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";

import { generateCollection } from "../../Fixture";

const collection = generateCollection({ stories: 6 });

const label = "BG Color";
const defaultvalue = "#ffffff";

const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Collection Name Border Color";

const border = {
  default: "fullBorder",
  noBorder: "noBorder",
};

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

withStore(
  "Rows/Opinion Collection",
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
      theme: color(label, defaultvalue),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      showAuthor: boolean("Show Author", true),
      showTime: boolean("Timestamp", true),
      showButton: boolean("Show button", true),
      buttonText: text("Button text", "Read More"),
      showRowTitle: boolean("Row title", true),
      showReadTime: boolean("Read time", true),
      border: optionalSelect("Border settings", border),
    };
    return <OpinionCollection collection={collection} config={contextConfig} />;
  });

withStore(
  "Rows/Opinion Collection",
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
  .add("With AD", () => {
    const contextConfig = {
      collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
      theme: color(label, defaultvalue),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      showAuthor: boolean("Show Author", true),
      showTime: boolean("Timestamp", true),
      showButton: boolean("Show button", true),
      buttonText: text("Button text", "Read More"),
      showRowTitle: boolean("Row title", true),
      showReadTime: boolean("Read time", true),
      border: optionalSelect("Border settings", border),
      slotConfig: [{ type: "ad", component: configurableSlot }],
    };
    return <OpinionCollection collection={collection} config={contextConfig} />;
  });
