import React from "react";
import { Quote } from "./index";
import { withStore, optionalSelect } from "../../../../../storybook";
import Readme from "./README.md";
import { generateStoryElementData } from "../../../Fixture";
import { boolean, color } from "@storybook/addon-knobs";

const element = generateStoryElementData("quote");
const collectionTemplates = {
  default: "borderNone",
  borderLeft: "borderLeft",
  borderTopSml: "borderTopSmall",
};

withStore("Atoms/Story Elements/Quote", {}, Readme)
  .add("Default", () => (
    <Quote
      element={element}
      template={optionalSelect("templates", collectionTemplates)}
      opts={{ isExternalLink: boolean("External Link", true) }}
      css={{ borderColor: color("Color", "#ff214b") }}
    />
  ))
  .add("Custom", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.metadata.content }} />;
    return <Quote element={element} render={customTemplate} />;
  });
