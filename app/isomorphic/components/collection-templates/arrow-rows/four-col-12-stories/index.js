import React from "react";
import { FourColTwelveStory } from "@quintype/arrow";
import { object } from "prop-types";
// import "@quintype/arrow/FourColTwelveStories/styles.arrow.css";

export const ArrowFourColTwelveStories = ({collection}) => {

  return (
     <FourColTwelveStory
      collection={collection}
    />
  )
}

ArrowFourColTwelveStories.propTypes = {
  collection: object
}

ArrowFourColTwelveStories.storyLimit = 12;
