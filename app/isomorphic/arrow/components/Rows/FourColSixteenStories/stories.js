import React from "react";
import FourColSixteenStories from ".";
import { generateCollections } from "../../Fixture";
import { color, boolean, text, number } from "@storybook/addon-knobs";
import Readme from "./README.md";
import {
  withStore,
  optionalSelect,
  sectionTagTemplates,
  collectionNameTemplates,
  footerButton,
} from "../../../../storybook";

const collection = generateCollections(4);

withStore(
  "Rows/Four Col Sixteen Stories",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "1140px", margin: "auto" }}>{story()}</div>)
  .add("Default", () => {
    const contextConfig = {
      collectionNameBorderColor: color("Collection Name Border Color", "#3a9fdd"),
      borderColor: color("Section Tag Border Color", "#3a9fdd"),
      theme: color("BG Color", "#ffffff"),
      withSeparator: boolean("Separator", true),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      showSection: boolean("section disable", true),
      showAuthor: boolean("Author disable", true),
      showTime: boolean("Timestamp disable", true),
      showRowTitle: boolean("Row title", true),
      footerButton: optionalSelect("Footer Button", footerButton),
      buttonText: text("Footer text", "Read More"),
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
      numberOfStoriesToShowInEachColumn: number("Number of stories to show in each column", 4),
    };
    return <FourColSixteenStories collection={collection} config={contextConfig} />;
  });
