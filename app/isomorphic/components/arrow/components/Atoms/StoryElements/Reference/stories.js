import React from "react";
import { Reference } from "./index";
import { withStore } from "../../../../../storybook";
import Readme from "./README.md";
import { generateStoryElementData } from "../../../Fixture";
import { boolean, text } from "@storybook/addon-knobs";

const element = generateStoryElementData("references");

withStore("Atoms/Story Elements/Reference", {}, Readme).add("Default", () => (
  <Reference
    element={element}
    opts={{
      showHeadline: boolean("Show Headline", true),
      headlineText: text("Headline", "References")
    }}
  />
));
