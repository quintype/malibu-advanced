import React from "react";
import { TwoColThreeStories } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowTwoColThreeStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <TwoColThreeStories collection={collection} config={config} />;
};

ArrowTwoColThreeStories.propTypes = {
  collection: object,
};

ArrowTwoColThreeStories.storyLimit = 3;
