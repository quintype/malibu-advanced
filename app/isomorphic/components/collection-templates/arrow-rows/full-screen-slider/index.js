import React from "react";
import { FullScreenSlider } from "@quintype/arrow";
import { object } from "prop-types";

export const ArrowFullScreenSlider = ({ collection }) => {
  return <FullScreenSlider collection={collection} />;
};

ArrowFullScreenSlider.propTypes = {
  collection: object
};

ArrowFullScreenSlider.storyLimit = 7;
