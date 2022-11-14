import React from "react";
import { color, boolean, text } from "@storybook/addon-knobs";
import { withStore, optionalSelect, sectionTagTemplates, collectionNameTemplates } from "../../../../storybook";
import TwoColFourStoryHighlight from "./index";
import Readme from "./README.md";
import { generateCollection } from "../../Fixture";

const collection = generateCollection({ stories: 4 });

const bulletColorTypeTemplates = {
  default: "Default",
  custom: "Custom",
};

withStore(
  "Rows/Two Col Four Story Highlight ",
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
      collectionNameBorderColor: color("Collection Name Border Color", "#3a9fdd"),
      borderColor: color("Section Tag Border Color", "#3a9fdd"),
      theme: color("color", "#ffffff"),
      showBorder: boolean("Show Border", true),
      collectionNameTemplate: optionalSelect("Collection Name Templates", collectionNameTemplates),
      sectionTagTemplate: optionalSelect("Section Tag Templates", sectionTagTemplates),
      showSection: boolean("Show Section", true),
      showAuthor: boolean("Show Author", true),
      showTime: boolean("Show Time", true),
      buttonText: text("Footer text", "Read More"),
      showRowTitle: boolean("Row title", true),
      showButton: boolean("Show button", true),
      showReadTime: boolean("Read time", true),
      showBullet: boolean("Show Bullet", true),
      customBulletColor: color("Bullet Color", ""),
      bulletColorType: optionalSelect("Bullet Color Type", bulletColorTypeTemplates),
    };

    return <TwoColFourStoryHighlight collection={collection} config={contextConfig} />;
  });
