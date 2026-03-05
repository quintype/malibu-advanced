import React from "react";
import { ThreeColSevenStory } from "@quintype/arrow";
import "@quintype/arrow/ThreeColSevenStory/styles.arrow.css";
import { object } from "prop-types";

export const ArrowThreeColSevenStories = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <ThreeColSevenStory collection={collection} config={config} />;
};

ArrowThreeColSevenStories.propTypes = {
  collection: object,
};

ArrowThreeColSevenStories.storyLimit = 7;
