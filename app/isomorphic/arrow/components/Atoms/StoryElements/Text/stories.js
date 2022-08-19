import React from "react";
import { withStore } from "../../../../../storybook";
import { Text } from "./index";
import Readme from "./README.md";
import { generateStoryElementData } from "../../../Fixture";
import { boolean, color } from "@storybook/addon-knobs";

const element = generateStoryElementData("text");

withStore("Atoms/Story Elements/Text", {}, Readme)
  .add("Default", () => (
    <Text
      element={element}
      opts={{ isExternalLink: boolean("External Link", true) }}
      css={{ hyperlinkColor: color("Hyperlink Color", "#ff214b"), textColor: color("Text Color", "#000") }}
    />
  ))
  .add("Promotional Message", () => {
    const promotionalMessage = { ...element, metadata: { "promotional-message": true } };
    return (
      <Text
        element={promotionalMessage}
        opts={{ isExternalLink: boolean("External Link", true) }}
        css={{ hyperlinkColor: color("Hyperlink Color", "#ff214b") }}
      />
    );
  })
  .add("Custom", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    return <Text element={element} render={customTemplate} />;
  });
