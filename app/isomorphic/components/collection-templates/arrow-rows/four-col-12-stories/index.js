import React from "react";
import { FourColTwelveStory } from "@quintype/arrow";
import { object } from "prop-types";
// import "@quintype/arrow/FourColTwelveStories/styles.arrow.css";

// To Do:
// FourColTwelveStory doesn't exist in arrow. Fix the name
// fix all newly introduced linting errors
// fix eslint & prettier on local machine so that linting errors aren't introduced

export const ArrowFourColTwelveStories = ({ collection }) => {
  return <FourColTwelveStory collection={collection} />;
};

ArrowFourColTwelveStories.propTypes = {
  collection: object
};

ArrowFourColTwelveStories.storyLimit = 12;
