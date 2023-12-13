import React from "react";
import { AstrologyCollection } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowAstrologyCollection = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <AstrologyCollection collection={collection} config={config} />;
};

ArrowAstrologyCollection.propTypes = {
  collection: object,
};

ArrowAstrologyCollection.storyLimit = 4;
