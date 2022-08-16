import React from "react";
import PropTypes from "prop-types";

export const RightArrow = ({ color = "#333" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 10 16">
      <g fill="none" fillRule="nonzero">
        <path d="M-7-4h24v24H-7z" opacity=".384" />
        <path stroke={color} d="M1 0l8 8-8 8" />
      </g>
    </svg>
  );
};

RightArrow.propTypes = {
  color: PropTypes.string
};
