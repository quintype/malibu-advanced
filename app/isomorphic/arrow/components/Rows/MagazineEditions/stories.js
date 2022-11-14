import React from "react";
import { generateMagazineIssues } from "../../Fixture";
import MagazineEditions from "./index";
import Readme from "./README.md";
import { color, text, boolean } from "@storybook/addon-knobs";
import { withStore, optionalSelect, collectionNameTemplates } from "../../../../storybook";

const magazineCollection = generateMagazineIssues();

const footerButton = {
  SubsequentLoadCount: "SubsequentLoadCount",
  CustomUrlPath: "CustomUrlPath",
};

const collectionNameDefaultValue = "#3a9fdd";
const collectionNameBorderColorLabel = "Collection Name Border Color";

withStore(
  "Rows/Magazine Editions",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory",
      },
    },
  },
  Readme
).add("Magazine Editions", () => {
  const contextConfig = {
    theme: color("Background Color", "#ffffff"),
    showRowTitle: boolean("Show Row Title", true),
    title: text("Magazine Row title", "Magazine Editions"),
    collectionNameTemplate: optionalSelect("Collection row Templates", collectionNameTemplates),
    collectionNameBorderColor: color(collectionNameBorderColorLabel, collectionNameDefaultValue),
    buttonText: text("Footer text", "Read More"),
    footerButton: optionalSelect("Button Settings", footerButton),
    customUrlPath: text("Custom URL", ""),
    enableEditionsTitle: boolean("Show Editions Title", true),
    editionsTitle: text("Editions Title", "Magazine Title"),
    showButton: boolean("Show Button", true),
    initialLoadCount: text("Initial Load Count", 4),
  };
  return <MagazineEditions collection={magazineCollection} config={contextConfig} showLoadmore={true} />;
});
