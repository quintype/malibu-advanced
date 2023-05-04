import React from "react";
import { HalfScreenSlider } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowHalfScreenSlider = ({ collection }) => {
  const contextConfig = {
    numberOfStoriesToShow: 5,
    buttonText: `${collection.name} News`,
  };

  return <HalfScreenSlider collection={collection} config={contextConfig} />;
};

ArrowHalfScreenSlider.propTypes = {
  collection: object,
};

ArrowHalfScreenSlider.storyLimit = 6;
