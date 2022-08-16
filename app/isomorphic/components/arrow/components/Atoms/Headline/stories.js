import React from "react";
import { generateStory } from "../../Fixture";
import { optionalSelect, withStore } from "../../../../storybook";

import { Headline } from "./index";
import Readme from "./README.md";
import { boolean, color } from "@storybook/addon-knobs";

const story = generateStory();

const headerLevelOptions = {
  "No Value": "",
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

const iconType = {
  Star: "star",
  Crown: "crown",
  Lock: "lock",
  Key: "key",
};

withStore(
  "Atoms/Headline",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
).add(
  "default",
  () => (
    <Headline
      story={story}
      headerLevel={optionalSelect("Header level", headerLevelOptions)}
      premiumStoryIconConfig={{
        iconColor: color("Icon color", "#F7B500"),
        iconStyle: optionalSelect("Icon Types", iconType),
        enablePremiumStoryIcon: boolean("Enable Premium Icon", true),
      }}
    />
  ),
  Readme
);
