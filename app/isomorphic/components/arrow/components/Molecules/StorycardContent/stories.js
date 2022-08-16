import React from "react";
import { generateStory } from "../../Fixture";
import { withStore } from "../../../../storybook";
import { StorycardContent } from "./index";
import Readme from "./README.md";

import { Headline } from "../../Atoms/Headline/index";
import { Subheadline } from "../../Atoms/Subheadline/index";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";

const story = generateStory();

withStore(
  "Molecules/StoryCard Content",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        mountAt: "/sub-directory"
      }
    }
  },
  Readme
)
  .addDecorator((story) => <div style={{ maxWidth: "480px" }}>{story()}</div>)
  .add("default", () => <StorycardContent story={story} />)
  .add("Story Card with Headline and Timestamp", () => (
    <StorycardContent story={story}>
      <Headline story={story} />
      <AuthorWithTime story={story} />
    </StorycardContent>
  ))
  .add("Story Card with Headline, Author with Timestamp and Subheadline ", () => (
    <StorycardContent story={story}>
      <Headline story={story} />
      <Subheadline story={story} />
      <AuthorWithTime story={story} />
    </StorycardContent>
  ));
