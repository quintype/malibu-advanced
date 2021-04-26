import React from "react";
import { ThreeColSevenStory } from "@quintype/arrow";
import { object } from "prop-types";
// import "@quintype/arrow/ThreeColSevenStory/styles.arrow.css";

export const ArrowThreeColSevenStory = ({collection}) => {

  return (
     <ThreeColSevenStory
      collection={collection}
    />
  )
}

ArrowThreeColSevenStory.propTypes = {
  collection: object
}

ArrowThreeColSevenStory.storyLimit = 7;
