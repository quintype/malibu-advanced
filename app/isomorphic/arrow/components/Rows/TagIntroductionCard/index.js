import React from "react";
import PropTypes from "prop-types";
import { getTextColor } from "../../../utils/utils";
import "./tag-intro-card.module.css";

const TagIntroductionCard = ({ data, config = {} }) => {
  const { theme = "" } = config;
  const textColor = getTextColor(theme);
  const { tagDescription, tagName } = data;

  return (
    <div
      className="full-width-with-padding arrow-component"
      styleName={`wrapper ${textColor}`}
      style={{ backgroundColor: theme || "initial" }}>
      <h1 styleName={textColor}>{tagName}</h1>
      <div styleName={`description ${textColor}`}>{tagDescription}</div>
    </div>
  );
};

TagIntroductionCard.propTypes = {
  data: PropTypes.shape({ tagName: PropTypes.string, tagDescription: PropTypes.string }),
  config: PropTypes.shape({ theme: PropTypes.string })
};
export default TagIntroductionCard;
