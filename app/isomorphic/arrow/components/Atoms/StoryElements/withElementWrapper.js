/* eslint-disable react/display-name, react/prop-types */
import React from "react";
import PropTypes from "prop-types";

export const withElementWrapper = (StoryElement) => (props) => {
  const { element, render, ...restProps } = props;
  if (!element) return null;
  if (render && typeof render === "function") return render(props);
  return <StoryElement {...restProps} element={element} />;
};

withElementWrapper.propTypes = {
  StoryElement: PropTypes.element,
};
