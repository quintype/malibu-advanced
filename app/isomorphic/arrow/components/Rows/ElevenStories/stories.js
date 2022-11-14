import {
  withStore,
  optionalSelect,
  sectionTagTemplates,
  collectionNameTemplates,
  footerButton,
} from "../../../../storybook";
import Readme from "./README.md";
import { color, boolean, text } from "@storybook/addon-knobs";
import ElevenStories from "./index";
import React from "react";
import { generateCollectionsWithStories } from "../../Fixture";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";

const collection = generateCollectionsWithStories(2);

const label = "color";
const defaultvalue = "#ffffff";

const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Collection Name Border Color";

const sectionTagBorderColor = "Section Tag Border Color";
const sectionTagDefaultvalue = "#3a9fdd";

const footerSlot = () => {
  return <AdPlaceholder />;
};

// TODO: Add Ad/Widget Slot Config Option
const slotConfigOptions = {
  Stories: [{ type: "story" }],
  Collection: [{ type: "collection" }],
};

withStore(
  "Rows/Eleven Stories Row",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory",
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
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      showSection: boolean("section disable", true),
      showRowTitle: boolean("Row Title disable", true),
      showAuthor: boolean("Author disable", true),
      showTime: boolean("Timestamp disable", true),
      showSubheadline: boolean("Subheadline  disable", true),
      withseparator: boolean("separator", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      slotConfig: optionalSelect("Slot Config", slotConfigOptions, [{ type: "story" }]),
      footerSlotConfig: { footerSlot: footerSlot },
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
    };
    return <ElevenStories collection={collection} config={contextConfig} />;
  });
