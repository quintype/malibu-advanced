import React from "react";
import { object } from "prop-types";
import TwoColFourStories  from "../../../arrow/components/Rows/TwoColFourStory";

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
