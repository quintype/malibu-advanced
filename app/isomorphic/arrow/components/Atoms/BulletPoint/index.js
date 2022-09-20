import React from "react";
import PropTypes from "prop-types";
import { useStateValue } from "../../SharedContext";
import { getTextColor } from "../../../utils/utils";
import "./bullet-point.m.css";

export const BulletPoint = ({ bulletValue = "" }) => {
  const configData = useStateValue() || {};
  const textColor = getTextColor(configData.theme);
  return (
    <div className="arrow-component arr--bullet-point">
      <span styleName={`bullet ${textColor}`}>{bulletValue}</span>
    </div>
  );
};

BulletPoint.propTypes = {
  bulletValue: PropTypes.string,
};
