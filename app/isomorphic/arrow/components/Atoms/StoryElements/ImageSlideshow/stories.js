import React from "react";
import { withStore } from "../../../../../storybook";
import { generateStoryElementData } from "../../../Fixture";
import { ImageSlideshow } from "./index";
import Readme from "./README.md";

const element = generateStoryElementData("image-gallery");

withStore(
  "Atoms/Story Elements/Image Slideshow",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
      },
    },
  },
  Readme
).add("Default", () => <ImageSlideshow element={element} />);

withStore(
  "Atoms/Story Elements/Image Slideshow",
  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com",
        language: {
          direction: "rtl",
        },
      },
    },
  },
  Readme
).add("Support Rtl", () => <ImageSlideshow element={element} />);
