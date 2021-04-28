import React from "react";
import { wrapCollectionLayout, EagerLoadImages } from "@quintype/components";
import { FourColGrid } from "./four-col-grid";
import { ArrowThreeColGrid } from "./arrow-rows/three-col-grid";
import { ArrowFourColTwelveStories } from "./arrow-rows/four-col-12-stories";
import { ArrowFourColGrid } from "./arrow-rows/four-col-grid";
import { ArrowThreeColSevenStory } from "./arrow-rows/three-col-seven-stories";
import { ArrowElevenStories } from "./arrow-rows/eleven-stories";
import { ArrowTwoColFourStories } from "./arrow-rows/two-col-four-stories";
import { ArrowFullScreenSlider } from "./arrow-rows/full-screen-slider";
import { ArrowOneColStoryList } from "./arrow-rows/one-col-story-list";

// This should not be needed anymore as we are using Gumlet
function wrapEager(f) {
  const wrappedComponent = function WrapEager(props) {
    if (props.index === 0) {
      return (
        <EagerLoadImages predicate={token => token === "above-fold"}>{React.createElement(f, props)}</EagerLoadImages>
      );
    } else {
      return React.createElement(f, props);
    }
  };

  if (f.storyLimit) {
    wrappedComponent.storyLimit = f.storyLimit;
  }

  return wrappedComponent;
}

export default {
  FourColGrid: wrapEager(wrapCollectionLayout(FourColGrid)),
  ArrowFourColTwelveStories: wrapEager(wrapCollectionLayout(ArrowFourColTwelveStories)),
  ArrowThreeColGrid: wrapEager(wrapCollectionLayout(ArrowThreeColGrid)),
  ArrowFourColGrid: wrapEager(wrapCollectionLayout(ArrowFourColGrid)),
  ArrowElevenStories: wrapEager(wrapCollectionLayout(ArrowElevenStories)),
  ArrowTwoColFourStories: wrapEager(wrapCollectionLayout(ArrowTwoColFourStories)),
  ArrowFullScreenSlider: wrapEager(wrapCollectionLayout(ArrowFullScreenSlider)),
  ArrowOneColStoryList: wrapEager(wrapCollectionLayout(ArrowOneColStoryList)),
  ArrowThreeColSevenStory: wrapEager(wrapCollectionLayout(ArrowThreeColSevenStory)),
  defaultTemplate: wrapEager(wrapCollectionLayout(ArrowFourColGrid))
};
