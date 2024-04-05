import React from "react";
import { Headline } from "../../Atoms/Headline/index";
import { Subheadline } from "../../Atoms/Subheadline/index";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { HeroImage } from "../../Atoms/HeroImage/index";
import { SectionTag } from "../../Atoms/SectionTag/index";
import { getTextColor, isEmpty, rgbToHex } from "../../../utils/utils";
import { StateProvider } from "../../SharedContext";
import { useSelector } from "react-redux";
import { roundedCornerClass } from "../../../constants";
import get from "lodash.get";

import PropTypes from "prop-types";

import "./storycard.m.css";

const StoryCardBase = ({
  story,
  children,
  isHorizontal,
  aspectRatio,
  border,
  useImageAsBackground,
  bgImgContentOverlap,
  theme,
  borderColor,
  isHorizontalMobile,
  centerAlign,
  headerLevel,
  hideAuthorImage,
  prefix,
  config,
  isHorizontalWithImageLast,
  collectionId,
  widths,
  isFullWidthImage = false,
  isCircularImage = false,
}) => {
  if (!story || isEmpty(story)) return <div />;
  const borderOptions = ["default", "full", "bottom", "boxShadow"];
  const borderTemplate = borderOptions.includes(border) ? `border-${border}` : "";
  // TODO optimize conditions

  let horizontalCardStyle = "default-card";
  if (isHorizontal) horizontalCardStyle = "horizontal-card";
  else if (isHorizontalWithImageLast) horizontalCardStyle = "horizontal-image-last";

  const bgImageClasses = useImageAsBackground ? "backgroung-img" : "";
  const bgImgContentOverlapClass = bgImgContentOverlap ? "content-overlap" : "";
  const textColor = getTextColor(theme);
  const horizontalMobileClasses = isHorizontalMobile ? "horizontal-mob" : "";

  const enableRoundedCorners = useSelector((state) =>
    get(state, ["qt", "config", "pagebuilder-config", "general", "enableRoundedCorners"], false)
  );

  const roundedCorners = enableRoundedCorners ? roundedCornerClass : "";

  const defaultStorycard = (
    <DefaultStoryCard
      story={story}
      aspectRatio={aspectRatio}
      border={border}
      isHorizontalMobile={isHorizontalMobile}
      isHorizontal={isHorizontal}
      centerAlign={centerAlign}
      headerLevel={headerLevel}
      borderColor={borderColor}
      hideAuthorImage={hideAuthorImage}
      prefix={prefix}
      config={config}
      isHorizontalWithImageLast={isHorizontalWithImageLast}
      collectionId={collectionId}
      widths={widths}
      isFullWidthImage={isFullWidthImage}
      isCircularImage={isCircularImage}
    />
  );
  return (
    <div
      className={`arr--story-card ${roundedCorners}`}
      data-test-id="story-card"
      style={{ backgroundColor: theme || "initial" }}
      styleName={`card ${horizontalCardStyle} ${borderTemplate} ${textColor} ${bgImageClasses} ${bgImgContentOverlapClass} ${horizontalMobileClasses}`}
    >
      {children || defaultStorycard}
    </div>
  );
};

const DefaultStoryCard = ({
  story,
  border,
  isHorizontal,
  aspectRatio,
  headerLevel,
  isHorizontalMobile = false,
  centerAlign = false,
  borderColor,
  hideAuthorImage,
  prefix,
  isHorizontalWithImageLast,
  config,
  collectionId,
  widths,
  isFullWidthImage = false,
  isCircularImage = false,
}) => {
  const alignment = centerAlign ? "center-align" : "";
  const SectionTagborderColor = rgbToHex(borderColor);
  const { localizationConfig = {} } = config;

  return (
    <>
      {isHorizontal ? (
        <HeroImage
          config={config}
          story={story}
          isHorizontal
          isHorizontalMobile={isHorizontalMobile}
          aspectRatio={aspectRatio}
          widths={widths}
          isFullWidthImage={isFullWidthImage}
          isCircularImage={isCircularImage}
        />
      ) : isHorizontalWithImageLast ? (
        <HeroImage
          config={config}
          story={story}
          isHorizontalWithImageLast
          isHorizontalMobile={isHorizontalMobile}
          aspectRatio={aspectRatio}
          widths={widths}
          isFullWidthImage={isFullWidthImage}
          isCircularImage={isCircularImage}
        />
      ) : (
        <HeroImage
          story={story}
          config={config}
          isHorizontalMobile={isHorizontalMobile}
          aspectRatio={aspectRatio}
          widths={widths}
          isFullWidthImage={isFullWidthImage}
          isCircularImage={isCircularImage}
        />
      )}
      <div className="arr--story-content" styleName={`content ${alignment}`}>
        <SectionTag story={story} borderColor={SectionTagborderColor} />
        <Headline story={story} headerLevel={headerLevel} premiumStoryIconConfig={config} />
        <AuthorWithTime
          config={localizationConfig}
          story={story}
          isBottom
          prefix={prefix}
          hideAuthorImage={hideAuthorImage}
          collectionId={collectionId}
        />
        <Subheadline story={story} />
      </div>
    </>
  );
};

DefaultStoryCard.propTypes = {
  story: PropTypes.object.isRequired,
  border: PropTypes.oneOfType([PropTypes.string]),
  isBottom: PropTypes.bool,
  isHorizontal: PropTypes.bool,
  aspectRatio: PropTypes.oneOfType([PropTypes.array]),
  isHorizontalMobile: PropTypes.bool,
  centerAlign: PropTypes.bool,
  headerLevel: PropTypes.string,
  borderColor: PropTypes.string,
  hideAuthorImage: PropTypes.bool,
  prefix: PropTypes.string,
  config: PropTypes.object,
  isHorizontalWithImageLast: PropTypes.bool,
  collectionId: PropTypes.number,
  widths: PropTypes.array,
  isFullWidthImage: PropTypes.bool,
  isCircularImage: PropTypes.bool,
};

StoryCardBase.propTypes = {
  /** The Story Object from the API response */
  story: PropTypes.object.isRequired,
  children: PropTypes.node,
  /** Flip the Story Card to Horizonal mode */
  isHorizontal: PropTypes.bool,
  /** Add border to the Story Card  */
  border: PropTypes.oneOfType([PropTypes.string]),
  // story card with background image
  useImageAsBackground: PropTypes.bool,
  // story card  content overlap with image
  bgImgContentOverlap: PropTypes.bool,
  /** add aspect ratio for hero image  */
  aspectRatio: PropTypes.oneOfType([PropTypes.array]),
  /** add theme(dark /light/custom color) for storycard  */
  theme: PropTypes.string,
  /** flip the story card mobile design horizontal */
  isHorizontalMobile: PropTypes.bool,
  // make content center align in desktop and left align in mobile
  centerAlign: PropTypes.bool,
  headerLevel: PropTypes.string,
  borderColor: PropTypes.string,
  // handle author image through storycard
  hideAuthorImage: PropTypes.bool,
  // handle author prefix through storycard
  prefix: PropTypes.string,
  config: PropTypes.object,
  isHorizontalWithImageLast: PropTypes.bool,
  collectionId: PropTypes.number,
  widths: PropTypes.array,
  isFullWidthImage: PropTypes.bool,
  isCircularImage: PropTypes.bool,
};

StoryCardBase.defaultProps = {
  isHorizontal: false,
  isHorizontalMobile: false,
  border: "default",
  theme: "",
  centerAlign: false,
  borderColor: "",
  isHorizontalWithImageLast: false,
  isFullWidthImage: false,
  isCircularImage: false,
};

export const StoryCard = StateProvider(StoryCardBase);
