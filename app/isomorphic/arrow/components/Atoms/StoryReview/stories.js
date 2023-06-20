import React from "react";
import { generateStory } from "../../Fixture";
import { withStore } from "../../../../storybook";
import { StoryReview } from "./index";
import Readme from "./README.md";

const story = generateStory();
withStore("Atoms/Story Review", {}, Readme).add("Default", () => <StoryReview theme={"#fffff"} story={story} />);
