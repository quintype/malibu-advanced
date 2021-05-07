import React from "react";
import { FullScreenSlider } from "@quintype/arrow";
import { object } from "prop-types";

export const ArrowFullScreenSlider = ({ collection }) => {
  const contextConfig = {
    numberOfStoriesToShow: 5
  };

  return <FullScreenSlider collection={collection} config={contextConfig} />;
};

ArrowFullScreenSlider.propTypes = {
  collection: object
};

ArrowFullScreenSlider.storyLimit = 7;
