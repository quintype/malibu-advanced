import React from "react";
import PropTypes from "prop-types";

export const CloseIcon = ({ color = "#333" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <g fill="none" stroke={color} strokeLinecap="square" strokeWidth="2">
        <path d="M16.95 6.914l-9.9 9.9M16.95 17.107l-9.9-9.9"></path>
      </g>
    </svg>
  );
};
CloseIcon.propTypes = {
  color: PropTypes.string
};
