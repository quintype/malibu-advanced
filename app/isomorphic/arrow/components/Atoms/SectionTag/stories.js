import React from "react";
import { generateStory } from "../../Fixture";
import { SectionTag } from "./index";
import { withStore, optionalSelect } from "../../../../storybook";
import Readme from "./README.md";
import { color } from "@storybook/addon-knobs";

const story = generateStory();

const defaultvalue = "#3a9fdd";
const sectionTagBorderColor = "Section Tag Border Color";

const templateStyles = {
  Default: "",
  Solid: "solid",
  "Border Bottom Small": "borderBottomSml",
  "Border Left": "borderLeft"
};

withStore("Atoms/SectionTag", {}, Readme).add("Default", () => (
  <SectionTag
    story={story}
    template={optionalSelect("Section Template", templateStyles)}
    borderColor={color(sectionTagBorderColor, defaultvalue)}
  />
));
