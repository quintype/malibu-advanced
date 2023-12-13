import React from "react";
import { TwoColFourStoryHighlight } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowTwoColFourStoryHighlight = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <TwoColFourStoryHighlight collection={collection} config={config} />;
};

ArrowTwoColFourStoryHighlight.propTypes = {
  collection: object,
};

ArrowTwoColFourStoryHighlight.storyLimit = 3;
