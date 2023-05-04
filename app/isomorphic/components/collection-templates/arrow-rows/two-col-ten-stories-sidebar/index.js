import React from "react";
import { TwoColTenStoriesSidebar } from "../../../../arrow";
import { object } from "prop-types";

export const ArrowTwoColTenStoriesSidebar = ({ collection }) => {
  const config = {
    buttonText: `${collection.name} News`,
  };
  return <TwoColTenStoriesSidebar collection={collection} config={config} />;
};

ArrowTwoColTenStoriesSidebar.propTypes = {
  collection: object,
};

ArrowTwoColTenStoriesSidebar.storyLimit = 10;
