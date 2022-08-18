import React from "react";
import { object } from "prop-types";
import FullScreenSlider  from "../../.././../arrow/components/Rows/FullScreenSlider";

export const ArrowFullScreenSlider = ({ collection }) => {
  const contextConfig = {
    numberOfStoriesToShow: 5,
    buttonText: `${collection.name} News`
  };

  return <FullScreenSlider collection={collection} config={contextConfig} />;
};

ArrowFullScreenSlider.propTypes = {
  collection: object
};

ArrowFullScreenSlider.storyLimit = 6;
