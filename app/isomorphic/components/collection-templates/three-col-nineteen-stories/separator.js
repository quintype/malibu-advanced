import React from "react";
import { string } from "prop-types";
import "./three-col-nineteen-stories.m.css";

const Divider = ({ width = "1", height = "10", color = "light" }) => {
  return <hr styleName={color}></hr>;
};

Divider.propTypes = {
  color: string,
  width: string,
  height: string,
};

const Dot = ({ width = "3px", height = "3px", color = "light" }) => {
  return (
    <span style={{ verticalAlign: "sub", marginLeft: "2px" }} styleName={color}>
      <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 4 4">
        <circle cx="87" cy="9" r="1" fill="inherit" fillRule="nonzero" transform="translate(-86 -8)" />
      </svg>
    </span>
  );
};

Dot.propTypes = {
  width: string,
  height: string,
  color: string,
};

export const Separator = ({ type, width, height, color }) => {
  switch (type) {
    case "dot":
      return <Dot width={width} height={height} color={color} />;
    case "line":
      return <Divider width={width} height={height} color={color} />;

    default:
      return <Dot width={width} height={height} color={color} />;
  }
};

Separator.propTypes = {
  type: string,
  width: string,
  height: string,
  color: string,
};
