import React from "react";
import { color, boolean } from "@storybook/addon-knobs";
import { withStore, optionalSelect, sectionTagTemplates, collectionNameTemplates } from "../../../../storybook";
import ThreeColFourteenStories from "./index";
import Readme from "././README.md";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";

import { generateCollection } from "../../Fixture";

const collection = generateCollection({ stories: 20 });

const label = "color";
const defaultvalue = "#ffffff";

const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Collection Name Border Color";

const sectionTagBorderColor = "Section Tag Border Color";
const sectionTagDefaultvalue = "#3a9fdd";

const borderOptions = {
  "No Value": "",
  bottom: "bottom"
};

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

withStore(
  "Rows/Three Col Fourteen Stories",
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
      border: optionalSelect("Border Level", borderOptions),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      showSection: boolean("section disable", true),
      showAuthor: boolean("Author disable", false),
      showTime: boolean("Timestamp disable", false),
      showRowTitle: boolean("Row title", true),
      showSubheadline: boolean("show sub headline", false),
      slotConfig: [{ type: "ad", component: configurableSlot }],
      showReadTime: boolean("Read time", true)
    };

    return <ThreeColFourteenStories collection={collection} config={contextConfig} />;
  });
