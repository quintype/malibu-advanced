import React from "react";
import { color, boolean, text } from "@storybook/addon-knobs";
import { withStore, optionalSelect, sectionTagTemplates, collectionNameTemplates } from "../../../../storybook";
import TwoColTenStoriesHighlight from "./index";
import Readme from "./README.md";
import { generateCollections } from "../../Fixture";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";

const collection = generateCollections(2);

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

withStore(
  "Rows/Two Col Ten Stories Sidebar ",
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
      collectionNameBorderColor: color("Collection Name Border Color", "#3a9fdd"),
      borderColor: color("Section Tag Border Color", "#3a9fdd"),
      theme: color("color", "#ffffff"),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      showSection: boolean("Show Section", true),
      showAuthor: boolean("Show Author", true),
      showTime: boolean("Show Time", true),
      buttonText: text("Footer text", "Read More"),
      showRowTitle: boolean("Row title", true),
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
      slotConfig: [{ type: "ad", component: configurableSlot }]
    };

    return <TwoColTenStoriesHighlight collection={collection} config={contextConfig} />;
  });
