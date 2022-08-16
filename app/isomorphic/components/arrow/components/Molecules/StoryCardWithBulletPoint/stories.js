import React from "react";
import { generateStory } from "../../Fixture";
import { StoryCardWithBulletPoint } from "./index";
import Readme from "./README.md";
import { color, boolean } from "@storybook/addon-knobs";
import { withStore } from "../../../../storybook";

const story = generateStory();

withStore(
  "molecules/Story Card With Bullet Point ",
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
  const contextConfig = {
    theme: color("color", "#ffffff"),
    showSection: boolean("Show Section", true),
    showAuthor: boolean("Show Author", true),
    showTime: boolean("Show Time", true),
    showReadTime: boolean("Read time", true)
  };

  return <StoryCardWithBulletPoint story={story} bulletValue={"1"} config={contextConfig} />;
});
