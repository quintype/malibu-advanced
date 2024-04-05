import React from "react";
import PropTypes from "prop-types";
import { getTextColor } from "../../../utils/utils";
import "./load-more-target.m.css";

export const LoadMoreTarget = ({ collection, componentName, offset, limit, theme = "" }) => {
  const textColor = getTextColor(theme);
  return (
    <div
      id={`ELM-${collection.id}`}
      data-collection-slug={collection.slug}
      data-component-name={componentName}
      data-collection-offset={offset}
      data-collection-limit={limit}
      className={`elm-${componentName.toLowerCase()}`}
      styleName={textColor}
    />
  );
};

LoadMoreTarget.propTypes = {
  collection: PropTypes.shape({
    id: PropTypes.string,
    slug: PropTypes.string,
  }),
  componentName: PropTypes.string,
  offset: PropTypes.number,
  limit: PropTypes.number,
  theme: PropTypes.string,
};
