import React from "react";
import { ThreeColSevenStory } from "@quintype/arrow";
import { object } from "prop-types";

export const ArrowThreeColSevenStories = ({ collection }) => {
  return <ThreeColSevenStory collection={collection} />;
};

ArrowThreeColSevenStories.propTypes = {
  collection: object
};

ArrowThreeColSevenStories.storyLimit = 7;
