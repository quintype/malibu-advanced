import React from "react";
import { object } from "prop-types";
import FourColGrid  from "../../../arrow/components/Rows/FourColGrid";

export const ArrowFourColGrid = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`
  };
  return <FourColGrid collection={collection} config={config} />;
};

ArrowFourColGrid.propTypes = {
  collection: object
};

ArrowFourColGrid.storyLimit = 12;
