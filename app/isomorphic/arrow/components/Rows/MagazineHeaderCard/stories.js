import React from "react";
import { generateCollection } from "../../Fixture";
import MagazineHeaderCard from "./index";
import Readme from "./README.md";
import { boolean, color, text } from "@storybook/addon-knobs";
import { withStore, optionalSelect } from "../../../../storybook";

const collection = generateCollection({ stories: 4 });

const footerButton = {
  NavigateToPage: "NavigateToPage",
  CustomUrlPath: "CustomUrlPath"
};

withStore(
  "Rows/Magazine Header Card",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory"
      }
    }
  },
  Readme
).add("Magazine header card", () => {
  const contextConfig = {
    theme: color("Color", "#ffffff"),
    showButton: boolean("Show button", true),
    buttonText: text("Button text", "Subscribe"),
    footerButton: optionalSelect("Button Settings", footerButton),
    customUrlPath: text("Custom URL", ""),
    magazineTitle: "Fortune"
  };
  return <MagazineHeaderCard collection={collection} config={contextConfig} />;
});
