import React from "react";
import { Listicles } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowListicles = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <Listicles collection={collection} config={config} />;
};

ArrowListicles.propTypes = {
  collection: object,
};

ArrowListicles.storyLimit = 5;
