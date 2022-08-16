import React from "react";
import { generateStory } from "../../Fixture";
import { withStore } from "../../../../storybook";
import { Subheadline } from "./index";
import Readme from "./README.md";

const story = generateStory();

withStore("Atoms/Subheadline", {}, Readme)
  .add("Default", () => <Subheadline story={story} />)
  .add("with truncate chars of 50", () => <Subheadline story={story} truncateChars={50} />)
  .add("with line clamp of 1", () => <Subheadline story={story} lineClamp={1} />);
