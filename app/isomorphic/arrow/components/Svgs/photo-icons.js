import React from "react";
import { getIconColor } from "../../utils/utils";
import PropTypes from "prop-types";

export function PhotoIcon1({ background }) {
  const iconColor = getIconColor(background);
  return (
    <svg width={"10%"} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill={background} />

      <g clipPath="url(#clip0_1430_2817)">
        <path
          d="M19.2083 5.79167V19.2083H5.79167V5.79167H19.2083ZM19.2083 3.875H5.79167C4.7375 3.875 3.875 4.7375 3.875 5.79167V19.2083C3.875 20.2625 4.7375 21.125 5.79167 21.125H19.2083C20.2625 21.125 21.125 20.2625 21.125 19.2083V5.79167C21.125 4.7375 20.2625 3.875 19.2083 3.875ZM14.5508 12.3658L11.6758 16.0746L9.625 13.5925L6.75 17.2917H18.25L14.5508 12.3658Z"
          fill={iconColor}
        />
      </g>
    </svg>
  );
}

export function PhotoIcon2({ background }) {
  const iconColor = getIconColor(background);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10%" viewBox="0 0 23 23" fill="none">
      <rect width="100%" height="100%" fill={background} />
      <g clipPath="url(#clip0_1430_3084)">
        <path
          d="M19.125 17.4306V5.56944C19.125 4.6375 18.3625 3.875 17.4306 3.875H5.56944C4.6375 3.875 3.875 4.6375 3.875 5.56944V17.4306C3.875 18.3625 4.6375 19.125 5.56944 19.125H17.4306C18.3625 19.125 19.125 18.3625 19.125 17.4306ZM8.53472 12.7708L10.6528 15.321L13.6181 11.5L17.4306 16.5833H5.56944L8.53472 12.7708Z"
          fill={iconColor}
        />
      </g>
    </svg>
  );
}

export function PhotoIcon3({ background }) {
  const iconColor = getIconColor(background);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10%" viewBox="0 0 23 23" fill="none">
      <rect width="100%" height="100%" fill={background} />
      <g clipPath="url(#clip0_1430_3065)">
        <path
          d="M13.3285 5.55831L14.9069 7.28331H18.4V17.6333H4.6V7.28331H8.09313L9.6715 5.55831H13.3285ZM14.0875 3.83331H8.9125L7.33413 5.55831H4.6C3.65125 5.55831 2.875 6.33456 2.875 7.28331V17.6333C2.875 18.5821 3.65125 19.3583 4.6 19.3583H18.4C19.3488 19.3583 20.125 18.5821 20.125 17.6333V7.28331C20.125 6.33456 19.3488 5.55831 18.4 5.55831H15.6659L14.0875 3.83331ZM11.5 9.87081C12.9231 9.87081 14.0875 11.0352 14.0875 12.4583C14.0875 13.8814 12.9231 15.0458 11.5 15.0458C10.0769 15.0458 8.9125 13.8814 8.9125 12.4583C8.9125 11.0352 10.0769 9.87081 11.5 9.87081ZM11.5 8.14581C9.1195 8.14581 7.1875 10.0778 7.1875 12.4583C7.1875 14.8388 9.1195 16.7708 11.5 16.7708C13.8805 16.7708 15.8125 14.8388 15.8125 12.4583C15.8125 10.0778 13.8805 8.14581 11.5 8.14581Z"
          fill={iconColor}
        />
      </g>
    </svg>
  );
}

export function PhotoIcon4({ background }) {
  const iconColor = getIconColor(background);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10%" viewBox="0 0 23 23" fill="none">
      <rect width="100%" height="100%" fill={background} />
      <g clipPath="url(#clip0_1430_3070)">
        <path
          d="M11.5 15.2183C13.0243 15.2183 14.26 13.9826 14.26 12.4583C14.26 10.934 13.0243 9.6983 11.5 9.6983C9.97568 9.6983 8.73999 10.934 8.73999 12.4583C8.73999 13.9826 9.97568 15.2183 11.5 15.2183Z"
          fill={iconColor}
        />
        <path
          d="M8.9125 3.83331L7.33413 5.55831H4.6C3.65125 5.55831 2.875 6.33456 2.875 7.28331V17.6333C2.875 18.5821 3.65125 19.3583 4.6 19.3583H18.4C19.3488 19.3583 20.125 18.5821 20.125 17.6333V7.28331C20.125 6.33456 19.3488 5.55831 18.4 5.55831H15.6659L14.0875 3.83331H8.9125ZM11.5 16.7708C9.1195 16.7708 7.1875 14.8388 7.1875 12.4583C7.1875 10.0778 9.1195 8.14581 11.5 8.14581C13.8805 8.14581 15.8125 10.0778 15.8125 12.4583C15.8125 14.8388 13.8805 16.7708 11.5 16.7708Z"
          fill={iconColor}
        />
      </g>
    </svg>
  );
}

PhotoIcon1.propTypes = {
  background: PropTypes.string,
};

PhotoIcon2.propTypes = {
  background: PropTypes.string,
};

PhotoIcon3.propTypes = {
  background: PropTypes.string,
};

PhotoIcon4.propTypes = {
  background: PropTypes.string,
};
