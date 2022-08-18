import React from "react";
import { withStore } from "../../../../storybook";
import { PageIntroductionCard } from "./index.js";
import { color } from "@storybook/addon-knobs";
import Readme from "./README.md";

withStore("Molecules/Page Intro Card", Readme).add("Default", () => {
  const config = {
    pageTitle: "Page Title",
    pageDescription: "This is the page description",
    theme: color("Color", "#131922"),
    enableBorder: true,
    showButton: true,
  };
  return <PageIntroductionCard config={config} />;
});
