import React from "react";
import { CaptionAttribution } from "./index";
import Readme from "./README.md";
import { withStore } from "../../../../storybook";
import { color } from "@storybook/addon-knobs";
import { generateStory, generateStoryElementData } from "../../Fixture";

const story = generateStory();
const element = generateStoryElementData("image");
withStore("Atoms/Caption Attribution", Readme)
  .add("Hero Image", () => {
    const config = {
      theme: color("BG Color", "#ffffff"),
    };
    return <CaptionAttribution story={story} config={config} />;
  })
  .add("Image Element", () => {
    const config = {
      theme: color("BG Color", "#ffffff"),
    };
    return <CaptionAttribution element={element} config={config} />;
  })
  .add("Caption", () => {
    const config = {
      theme: color("BG Color", "#ffffff"),
    };
    const data = {
      title: "Caption",
    };
    return <CaptionAttribution element={data} config={config} />;
  })
  .add("Attribution", () => {
    const config = {
      theme: color("BG Color", "#ffffff"),
    };
    const data = {
      "image-attribution": "Attribution",
    };
    return <CaptionAttribution element={data} config={config} />;
  });
