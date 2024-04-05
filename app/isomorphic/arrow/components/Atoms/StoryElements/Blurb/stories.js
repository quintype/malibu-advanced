import React from "react";
import { withStore, optionalSelect } from "../../../../../storybook";
import { generateStoryElementData } from "../../../Fixture";
import Readme from "./README.md";
import { Blurb } from "./index";
import { color, boolean } from "@storybook/addon-knobs";

const templateStyle = {
  Default: "default",
  "Blurb with Border": "withBorder"
};

const element = generateStoryElementData("blurb");

withStore("Atoms/Story Elements/Blurb", {}, Readme)
  .add("Default", () => (
    <Blurb
      element={element}
      template={optionalSelect("Template Options", templateStyle)}
      css={{ borderColor: color("Color", "#ff214b") }}
      opts={{ isExternalLink: boolean("External Link", true) }}
    />
  ))
  .add("Custom", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    return <Blurb element={element} render={customTemplate} />;
  });
