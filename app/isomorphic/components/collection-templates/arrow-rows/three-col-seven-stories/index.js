import React from "react";
import { object } from "prop-types";
import ThreeColSevenStory  from "../../../arrow/components/Rows/ThreeColSevenStory";

export const ArrowThreeColSevenStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`
  };
  return <ThreeColSevenStory collection={collection} config={config} />;
};

ArrowThreeColSevenStories.propTypes = {
  collection: object
};

ArrowThreeColSevenStories.storyLimit = 7;
