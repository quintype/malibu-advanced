import React from "react";
import { generateStory } from "../../Fixture";
import { withStore } from "../../../../storybook";
import { ReadTime } from "./index";
import Readme from "./README.md";
import { boolean } from "@storybook/addon-knobs";

const story = generateStory();

withStore("Atoms/Read Time", {}, Readme).add("default", () => {
  return (
    <ReadTime
      story={story}
      opts={{
        showReadTime: boolean("Show Read Time", true),
      }}
    />
  );
});
