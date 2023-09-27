import React from "react";
import ListComponent from "../../../../arrow/components/Rows/ListComponent";
import { object } from "prop-types";

export const ArrowListComponent = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <ListComponent collection={collection} config={config} />;
};

ArrowListComponent.propTypes = {
  collection: object,
};

ArrowListComponent.storyLimit = 7;
