import React from "react";
import PropTypes from "prop-types";
import { Link } from "@quintype/components";
import { useStateValue } from "../../SharedContext";
import get from "lodash.get";
import { getTextColor, isExternalStory, getStoryUrl } from "../../../utils/utils";
import { PremiumStoryIcon } from "../PremiumStoryIcon";
import LiveIcon from "../../Svgs/liveicon";

import "./headline.m.css";

export const Headline = ({ story, headerLevel, premiumStoryIconConfig = {}, isLink }) => {
  const configData = useStateValue() || {};
  const {
    iconColor = "#F7B500",
    iconStyle = "star",
    enablePremiumStoryIcon = false,
    showLiveIcon = false
  } = premiumStoryIconConfig;
  const alternateHeadline = get(story, ["alternative", "home", "default", "headline"]);
  const premiumStory = enablePremiumStoryIcon && get(story, ["access"]) === "subscription";
  const headline = alternateHeadline || story.headline;
  const HeaderTag = "h" + headerLevel;

  const positionHeadline = () => {
    switch (parseInt(headerLevel)) {
      case 1:
        return "-2px";
      case 2:
        return "2px";
      case 3:
        return "4px";
      case 4:
        return "5px";
      default:
        return "6px";
    }
  };

  const textColor = getTextColor(configData.theme);
  const wrapperClass = premiumStory ? "wrapper" : "";
  const iconSize = "24px";

  const enableLiveIcon =
    showLiveIcon && story["story-template"] === "live-blog" && !get(story, ["metadata", "is-closed"], false);

  return (
    <div className="arrow-component arr--headline" styleName={wrapperClass} data-test-id="headline">
      {premiumStory && (
        <PremiumStoryIcon
          width={iconSize}
          height={iconSize}
          color={iconColor}
          iconType={iconStyle}
          positionTop={positionHeadline()}
        />
      )}
      {isLink ? (
        <Link href={getStoryUrl(story, `/${story.slug}`)} externalLink={isExternalStory(story)} aria-label="headline">
          <HeaderTag styleName={`headline ${textColor}`}>
            {enableLiveIcon && <LiveIcon />}
            {headline}
          </HeaderTag>
        </Link>
      ) : (
        <HeaderTag styleName={`headline ${textColor}`}>
          {enableLiveIcon && <LiveIcon />}
          {headline}
        </HeaderTag>
      )}
    </div>
  );
};

Headline.propTypes = {
  /** The Story Object from the API response */
  story: PropTypes.object.isRequired,
  /** Header tags ranging h1-h6, where h[headerLevel] */
  headerLevel: PropTypes.string,
  premiumStoryIconConfig: PropTypes.shape({
    iconColor: PropTypes.string,
    iconType: PropTypes.string,
    enablePremiumStoryIcon: PropTypes.bool
  }),
  isLink: PropTypes.bool
};

Headline.defaultProps = {
  headerLevel: "6",
  isLink: true
};
