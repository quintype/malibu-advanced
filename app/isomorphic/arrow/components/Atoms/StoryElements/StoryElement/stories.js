import React from "react";
import { withStore } from "../../../../../storybook";
import { StoryElement } from "./index";
import Readme from "./README.md";
import { generateStoryElementData } from "../../../Fixture";

const elementJsembed = generateStoryElementData("jsembed");

withStore(
  "Atoms/Story Elements/StoryElement",

  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
).add("should work with any jsembed ", () => <StoryElement element={elementJsembed} />);
