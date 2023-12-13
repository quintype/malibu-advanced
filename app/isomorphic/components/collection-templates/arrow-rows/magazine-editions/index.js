import React from "react";
import { MagazineEditions } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowMagazineEditions = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <MagazineEditions collection={collection} config={config} />;
};

ArrowMagazineEditions.propTypes = {
  collection: object,
};

ArrowMagazineEditions.storyLimit = 4;
