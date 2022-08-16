import React from "react";
import PropTypes from "prop-types";
import "./icon.m.css";

export const CurveIcon = ({ width, height, color, opacity }) => {
  const lightColor = color === "light" && "#ffffff";
  const darkColor = color === "dark" && "#0d0d0d";
  return (
    <div styleName="curve-wrapper" style={{ fill: `${lightColor || darkColor || color}` }}>
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 64 64">
        <path
          fill="inherit"
          opacity={opacity}
          d="M61 44.702c0 3.465-1.13 6.214-3.39 8.248-2.261 2.033-5.125 3.05-8.59 3.05-4.07 0-7.423-1.356-10.06-4.067-2.638-2.712-3.956-6.704-3.956-11.976 0-4.971.716-9.227 2.147-12.767 1.432-3.54 3.165-6.553 5.2-9.039 2.034-2.485 4.144-4.481 6.33-5.988 2.184-1.506 4.106-2.56 5.763-3.163l5.652 7.909c-3.316 1.657-5.99 3.879-8.025 6.666-2.035 2.786-3.052 6.289-3.052 10.507.603-.15 1.432-.226 2.487-.226 3.014 0 5.35 1.054 7.007 3.163C60.171 39.13 61 41.69 61 44.702zm-33.004 0c0 3.465-1.13 6.214-3.39 8.248-2.261 2.033-5.125 3.05-8.59 3.05-4.07 0-7.423-1.356-10.06-4.067C3.319 49.22 2 45.229 2 39.957c0-4.971.716-9.227 2.148-12.767 1.431-3.54 3.164-6.553 5.199-9.039 2.034-2.485 4.144-4.481 6.33-5.988C17.86 10.657 19.782 9.603 21.44 9l5.651 7.909c-3.316 1.657-5.99 3.879-8.025 6.666-2.034 2.786-3.052 6.289-3.052 10.507.603-.15 1.432-.226 2.487-.226 3.014 0 5.35 1.054 7.008 3.163 1.657 2.11 2.486 4.67 2.486 7.683z"
        />
      </svg>
    </div>
  );
};

CurveIcon.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  color: PropTypes.string,
  opacity: PropTypes.string,
};
