import React from "react";
import { object } from "prop-types";
import ThreeColGrid  from "../../.././../arrow/components/Rows/ThreeColGrid";

import "./style.m.css";

export const ArrowThreeColGrid = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
    showImagePlaceholder: true
  };
  return <ThreeColGrid collection={collection} config={config} />;
};

ArrowThreeColGrid.propTypes = {
  collection: object
};

ArrowThreeColGrid.storyLimit = 6;
