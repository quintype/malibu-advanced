import React from "react";
import TwoColFourStories from "../../.././../arrow/components/Rows/TwoColFourStories";
import { object } from "prop-types";

export const ArrowTwoColFourStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`
  };
  return <TwoColFourStories collection={collection} config={config} />;
};

ArrowTwoColFourStories.propTypes = {
  collection: object
};

ArrowTwoColFourStories.storyLimit = 4;
