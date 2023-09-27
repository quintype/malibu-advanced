import React from "react";
import AlternateCollectionFilter from "../../../../arrow/components/Rows/AlternateCollectionFilter";
import { object } from "prop-types";

export const ArrowAlternateCollectionFilter = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <AlternateCollectionFilter collection={collection} config={config} />;
};

ArrowAlternateCollectionFilter.propTypes = {
  collection: object,
};

ArrowAlternateCollectionFilter.storyLimit = 14;
