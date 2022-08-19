import React from "react";
import PropTypes from "prop-types";

export const CrownIcon = ({ height, width, color = "#D8D8D8", positionTop }) => {
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
            <g fill={color} fillRule="nonzero" transform="translate(0 2)">
              <path d="M21.043 19.553c0-.743-.601-1.344-1.344-1.344h-15.4a1.343 1.343 0 100 2.688h15.4c.743 0 1.344-.603 1.344-1.344zM1.598 8.673c.022 0 .042 0 .064-.003l2.131 7.713h16.411l2.132-7.713c.022 0 .041.003.063.003a1.599 1.599 0 10-1.52-1.108L17.025 9.82 12.882 2.95a1.599 1.599 0 10-1.765 0L6.976 9.82 3.121 7.565a1.599 1.599 0 10-1.523 1.107z"></path>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

CrownIcon.propTypes = {
  height: PropTypes.string,
  width: PropTypes.string,
  color: PropTypes.string,
  positionTop: PropTypes.string
};
