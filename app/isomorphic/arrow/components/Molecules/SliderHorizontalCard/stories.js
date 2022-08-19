import React from "react";
import { generateStory } from "../../Fixture";
import { SliderHorizontalCard } from "./index";
import Readme from "./README.md";
import { color } from "@storybook/addon-knobs";
import { withStore } from "../../../../storybook";

const story = generateStory();

const defaultvalue = "#3a9fdd";
const sectionTagBorderColor = "Section Tag Border Color";

withStore(
  "molecules/Horizontal Slider Card ",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory"
      }
    }
  },
  Readme
)
  .add("Default horizontal card for slider", () => (
    <SliderHorizontalCard story={story} borderColor={color(sectionTagBorderColor, defaultvalue)} />
  ))
  .add("Horizontal card for slider with empty story", () => (
    <SliderHorizontalCard story={null} borderColor={color(sectionTagBorderColor, defaultvalue)} />
  ));
