import React from "react";
import PropTypes from "prop-types";
import "./loading.m.css";

export const Loading = ({ width = 40, height = 30, iconColor = "#99B0CB" }) => {
  return (
    <div styleName="loading-indicator">
      <svg
        width="40"
        height="40"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid">
        <circle cx="84" cy="50" r="0" fill="currentColor">
          <animate
            attributeName="r"
            values="10;0;0;0;0"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
            calcMode="spline"
            dur="2s"
            repeatCount="indefinite"
            begin="0s"
          />
          <animate
            attributeName="cx"
            values="84;84;84;84;84"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
            calcMode="spline"
            dur="2s"
            repeatCount="indefinite"
            begin="0s"
          />
        </circle>
        <circle cx="84" cy="50" r=".709" fill="currentColor">
          <animate
            attributeName="r"
            values="0;10;10;10;0"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
            calcMode="spline"
            dur="2s"
            repeatCount="indefinite"
            begin="-1s"
          />
          <animate
            attributeName="cx"
            values="16;16;50;84;84"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
            calcMode="spline"
            dur="2s"
            repeatCount="indefinite"
            begin="-1s"
          />
        </circle>
        <circle cx="81.59" cy="50" r="10" fill="currentColor">
          <animate
            attributeName="r"
            values="0;10;10;10;0"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
            calcMode="spline"
            dur="2s"
            repeatCount="indefinite"
            begin="-0.5s"
          />
          <animate
            attributeName="cx"
            values="16;16;50;84;84"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
            calcMode="spline"
            dur="2s"
            repeatCount="indefinite"
            begin="-0.5s"
          />
        </circle>
        <circle cx="47.59" cy="50" r="10" fill="currentColor">
          <animate
            attributeName="r"
            values="0;10;10;10;0"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
            calcMode="spline"
            dur="2s"
            repeatCount="indefinite"
            begin="0s"
          />
          <animate
            attributeName="cx"
            values="16;16;50;84;84"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
            calcMode="spline"
            dur="2s"
            repeatCount="indefinite"
            begin="0s"
          />
        </circle>
        <circle cx="16" cy="50" r="9.291" fill="currentColor">
          <animate
            attributeName="r"
            values="0;0;10;10;10"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
            calcMode="spline"
            dur="2s"
            repeatCount="indefinite"
            begin="0s"
          />
          <animate
            attributeName="cx"
            values="16;16;16;50;84"
            keyTimes="0;0.25;0.5;0.75;1"
            keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
            calcMode="spline"
            dur="2s"
            repeatCount="indefinite"
            begin="0s"
          />
        </circle>
      </svg>
    </div>
  );
};

Loading.propTypes = {
  width: PropTypes.object,
  height: PropTypes.object,
  iconColor: PropTypes.object
};
