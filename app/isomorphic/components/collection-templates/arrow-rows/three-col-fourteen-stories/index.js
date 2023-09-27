import React from "react";
import ThreeColFourteenStory from "../../../../arrow/components/Rows/ThreeColFourteenStory";
import { object } from "prop-types";

export const ArrowThreeColFourteenStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <ThreeColFourteenStory collection={collection} config={config} />;
};

ArrowThreeColFourteenStories.propTypes = {
  collection: object,
};

ArrowThreeColFourteenStories.storyLimit = 14;
