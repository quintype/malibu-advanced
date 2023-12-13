import React from "react";
import { FourColFiveStories } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowFourColFiveStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <FourColFiveStories collection={collection} config={config} />;
};

ArrowFourColFiveStories.propTypes = {
  collection: object,
};

ArrowFourColFiveStories.storyLimit = 16;
