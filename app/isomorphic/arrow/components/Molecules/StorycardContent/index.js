import React from "react";
import { Headline } from "../../Atoms/Headline";
import { SectionTag } from "../../Atoms/SectionTag";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { Subheadline } from "../../Atoms/Subheadline";
import { rgbToHex } from "../../../utils/utils";
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
  config,
  showSubheadline,
  collectionId,
  roundedCorners = ""
}) => {
  const borderOptions = ["full"];
  const SectionTagborderColor = rgbToHex(borderColor);
  const borderTemplate = borderOptions.includes(border) ? `border-${border}` : "";
  const horizontalCard = isHorizontalMobile ? "horizontal-content-wrapper" : "content-wrapper";
  return (
    <div
      className={`arr--content-wrapper ${roundedCorners}`}
      data-test-id="story-card-content"
      styleName={`wrapper ${borderTemplate} ${horizontalCard}`}
      style={{ backgroundColor: theme || "initial" }}>
      {children || (
        <DefaultStoryCardContent
          story={story}
          headerLevel={headerLevel}
          isHorizontalMobile={isHorizontalMobile}
          borderColor={SectionTagborderColor}
          config={config}
          showSubheadline={showSubheadline}
          collectionId={collectionId}
        />
      )}
    </div>
  );
};

const DefaultStoryCardContent = ({ story, headerLevel, borderColor, config = {}, showSubheadline, collectionId }) => {
  const SectionTagborderColor = rgbToHex(borderColor);
  const { localizationConfig = {} } = config;
  return (
    <div>
      <SectionTag story={story} borderColor={SectionTagborderColor} />
      <Headline story={story} headerLevel={headerLevel} premiumStoryIconConfig={config} />
      {showSubheadline && <Subheadline story={story} truncateChars={200} />}
      <AuthorWithTime config={localizationConfig} story={story} collectionId={collectionId} />
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
  config: PropTypes.object,
  showSubheadline: PropTypes.bool,
  collectionId: PropTypes.number
};

StorycardContent.propTypes = {
  story: PropTypes.object.isRequired,
  children: PropTypes.node,
  theme: PropTypes.string,
  border: PropTypes.string,
  isHorizontalMobile: PropTypes.bool,
  headerLevel: PropTypes.string,
  borderColor: PropTypes.string,
  config: PropTypes.object,
  showSubheadline: PropTypes.bool,
  collectionId: PropTypes.number,
  roundedCorners: PropTypes.string
};
