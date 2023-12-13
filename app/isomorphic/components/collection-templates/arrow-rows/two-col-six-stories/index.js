import React from "react";
import { TwoColSixStories } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowTwoColSixStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <TwoColSixStories collection={collection} config={config} />;
};

ArrowTwoColSixStories.propTypes = {
  collection: object,
};

ArrowTwoColSixStories.storyLimit = 6;
