import ListComponent from "./index";
import { withStore, optionalSelect, sectionTagTemplates, collectionNameTemplates } from "../../../../storybook";

import React from "react";
import { color, boolean, text } from "@storybook/addon-knobs";
import { generateCollection } from "../../Fixture/";
import readme from "./README.md";

const label = "color";
const defaultvalue = "#ffffff";

const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Collection Name Border Color";

const sectionTagBorderColor = "Section Tag Border Color";
const sectionTagDefaultvalue = "#3a9fdd";

const collection = generateCollection({ stories: 10 });
const borderOptions = {
  "No Value": "",
  bottom: "bottom",
  full: "full"
};
const footerButton = {
  SubsequentLoadCount: "SubsequentLoadCount"
};

const getMoreStories = () => {
  console.log("load more data");
};

withStore(
  "Rows/List stories",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com"
      }
    }
  },
  readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1000px", margin: "auto" }}>{story()}</div>)
  .add("Default", () => {
    const contextConfig = {
      collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
      borderColor: color(sectionTagBorderColor, sectionTagDefaultvalue),
      theme: color(label, defaultvalue),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      border: optionalSelect("Border Level", borderOptions),
      showSection: boolean("Section disable", true),
      showAuthor: boolean("Author disable", true),
      showTime: boolean("Timestamp disable", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      showRowTitle: boolean("Row title", true),
      initialLoadCount: text("Initial Load Count", 6),
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true)
    };
    return <ListComponent collection={collection} config={contextConfig} getMoreStories={getMoreStories} />;
  });
