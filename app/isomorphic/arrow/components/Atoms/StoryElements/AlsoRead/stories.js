import React from "react";
import { withStore, optionalSelect } from "../../../../../storybook";
import { color, text } from "@storybook/addon-knobs";
import { AlsoRead } from "./index";
import { generateStoryElementData, generateStory } from "../../../Fixture";
import Readme from "./README.md";

const element = generateStoryElementData("also-read");
const story = generateStory();
const templateStyle = {
  Default: "default",
  "Image Right Align": "imageRightAlign",
  "Text Left Align": "textLeftAlign",
};

withStore(
  "Atoms/Story Elements/Also Read",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
)
  .add("Default", () => (
    <AlsoRead
      story={story}
      element={element}
      template={optionalSelect("Template Options", templateStyle)}
      css={{ textColor: color("Color", "#ff214b") }}
      opts={{ title: text("Title", "Also read") }}
    />
  ))
  .add("Custom", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    return <AlsoRead element={element} render={customTemplate} />;
  });
