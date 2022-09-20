import React from "react";
import { generateStory } from "../../Fixture";
import { withStore } from "../../../../storybook";
import { AuthorWithTime } from "./index";
import Readme from "./README.md";

const story = generateStory();
const config = {
  localizationConfig: {
    localizedTimeToRead: "মিনিট পড়া",
  },
};

withStore(
  "Atoms/Author With Time Stamp",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
)
  .add("default", () => <AuthorWithTime story={story} />)
  .add("Author without Divider and Time", () => <AuthorWithTime story={story} separator="divider" />)
  .add("Author with Localization Time", () => <AuthorWithTime story={story} config={config} />);
