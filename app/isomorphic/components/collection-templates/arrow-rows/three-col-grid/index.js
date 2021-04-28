import React from "react";
import { ThreeColGrid } from "@quintype/arrow";
import { object } from "prop-types";
// import "@quintype/arrow/ThreeColGrid/styles.arrow.css";

export const ArrowThreeColGrid = ({collection}) => {

  return (
    <ThreeColGrid
      collection={collection}
    />
  )
}

ArrowThreeColGrid.propTypes = {
  collection: object
}

ArrowThreeColGrid.storyLimit = 6;
