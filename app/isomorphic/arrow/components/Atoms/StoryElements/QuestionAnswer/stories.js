/* eslint-disable react/prop-types */
import React from "react";
import { generateStoryElementData } from "../../../Fixture";
import { QuestionAnswer } from "./index";
import { withStore, optionalSelect } from "../../../../../storybook";
import Readme from "./README.md";
import { color, boolean } from "@storybook/addon-knobs";

const templateStyle = {
  Default: "default",
  "With Author Image": "withAuthorImage"
};
const qaElement = generateStoryElementData("q-and-a");
const qElement = generateStoryElementData("question");
const aElement = generateStoryElementData("answer");
const iconType = {
  edge: "edge",
  curve: "curve"
};

withStore("Atoms/Story Elements/Question Answer", {}, Readme)
  .add("Default", () => (
    <QuestionAnswer
      element={qaElement}
      template={optionalSelect("Template Type", templateStyle)}
      opts={{
        type: "q-and-a",
        defaultIconType: optionalSelect("Icon Type", iconType),
        isExternalLink: boolean("External Link", true)
      }}
      css={{
        iconColor: color("Icon Color", "#ff214b")
      }}
    />
  ))
  .add("Custom", () => {
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    return <QuestionAnswer element={qaElement} render={customTemplate} />;
  });

withStore("Atoms/Story Elements/Question", {}, Readme)
  .add("Default", () => (
    <QuestionAnswer
      element={qElement}
      template={optionalSelect("Template Type", templateStyle)}
      opts={{
        type: "question",
        defaultIconType: optionalSelect("Icon Type", iconType),
        isExternalLink: boolean("External Link", true)
      }}
      css={{
        iconColor: color("Icon Color", "#ff214b")
      }}
    />
  ))
  .add("Custom", () => {
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    return <QuestionAnswer element={qElement} render={customTemplate} />;
  });

withStore("Atoms/Story Elements/Answer", {}, Readme)
  .add("Default", () => (
    <QuestionAnswer
      element={aElement}
      template={optionalSelect("Template Type", templateStyle)}
      opts={{
        type: "answer",
        defaultIconType: optionalSelect("Icon Type", iconType),
        isExternalLink: boolean("External Link", true)
      }}
      css={{
        iconColor: color("Icon Color", "#ff214b")
      }}
    />
  ))
  .add("Custom", () => {
    const customTemplate = ({ element }) => <h3 dangerouslySetInnerHTML={{ __html: element.text }} />;
    return <QuestionAnswer element={aElement} render={customTemplate} />;
  });
