import React from "react";
import { SixColSixStories } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowSixColSixStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <SixColSixStories collection={collection} config={config} />;
};

ArrowSixColSixStories.propTypes = {
  collection: object,
};

ArrowSixColSixStories.storyLimit = 6;
