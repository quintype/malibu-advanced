import React from "react";

import Readme from "./README.md";
import { generateStory } from "../../Fixture";
import PortraitStoryCard from "./index";
import { withStore } from "../../../../storybook";

const story = generateStory();

withStore(
  "molecules/Portrait Story Card ",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory",
      },
    },
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "320px" }}>{story()}</div>)

  .add("Default", () => <PortraitStoryCard story={story} />);
