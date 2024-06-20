import React from "react";
import { ThreeColSixStories } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowThreeColSixStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <ThreeColSixStories collection={collection} config={config} />;
};

ArrowThreeColSixStories.propTypes = {
  collection: object,
};

ArrowThreeColSixStories.storyLimit = 6;
