import React from "react";
import { FourStorySlider } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowFourStorySlider = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <FourStorySlider collection={collection} config={config} />;
};

ArrowFourStorySlider.propTypes = {
  collection: object,
};

ArrowFourStorySlider.storyLimit = 4;
