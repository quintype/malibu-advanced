import React from "react";
import { color, boolean, text } from "@storybook/addon-knobs";
import {
  withStore,
  optionalSelect,
  sectionTagTemplates,
  collectionNameTemplates,
  footerButton,
} from "../../../../storybook";
import FourTabbedBigStorySlider from "./index";
import Readme from "./README.md";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";

import { generateCollection } from "../../Fixture";

const collection = generateCollection({ stories: 8 });

const label = "color";
const defaultvalue = "#ffffff";

const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Collection Name Border Color";

const sectionTagBorderColor = "Section Tag Border Color";
const sectionTagDefaultvalue = "#3a9fdd";

const footerSlot = () => {
  return <AdPlaceholder />;
};

withStore(
  "Rows/Four Tabbed Big Story Slider ",
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
      theme: color(label, defaultvalue),
      showRowTitle: boolean("Row title", true),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      borderColor: color(sectionTagBorderColor, sectionTagDefaultvalue),
      showSection: boolean("section disable", true),
      showAuthor: boolean("Author disable", true),
      showTime: boolean("Timestamp disable", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      footerSlotConfig: { footerSlot: footerSlot },
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
      showSubheadline: boolean("Show subheadline", true),
    };

    return <FourTabbedBigStorySlider collection={collection} config={contextConfig} />;
  });
