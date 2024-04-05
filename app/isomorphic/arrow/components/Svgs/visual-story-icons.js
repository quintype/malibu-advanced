import React from "react";
import { getIconColor } from "../../utils/utils";
import PropTypes from "prop-types";

export function VisualStoryIcon1({ background }) {
  const iconColor = getIconColor(background);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={"10%"} viewBox="0 0 23 23" fill="none">
      <rect width="100%" height="100%" fill={background} />
      <g clipPath="url(#clip0_1430_3125)">
        <path
          d="M1.91675 6.70835H5.75008V16.2917H1.91675V6.70835ZM6.70841 18.2084H16.2917V4.79169H6.70841V18.2084ZM17.2501 6.70835H21.0834V16.2917H17.2501V6.70835Z"
          fill={iconColor}
        />
      </g>
    </svg>
  );
}

export function VisualStoryIcon2({ background }) {
  const iconColor = getIconColor(background);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={"10%"} viewBox="0 0 23 23" fill="none">
      <rect width="100%" height="100%" fill={background} />
      <g clipPath="url(#clip0_1430_3131)">
        <path
          d="M1.91675 6.70835H5.75008V16.2917H1.91675V6.70835ZM6.70841 18.2084H16.2917V4.79169H6.70841V18.2084ZM8.62508 6.70835H14.3751V16.2917H8.62508V6.70835ZM17.2501 6.70835H21.0834V16.2917H17.2501V6.70835Z"
          fill={iconColor}
        />
      </g>
    </svg>
  );
}

export function VisualStoryIcon3({ background }) {
  const iconColor = getIconColor(background);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={"10%"} viewBox="0 0 25 25" fill="none">
      <rect width="100%" height="100%" fill={background} />
      <path
        d="M3.875 19.2084H13.4583V5.79169H3.875V19.2084ZM5.79167 7.70835H11.5417V17.2917H5.79167V7.70835ZM14.4167 6.75002H17.2917V18.25H14.4167V6.75002Z"
        fill={iconColor}
      />
      <path d="M21.125 7.70835H18.25V17.2917H21.125V7.70835Z" fill={iconColor} />
    </svg>
  );
}

export function VisualStoryIcon4({ background }) {
  const iconColor = getIconColor(background);
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={"10%"} viewBox="0 0 25 25" fill="none">
      <rect width="100%" height="100%" fill={background} />
      <path
        d="M3.875 19.2084H13.4583V5.79169H3.875V19.2084ZM14.4167 6.75002H17.2917V18.25H14.4167V6.75002Z"
        fill={iconColor}
      />
      <path d="M21.125 7.70835H18.25V17.2917H21.125V7.70835Z" fill={iconColor} />
    </svg>
  );
}

VisualStoryIcon1.propTypes = {
  background: PropTypes.string
};

VisualStoryIcon2.propTypes = {
  background: PropTypes.string
};

VisualStoryIcon3.propTypes = {
  background: PropTypes.string
};

VisualStoryIcon4.propTypes = {
  background: PropTypes.string
};
