import React from "react";
import { ThreeColFourteenStories } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowThreeColFourteenStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <ThreeColFourteenStories collection={collection} config={config} />;
};

ArrowThreeColFourteenStories.propTypes = {
  collection: object,
};

ArrowThreeColFourteenStories.storyLimit = 14;
