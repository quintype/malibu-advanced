import React from "react";
import PropTypes from "prop-types";
import "./dot.m.css";

export const Dot = ({ width = "3px", height = "3px", color = "light" }) => {
  return (
    <div className="arr--dot" styleName={color}>
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 3 3">
        <circle cx="87" cy="9" r="1" fill="inherit" fillRule="nonzero" transform="translate(-86 -8)" />
      </svg>
    </div>
  );
};

Dot.propTypes = {
  /** height , width and color of the dot icon */
  color: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string
};
