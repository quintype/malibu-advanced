import React from "react";
import PropTypes from "prop-types";

export const UserFallbackIcon = ({ width = 120, height = 120 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M93.28 108.98c-1.055-17.675-15.47-31.678-33.098-31.678-17.708 0-32.173 14.129-33.11 31.916 9.415 6.311 20.741 9.993 32.927 9.993 12.338 0 23.795-3.774 33.28-10.23l.001-.001zM58.584 73.283c9.928 0 17.977-8.275 17.977-18.483 0-10.209-8.049-18.484-17.977-18.484-9.929 0-17.977 8.275-17.977 18.484 0 10.208 8.048 18.483 17.977 18.483zM60 120C26.863 120 0 93.137 0 60S26.863 0 60 0s60 26.863 60 60-26.863 60-60 60z"
        fill="#DADADA"
        fillRule="nonzero"
      />
    </svg>
  );
};

UserFallbackIcon.propTypes = {
  width: PropTypes.object,
  height: PropTypes.object
};
