import React from "react";
import PropTypes from "prop-types";

export const Twitter = ({ color = "#000" }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M17.75 3h3.068l-6.702 7.658L22 21.078h-6.171l-4.837-6.319-5.528 6.32H2.39l7.167-8.193L2 3h6.328l4.367 5.776L17.75 3Zm-1.078 16.245h1.7L7.401 4.738H5.577l11.095 14.507Z"
        fill={color}
      />
    </svg>
  );
};

Twitter.propTypes = {
  color: PropTypes.string
};
