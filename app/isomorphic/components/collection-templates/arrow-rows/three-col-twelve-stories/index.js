import React from "react";
import ThreeColTwelveStories from "../../../../arrow/components/Rows/ThreeColTwelveStories";
import { object } from "prop-types";

export const ArrowThreeColTwelveStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <ThreeColTwelveStories collection={collection} config={config} />;
};

ArrowThreeColTwelveStories.propTypes = {
  collection: object,
};

ArrowThreeColTwelveStories.storyLimit = 7;
