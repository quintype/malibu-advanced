import React from "react";
import { FourColGrid } from "@quintype/arrow";
import { object } from "prop-types";
// import "@quintype/arrow/FourColGrid/styles.arrow.css";

export const ArrowFourColGrid = ({ collection }) => {
  return <FourColGrid collection={collection} />;
};

ArrowFourColGrid.propTypes = {
  collection: object
};

ArrowFourColGrid.storyLimit = 12;
