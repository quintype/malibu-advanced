import React from "react";
import { generateStoryElementData } from "../../../Fixture";
import { BlockQuote } from "./index";
import { withStore, optionalSelect } from "../../../../../storybook";
import Readme from "./README.md";
import { color } from "@storybook/addon-knobs";

const templateStyle = {
  Default: "default",
  "With Background": "withBackground",
  "With Border": "withBorder"
};
const element = generateStoryElementData("blockquote");
const iconStyle = {
  "Curve Icon": "curveIcon",
  "Edge Icon": "edgeIcon"
};

withStore("Atoms/Story Elements/Block Quote", {}, Readme)
  .add("Default", () => (
    <BlockQuote
      element={element}
      template={optionalSelect("Template Options", templateStyle)}
      css={{
        blockQuoteColor: color("Block quote color", "#ff214b"),
        backgroundShade: color("Background color", "#ff214b"),
        iconType: optionalSelect("Icon Types", iconStyle)
      }}
    />
  ))
  .add("Custom", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.metadata.content }} />;
    return <BlockQuote element={element} render={customTemplate} />;
  });
