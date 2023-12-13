import React from "react";
import { ThreeColFlexStories } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowThreeColFlexStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <ThreeColFlexStories collection={collection} config={config} />;
};

ArrowThreeColFlexStories.propTypes = {
  collection: object,
};

ArrowThreeColFlexStories.storyLimit = 12;
