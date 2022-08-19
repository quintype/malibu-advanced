import React from "react";
import { generateStory } from "../../Fixture";
import { withStore } from "../../../../storybook";
import { TimeStamp } from "./index";
import Readme from "./README.md";

const story = generateStory();

withStore("Atoms/Time Stamp", {}, Readme).add("default", () => <TimeStamp story={story} />);
