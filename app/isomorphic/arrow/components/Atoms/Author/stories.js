import React from "react";
import { generateStory } from "../../Fixture";
import { withStore } from "../../../../storybook";
import { Author } from "./index";
import Readme from "./README.md";

const story = generateStory();

withStore(
  "Atoms/Author",
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
  .add("With Author Image", () => <Author story={story} />)
  .add("With Prefix", () => <Author story={story} prefix="By" />)
  .add("Without Author Image", () => <Author story={story} hideAuthorImage />);
