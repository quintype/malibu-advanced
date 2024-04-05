import React from "react";
import PropTypes from "prop-types";
import "./icon.m.css";

export const EdgeIcon = ({ width, height, color, opacity }) => {
  const lightColor = color === "light" && "#ffffff";
  const darkColor = color === "dark" && "#0d0d0d";
  const fillColor = lightColor || darkColor || color;
  return (
    <div styleName="edge-wrapper" style={fillColor ? { fill: fillColor } : {}}>
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 64 64">
        <path
          fill="inherit"
          opacity={opacity}
          d="M16.858 29.836v4.727H28V60H4V29.836c0-9.6 2.606-16.727 7.746-21.187C15.3 5.564 19.8 4 25.122 4v13.627c-2.888 0-8.264 0-8.264 12.209zm40.264-12.21V4c-5.32 0-9.82 1.564-13.376 4.65C38.606 13.108 36 20.236 36 29.835V60h24V34.563H48.857v-4.727c0-12.21 5.377-12.21 8.265-12.21z"
        />
      </svg>
    </div>
  );
};

EdgeIcon.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  color: PropTypes.string,
  opacity: PropTypes.string
};
