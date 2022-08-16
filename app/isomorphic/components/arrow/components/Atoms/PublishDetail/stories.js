import React from "react";
import { generateStory } from "../../Fixture";
import { withStore } from "../../../../storybook";
import { PublishDetails } from "./index";
import { boolean, text } from "@storybook/addon-knobs";
import Readme from "./README.md";

const story = generateStory();

withStore("Atoms/Publish Details", {}, Readme).add("Default", () => (
  <PublishDetails
    story={story}
    opts={{
      showReadTime: boolean("Show read Time", true),
      enableUpdatedTime: boolean("Enable Update Time", true),
      enablePublishedTime: boolean("Enable Published Time", true),
      localizedPublishedOn: text("Localise Published On", "ಪ್ರಕಟಿಸಲಾಗಿದೆ"),
      localizedUpdatedOn: text("Localise Updated On", "ನವೀಕರಿಸಲಾಗಿದೆ"),
      timeFormat: "12hours",
    }}
  />
));
