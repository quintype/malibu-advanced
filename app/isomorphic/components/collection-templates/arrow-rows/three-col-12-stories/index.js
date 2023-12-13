import React from "react";
import { ThreeColTwelveStories } from "../../../../arrow";
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

ArrowThreeColTwelveStories.storyLimit = 12;
