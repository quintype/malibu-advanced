import React from "react";
import PropTypes from "prop-types";
import { CrownIcon } from "../../Svgs/crown";
import { KeyIcon } from "../../Svgs/key";
import { LockIcon } from "../../Svgs/lock";
import { StarIcon } from "../../Svgs/star";

export const PremiumStoryIcon = ({ width, height, color, iconType, positionTop }) => {
  switch (iconType) {
    case "crown":
      return <CrownIcon width={width} height={height} color={color} positionTop={positionTop} />;
    case "lock":
      return <LockIcon width={width} height={height} color={color} positionTop={positionTop} />;
    case "key":
      return <KeyIcon width={width} height={height} color={color} positionTop={positionTop} />;
    default:
      return <StarIcon width={width} height={height} color={color} positionTop={positionTop} />;
  }
};

PremiumStoryIcon.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  color: PropTypes.string,
  iconType: PropTypes.string,
  positionTop: PropTypes.string
};
