import React from "react";
import { withStore } from "../../../../storybook";
import TagIntroductionCard from "./index";
import { color } from "@storybook/addon-knobs";
import Readme from "./README.md";

const label = "color";
const defaultvalue = "#ffffff";

const data = {
  tagName: "News",
  tagDescription:
    "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi "
};

withStore("Rows/Tag Introduction Card", Readme).add("Default", () => {
  const contextConfig = {
    theme: color(label, defaultvalue)
  };
  return <TagIntroductionCard data={data} config={contextConfig} />;
});
