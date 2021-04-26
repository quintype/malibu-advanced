import React from "react";
import { FullScreenSlider } from "@quintype/arrow";
import { object } from "prop-types";
// import "@quintype/arrow/FullScreenSlider/styles.arrow.css";

export const ArrowFullScreenSlider= ({collection}) => {

  return (
     <FullScreenSlider
      collection={collection}
    />
  )
}

ArrowFullScreenSlider.propTypes = {
  collection: object
}

ArrowFullScreenSlider.storyLimit = 7;
