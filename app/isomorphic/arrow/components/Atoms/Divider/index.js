import React from "react";
import PropTypes from "prop-types";
import "./divider.m.css";

export const Divider = ({ width = "1", height = "10", color = "light" }) => {
  return (
    <div className="arr--divider" styleName={color}>
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height}>
        <path fill="inherit" d="M0 0h1v10H0z"></path>
      </svg>
    </div>
  );
};

Divider.propTypes = {
  /** height , width and color of the dot icon */
  color: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
};
