import React from "react";
import { generateStory } from "../../Fixture";
import { withStore, optionalSelect } from "../../../../storybook";
import { StoryTags } from "./index";
import Readme from "./README.md";

const story = generateStory();

const templateStyles = {
  default: "",
  "Round corners": "roundCorners",
};

withStore(
  "Atoms/StoryTags",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory",
      },
    },
  },
  Readme
).add("Default", () => <StoryTags tags={story.tags} template={optionalSelect("Tag Styles", templateStyles)} />);
