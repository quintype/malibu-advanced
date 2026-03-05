import React from "react";
import { FourColGrid } from "@quintype/arrow";
import "@quintype/arrow/FourColGrid/styles.arrow.css";
import { object } from "prop-types";

export const ArrowFourColGrid = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <FourColGrid collection={collection} config={config} />;
};

ArrowFourColGrid.propTypes = {
  collection: object,
};

ArrowFourColGrid.storyLimit = 12;
