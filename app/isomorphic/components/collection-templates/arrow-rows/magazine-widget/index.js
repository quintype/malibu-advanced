import React from "react";
import { MagazineWidget } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowMagazineWidget = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <MagazineWidget collection={collection} config={config} />;
};

ArrowMagazineWidget.propTypes = {
  collection: object,
};

ArrowMagazineWidget.storyLimit = 4;
