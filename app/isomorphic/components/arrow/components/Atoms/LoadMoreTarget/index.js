import React from "react";
import PropTypes from "prop-types";

export const LoadMoreTarget = ({ collection, componentName, offset, limit }) => {
  return (
    <div
      id={`ELM-${collection.id}`}
      data-collection-slug={collection["slug"]}
      data-component-name={componentName}
      data-collection-offset={offset}
      data-collection-limit={limit}
    />
  );
};

LoadMoreTarget.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.string,
    slug: PropTypes.string
  }),
  componentName: PropTypes.string,
  offset: PropTypes.number,
  limit: PropTypes.number
};
