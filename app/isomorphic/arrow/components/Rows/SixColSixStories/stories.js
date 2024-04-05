import React from "react";
import { color, boolean, text } from "@storybook/addon-knobs";
import {
  withStore,
  optionalSelect,
  sectionTagTemplates,
  collectionNameTemplates,
  footerButton,
} from "../../../../storybook";
import SixColSixStories from "./index";
import Readme from "./README.md";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";

import { generateCollection } from "../../Fixture";

const collection = generateCollection({ stories: 6 });

const label = "color";
const defaultvalue = "#ffffff";

const collectionNameDefaultValue = "#ff5858";
const collectionNameBorderColorLabel = "Collection Name Border Color";

const sectionTagBorderColor = "Section Tag Border Color";
const sectionTagDefaultvalue = "#ff5858";

const borderTemplate = {
  default: "noBorder",
  verticalBorder: "fullBorder",
  aroundBorder: "aroundBorder",
};

const footerSlot = () => {
  return <AdPlaceholder />;
};

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

withStore(
  "Rows/Six Col Six Stories ",
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
      slotConfig: [{ type: "story", component: configurableSlot }],
      showSection: boolean("section disable", true),
      showAuthor: boolean("Author disable", true),
      showTime: boolean("Timestamp disable", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      showRowTitle: boolean("Row title", true),
      footerSlotConfig: { footerSlot: footerSlot },
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
      showCardBgColor: boolean("Story Card Background Color", true),
      cardBgColor: boolean("Story Card Background", "#ffffff"),
    };

    return <SixColSixStories collection={collection} config={contextConfig} />;
  });
