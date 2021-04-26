import React from "react";
import { ElevenStories } from "@quintype/arrow";
import { object } from "prop-types";
// import "@quintype/arrow/ElevenStories/styles.arrow.css";

export const ArrowElevenStories = ({collection}) => {

  return (
     <ElevenStories
      collection={collection}
    />
  )
}

ArrowElevenStories.propTypes = {
  collection: object
}

ArrowElevenStories.storyLimit = 11;
