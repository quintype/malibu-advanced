import React from "react";
import PropTypes from "prop-types";

export const LockIcon = ({ height, width, color = "#D5D5D5", positionTop }) => {
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
            <g fill={color} fillRule="nonzero" transform="translate(3)">
              <path d="M15.692 9h-.747V6c0-3.31-2.681-6-5.978-6C5.67 0 2.989 2.69 2.989 6v3h-.747A2.249 2.249 0 000 11.25v10.5A2.249 2.249 0 002.242 24h13.45a2.249 2.249 0 002.242-2.25v-10.5A2.249 2.249 0 0015.692 9zM4.982 6c0-2.206 1.787-4 3.985-4s3.985 1.794 3.985 4v3h-7.97V6z"></path>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
};

LockIcon.propTypes = {
  height: PropTypes.string,
  width: PropTypes.string,
  color: PropTypes.string,
  positionTop: PropTypes.string
};
