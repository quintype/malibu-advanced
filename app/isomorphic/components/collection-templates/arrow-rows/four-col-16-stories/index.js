import React from "react";
import { FourColSixteenStories } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowFourColSixteenStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <FourColSixteenStories collection={collection} config={config} />;
};

ArrowFourColSixteenStories.propTypes = {
  collection: object,
};

ArrowFourColSixteenStories.storyLimit = 16;
