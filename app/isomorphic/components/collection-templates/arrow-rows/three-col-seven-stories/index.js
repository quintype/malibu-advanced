import React from "react";
import { ThreeColSevenStory } from "@quintype/arrow";
import { object } from "prop-types";
// import "@quintype/arrow/ThreeColSevenStory/styles.arrow.css";

export const ArrowThreeColSevenStories = ({ collection }) => {
  return <ThreeColSevenStory collection={collection} />;
};

ArrowThreeColSevenStories.propTypes = {
  collection: object
};

ArrowThreeColSevenStories.storyLimit = 7;
