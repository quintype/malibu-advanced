import React from "react";
import PropTypes from "prop-types";

export const Facebook = ({ color = "#3B5998" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <path
        fill={color}
        d="M9.906 20v-7.156H7.5V10h2.406V7.75c0-1.187.334-2.11 1-2.766.667-.656 1.552-.984 2.656-.984.896 0 1.625.042 2.188.125v2.531h-1.5c-.563 0-.948.125-1.156.375-.167.209-.25.542-.25 1V10H15.5l-.375 2.844h-2.281V20H9.906z"
      ></path>
    </svg>
  );
};
Facebook.propTypes = {
  color: PropTypes.string,
};
