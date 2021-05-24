import React from "react";
import { FourColTwelveStories } from "@quintype/arrow";
import { object } from "prop-types";

export const ArrowFourColTwelveStories = ({ collection }) => {
  return <FourColTwelveStories collection={collection} />;
};

ArrowFourColTwelveStories.propTypes = {
  collection: object
};

ArrowFourColTwelveStories.storyLimit = 12;
