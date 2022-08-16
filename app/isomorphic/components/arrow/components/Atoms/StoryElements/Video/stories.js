import React from "react";
import { withStore } from "../../../../../storybook";
import { Video } from "./index";
import Readme from "./README.md";
import { generateStoryElementData } from "../../../Fixture";

const elementYoutube = generateStoryElementData("youtube-video");
const elementDailyMotion = generateStoryElementData("dailymotion-video");
const elementTwitter = generateStoryElementData("tweet");
withStore(
  "Atoms/Story Elements/Video",

  {
    qt: {
      config: {
        "cdn-image": "thumbor-stg.assettype.com"
      }
    }
  },
  Readme
)
  .add("Default with youtube video", () => <Video element={elementYoutube} loadIframeOnClick={true} />)
  .add("Dailymotion video", () => <Video element={elementDailyMotion} loadIframeOnClick={true} />)
  .add("Twitter video", () => <Video element={elementTwitter} />);
