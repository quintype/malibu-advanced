import React from "react";
import FourTabbedBigStorySlider from "../../../../arrow/components/Rows/FourTabbedBigStorySlider";
import { object } from "prop-types";

export const ArrowFourTabbedBigStorySlider = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <FourTabbedBigStorySlider collection={collection} config={config} />;
};

ArrowFourTabbedBigStorySlider.propTypes = {
  collection: object,
};

ArrowFourTabbedBigStorySlider.storyLimit = 14;
