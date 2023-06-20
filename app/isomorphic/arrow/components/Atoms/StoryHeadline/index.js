import React from "react";
import PropTypes from "prop-types";
import get from "lodash.get";
import { useStateValue } from "../../SharedContext";
import { getTextColor } from "../../../utils/utils";

import "./story-headline.m.css";
import { PremiumStoryIcon } from "../PremiumStoryIcon";

export const StoryHeadline = ({ story, premiumStoryIconConfig = {} }) => {
  const config = useStateValue() || {};
  const textColor = getTextColor(config.theme);
  const { iconColor = "#F7B500", iconStyle = "star", enablePremiumStoryIcon = false } = premiumStoryIconConfig;
  const premiumStory = enablePremiumStoryIcon && get(story, ["access"]) === "subscription";
  const wrapperClass = premiumStory ? "premium-wrapper" : "wrapper";
  const iconSize = "40px";
  return (
    <div className="arrow-component arr--story-headline" styleName={wrapperClass}>
      {premiumStory && (
        <PremiumStoryIcon width={iconSize} height={iconSize} color={iconColor} iconType={iconStyle} positionTop="6px" />
      )}
      <h1 data-testid="story-headline" className="arr--story--headline-h1" styleName={`headline ${textColor}`}>
        <bdi dangerouslySetInnerHTML={{ __html: story.headline }} />
      </h1>
    </div>
  );
};

StoryHeadline.propTypes = {
  story: PropTypes.object.isRequired,
  premiumStoryIconConfig: PropTypes.shape({
    iconColor: PropTypes.string,
    iconType: PropTypes.string,
    enablePremiumStoryIcon: PropTypes.bool
  })
};
