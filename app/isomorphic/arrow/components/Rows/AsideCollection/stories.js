import { boolean, color, text } from "@storybook/addon-knobs";
import React from "react";
import AsideCollection from ".";
import { collectionNameTemplates, optionalSelect, withStore } from "../../../../storybook";
import { AdPlaceholder } from "../../Atoms/AdPlaceholder";
import { generateStory } from "../../Fixture";
import { slotData } from "../../Fixture/slot-config";
import Readme from "./README.md";

const story = generateStory();
const stories = [story, story, story];
const label = "Background color";
const defaultvalue = "#ffffff";
const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Collection Name Border Color";

const configurableSlot = () => {
  return <AdPlaceholder height="250px" width="300px" />;
};

withStore(
  "Rows/Aside Collection",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com"
      }
    }
  },
  Readme
).add("Aside Collection template", () => {
  const config = {
    title: text("Title", "Recommended Stories"),
    theme: color(label, defaultvalue),
    showAuthor: boolean("Author", true),
    showTime: boolean("Timestamp", true),
    showReadTime: boolean("Read time", true),
    showRowTitle: boolean("Collection name", true),
    collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
    collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue)
  };
  return (
    <AsideCollection
      data={stories}
      config={config}
      adComp={configurableSlot}
      widgetComp={configurableSlot}
      slots={slotData}
      sticky={true}
    />
  );
});
