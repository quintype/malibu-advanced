import React from "react";
import { FourStorySliderPortrait } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowFourStorySliderPortrait = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <FourStorySliderPortrait collection={collection} config={config} />;
};

ArrowFourStorySliderPortrait.propTypes = {
  collection: object,
};

ArrowFourStorySliderPortrait.storyLimit = 4;