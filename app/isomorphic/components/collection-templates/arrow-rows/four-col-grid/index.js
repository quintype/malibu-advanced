import React from "react";
import { FourColGrid } from "@quintype/arrow";
import { object } from "prop-types";
import "@quintype/arrow/FourColGrid/styles.arrow.css";

export const ArrowFourColGrid = ({collection}) => {

  const contextConfig = {
    theme: "#ffffff",
    isborder: true,
    showSection: true,
    showAuthorTime: true,
    showSubheadline: true
  };
  return (
     <FourColGrid
      collection={collection}
      config={contextConfig}
    />
  )
}

ArrowFourColGrid.propTypes = {
  collection: object
}

ArrowFourColGrid.storyLimit = 12;
