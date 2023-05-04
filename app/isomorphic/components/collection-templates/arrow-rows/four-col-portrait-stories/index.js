import React from "react";
import { FourColPortraitStories } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowFourColPortraitStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <FourColPortraitStories collection={collection} config={config} />;
};

ArrowFourColPortraitStories.propTypes = {
  collection: object,
};

ArrowFourColPortraitStories.storyLimit = 4;
