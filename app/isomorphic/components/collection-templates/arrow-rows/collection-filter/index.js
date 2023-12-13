import React from "react";
import { CollectionFilter } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowCollectionFilter = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <CollectionFilter collection={collection} config={config} />;
};

ArrowCollectionFilter.propTypes = {
  collection: object,
};

ArrowCollectionFilter.storyLimit = 4;
