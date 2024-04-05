import React from "react";
import Readme from "./README.md";
import { withStore } from "../../../../storybook";
import { generateStory } from "../../Fixture";
import KeyEvents from "./index";
import { color, text } from "@storybook/addon-knobs";

const story = generateStory("live-blog");

withStore(
  "Molecules/Key Events",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory"
      }
    }
  },
  Readme
).add("Key Events", () => {
  const config = {
    theme: color("Color", "#ffffff"),
    initialLoadCount: text("Initial Load Count", 4),
    buttonText: text("Button text", "Load More")
  };
  return <KeyEvents story={story} config={config} />;
});
