import React from "react";
import PropTypes from "prop-types";

export const ShareIcon = ({ color = "#0D0D0D" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill={color}
        fillRule="evenodd"
        d="M15.843 3.189c-1.478 0-2.689 1.239-2.689 2.75 0 .293.046.58.13.846L8.844 9.31a2.638 2.638 0 00-1.687-.621c-1.477 0-2.688 1.238-2.688 2.75 0 1.51 1.21 2.75 2.688 2.75.638 0 1.224-.231 1.687-.615l4.446 2.525a2.778 2.778 0 00-.136.84c0 1.51 1.211 2.75 2.689 2.75 1.477 0 2.688-1.24 2.688-2.75 0-1.512-1.21-2.75-2.688-2.75-.742 0-1.419.317-1.907.82l-4.323-2.46a2.763 2.763 0 000-2.221l4.317-2.459c.488.506 1.168.82 1.913.82 1.477 0 2.688-1.239 2.688-2.75s-1.21-2.75-2.688-2.75z"
      ></path>
    </svg>
  );
};

ShareIcon.propTypes = {
  color: PropTypes.string,
};
