import React from "react";
import { OpinionCollection } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowOpinionCollection = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <OpinionCollection collection={collection} config={config} />;
};

ArrowOpinionCollection.propTypes = {
  collection: object,
};

ArrowOpinionCollection.storyLimit = 6;
