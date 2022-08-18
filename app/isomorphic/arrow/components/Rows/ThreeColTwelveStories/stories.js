import React from "react";
import { generateCollections } from "../../Fixture";
import { color, boolean, text } from "@storybook/addon-knobs";
import {
  withStore,
  optionalSelect,
  collectionNameTemplates,
  footerButton,
  sectionTagTemplates
} from "../../../../storybook";
import Readme from "./README.md";
import ThreeColTwelveStories from "./index";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";

const collection = generateCollections(3);

const configurableSlot = () => {
  return <AdPlaceholder height="600px" width="300px" />;
};

withStore(
  "Rows/Three Col Twelve Stories",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com"
      }
    }
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1172px", margin: "auto" }}>{story()}</div>)
  .add("Default", () => {
    const contextConfig = {
      collectionNameBorderColor: color("Collection Name Border Color", "#c70000"),
      theme: color("BG Color", "#ffffff"),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      borderColor: color("Section Tag Border Color", "#3a9fdd"),
      withSeparator: boolean("Separator", true),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates, "borderLeft"),
      showAuthor: boolean("Author disable", true),
      showTime: boolean("Timestamp disable", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
      slotConfig: [{ type: "story", component: configurableSlot }]
    };

    return <ThreeColTwelveStories collection={collection} config={contextConfig} />;
  });
