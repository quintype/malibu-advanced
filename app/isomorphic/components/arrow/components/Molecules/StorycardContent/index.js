import React from "react";
import { Headline } from "../../Atoms/Headline";
import { SectionTag } from "../../Atoms/SectionTag";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { getTextColor, rgbToHex } from "../../../utils/utils";

import PropTypes from "prop-types";

import "./storycardContent.m.css";

export const StorycardContent = ({
  story,
  children,
  theme,
  border,
  isHorizontalMobile,
  headerLevel,
  borderColor,
  config
}) => {
  const textColor = getTextColor(theme);
  const borderOptions = ["full"];
  const SectionTagborderColor = rgbToHex(borderColor);
  const borderTemplate = borderOptions.includes(border) ? `border-${border}` : "";
  const horizontalCard = isHorizontalMobile ? "horizontal-content-wrapper" : "";
  return (
    <div
      className="arr--content-wrapper"
      data-test-id="story-card-content"
      styleName={`wrapper ${borderTemplate} ${horizontalCard}`}
      style={{ backgroundColor: theme, color: textColor }}>
      {children || (
        <DefaultStoryCardContent
          story={story}
          headerLevel={headerLevel}
          isHorizontalMobile={isHorizontalMobile}
          borderColor={SectionTagborderColor}
          config={config}
        />
      )}
    </div>
  );
};

const DefaultStoryCardContent = ({ story, headerLevel, borderColor, config = {} }) => {
  const SectionTagborderColor = rgbToHex(borderColor);
  const { localizationConfig = {} } = config;
  return (
    <div>
      <SectionTag story={story} borderColor={SectionTagborderColor} />
      <Headline story={story} headerLevel={headerLevel} premiumStoryIconConfig={config} />
      <AuthorWithTime config={localizationConfig} story={story} />
    </div>
  );
};

DefaultStoryCardContent.propTypes = {
  story: PropTypes.object.isRequired,
  border: PropTypes.string,
  theme: PropTypes.string,
  isHorizontalMobile: PropTypes.bool,
  headerLevel: PropTypes.string,
  borderColor: PropTypes.string,
  config: PropTypes.object
};

StorycardContent.propTypes = {
  story: PropTypes.object.isRequired,
  children: PropTypes.node,
  theme: PropTypes.string,
  border: PropTypes.string,
  isHorizontalMobile: PropTypes.bool,
  headerLevel: PropTypes.string,
  borderColor: PropTypes.string,
  config: PropTypes.object
};
