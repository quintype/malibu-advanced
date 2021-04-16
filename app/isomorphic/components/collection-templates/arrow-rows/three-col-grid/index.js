import React from "react";
import { ThreeColGrid } from "@quintype/arrow";
import { object } from "prop-types";
import "@quintype/arrow/ThreeColGrid/styles.arrow.css";

export const ArrowThreeColGrid = ({collection}) => {

  const contextConfig = {
    theme: "#ffffff",
    isborder: true,
    showSection: true,
    showAuthorTime: true,
    showSubheadline: true
  };
  return (
    <ThreeColGrid
      collection={collection}
      config={contextConfig}
    />
  )
}

ArrowThreeColGrid.propTypes = {
  collection: object
}

ArrowThreeColGrid.storyLimit = 6;
