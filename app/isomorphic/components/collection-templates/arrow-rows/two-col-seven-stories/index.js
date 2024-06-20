import React from "react";
import { TwoColSevenStories } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowTwoColSevenStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <TwoColSevenStories collection={collection} config={config} />;
};

ArrowTwoColSevenStories.propTypes = {
  collection: object,
};

ArrowTwoColSevenStories.storyLimit = 7;
