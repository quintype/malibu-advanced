import React from "react";
import { withStore } from "../../../../storybook";
import AuthorIntroductionCard from "./index";
import { color, boolean } from "@storybook/addon-knobs";
import { authorData } from "../../Fixture";
import Readme from "./README.md";

withStore(
  "Rows/Author Introduction Card ",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
)
  .add("Default", () => {
    const contextConfig = {
      theme: color("Color", "#ffffff"),
      enableBio: boolean("Enable Bio", true),
      enableSocialLinks: boolean("Enable Social Links", true),
    };
    return <AuthorIntroductionCard data={authorData} config={contextConfig} />;
  })
  .add("Square", () => {
    const contextConfig = {
      theme: color("Color", "#ffffff"),
      enableBio: boolean("Enable Bio", true),
      enableSocialLinks: boolean("Enable Social Links", true),
    };
    return <AuthorIntroductionCard data={authorData} config={contextConfig} template="square" />;
  })
  .add("Small Circle", () => {
    const contextConfig = {
      theme: color("Color", "#ffffff"),
      enableBio: boolean("Enable Bio", true),
      enableSocialLinks: boolean("Enable Social Links", true),
      borderSupport: boolean("With Border", true),
    };
    return <AuthorIntroductionCard data={authorData} config={contextConfig} template="smallCircle" />;
  });
