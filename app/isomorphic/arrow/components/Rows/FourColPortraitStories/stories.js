import React from "react";
import { color, boolean, text } from "@storybook/addon-knobs";
import { withStore, optionalSelect, sectionTagTemplates, collectionNameTemplates } from "../../../../storybook";
import FourColPortraitStories from "./index";
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

const borderTemplate = {
  default: "",
  border: "full",
};

const footerButton = {
  SubsequentLoadCount: "SubsequentLoadCount",
  NavigateToPage: "NavigateToPage",
};

const footerSlot = () => {
  return <AdPlaceholder />;
};
withStore(
  "Rows/Four Col Portrait Stories ",
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
      showSection: boolean("section disable", false),
      showAuthor: boolean("Author disable", false),
      showTime: boolean("Timestamp disable", true),
      showRowTitle: boolean("Row title", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      footerSlotConfig: { footerSlot: footerSlot },
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", false),
      subsequentLoadCount: text("Subsequent Load", 8),
    };

    return <FourColPortraitStories collection={collection} config={contextConfig} />;
  });
