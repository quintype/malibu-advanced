import React from "react";
import { generateStory } from "../../Fixture";
import { withStore } from "../../../../storybook";
import Readme from "./README.md";
import { StoryElementCard } from "./index";
import { color } from "@storybook/addon-knobs";

const story = generateStory();
const { cards } = story;

withStore(
  "Molecules/Story Element Card",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory"
      }
    }
  },
  Readme
).add("Default", () => {
  const config = {
    theme: color("Background Color", "#fff")
  };
  return <StoryElementCard story={story} card={cards[0]} config={config} />;
});
