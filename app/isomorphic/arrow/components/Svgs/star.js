import React from "react";
import PropTypes from "prop-types";

export const StarIcon = ({ width, height, color = "#D5D5D5", positionTop = "" }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 40 40"
      style={{ position: "relative", top: positionTop }}>
      <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
        <g>
          <path
            fill={color}
            d="M20 26L12.946577 29.7082039 14.2936609 21.854102 8.5873218 16.2917961 16.4732885 15.145898 20 8 23.5267115 15.145898 31.4126782 16.2917961 25.7063391 21.854102 27.053423 29.7082039z"></path>
        </g>
      </g>
    </svg>
  );
};

StarIcon.propTypes = {
  height: PropTypes.string,
  width: PropTypes.string,
  color: PropTypes.string,
  positionTop: PropTypes.string
};
