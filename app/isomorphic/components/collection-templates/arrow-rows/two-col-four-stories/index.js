import React from "react";
import { TwoColFourStories } from "@quintype/arrow";
import { object } from "prop-types";
// import "@quintype/arrow/TwoColFourStories/styles.arrow.css";

export const ArrowTwoColFourStories = ({collection}) => {

  return (
     <TwoColFourStories
      collection={collection}
    />
  )
}

ArrowTwoColFourStories.propTypes = {
  collection: object
}

ArrowTwoColFourStories.storyLimit = 4;
