import React from "react";
import PropTypes from "prop-types";

export const Youtube = ({ color = "red" }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21.5 7.125a2.476 2.476 0 0 0-1.75-1.75C18.25 5 11.875 5 11.875 5S5.625 5 4 5.375c-.875.25-1.5.875-1.75 1.75C2 8.75 2 12 2 12s0 3.25.375 4.875c.25.875.875 1.5 1.75 1.75C5.625 19 12 19 12 19s6.25 0 7.875-.375c.875-.25 1.5-.875 1.75-1.75C22 15.25 22 12 22 12s0-3.25-.5-4.875ZM10 15V9l5.25 3L10 15Z"
        fill={color}
      />
    </svg>
  );
};
Youtube.propTypes = {
  color: PropTypes.string
};
