import React from "react";
import { withStore, optionalSelect } from "../../../../../storybook";
import { generateStoryElementData } from "../../../Fixture";
import Readme from "./README.md";
import { Summary } from "./index";
import { color, boolean, text } from "@storybook/addon-knobs";

const element = generateStoryElementData("summary");

const summaryTemplate = {
  default: "",
  header: "header",
  border: "border"
};

withStore("Atoms/Story Elements/Summary", {}, Readme)
  .add("Default", () => (
    <Summary
      element={element}
      template={optionalSelect("templates", summaryTemplate)}
      css={{ headerBgColor: color("Color", "#ff214b") }}
      opts={{
        isExternalLink: boolean("External Link", true),
        headline: text("Headline", "Summary"),
        hideHeadline: boolean("Hide Headline", false)
      }}
    />
  ))
  .add("Custom", () => {
    // eslint-disable-next-line react/prop-types
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    return <Summary element={element} render={customTemplate} />;
  });
