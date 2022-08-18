import React from "react";
import { BigFact } from "./index";
import { withStore } from "../../../../../storybook";
import Readme from "./README.md";
import { generateStoryElementData } from "../../../Fixture";

const element = generateStoryElementData("bigfact");

withStore("Atoms/Story Elements/BigFact", {}, Readme).add("Default", () => <BigFact element={element} />);
