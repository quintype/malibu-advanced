import React from "react";
import PropTypes from "prop-types";

export const LeftArrow = ({ color = "#333" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 10 16">
      <g fill="none" fillRule="nonzero">
        <path d="M17 20H-7V-4h24z" opacity=".384" />
        <path stroke={color} d="M9 16L1 8l8-8" />
      </g>
    </svg>
  );
};

LeftArrow.propTypes = {
  color: PropTypes.string
};
