import React from "react";
import { generateStory } from "../../Fixture";
import { HeroImage } from "./index";
import Readme from "./README.md";

import { withStore } from "../../../../storybook";

const story = generateStory();

withStore(
  "Atoms/Hero Image",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com"
      }
    }
  },
  Readme
)
  .add("Full Bleed Image", () => <HeroImage story={story} />)
  .add("With Padding Image", () => <HeroImage story={story} FullBleed={false} aspectRatio={[[1, 1], [16, 9]]} />);
