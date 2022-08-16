import React from "react";
import PropTypes from "prop-types";

export const KeyIcon = ({ height, width, color = "#D5D5D5", positionTop }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 40 40"
      style={{ position: "relative", top: positionTop }}>
      <g fill="none" fillRule="evenodd" stroke="none" strokeWidth="1">
        <g>
          <g transform="translate(8 8)">
            <path d="M0 0H24V24H0z"></path>
            <path
              fill={color}
              fillRule="nonzero"
              d="M12.71 4.364A6.54 6.54 0 000 6.545a6.54 6.54 0 0012.71 2.182h4.745v4.364h4.363V8.727H24V4.364H12.71zM6.544 8.727a2.181 2.181 0 110-4.362 2.181 2.181 0 010 4.362z"
              transform="translate(0 5)"></path>
          </g>
        </g>
      </g>
    </svg>
  );
};

KeyIcon.propTypes = {
  height: PropTypes.string,
  width: PropTypes.string,
  color: PropTypes.string,
  positionTop: PropTypes.string
};
