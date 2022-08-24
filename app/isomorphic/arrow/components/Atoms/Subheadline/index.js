import React from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import { useStateValue } from "../../SharedContext";

import { getTextColor, truncate } from "../../../utils/utils";

import "./subheadline.m.css";

// either truncate or line clamp should be used
export const Subheadline = ({
  story,
  truncateChars = 200,
  lineClamp,
  clazzName = "",
  forceShowAtom,
  showFullContent
}) => {
  const config = useStateValue() || {};
  const subheadline = forceShowAtom || get(config, ["showSubheadline"], true);
  if (!subheadline) return null;
  const textColor = getTextColor(config.theme);

  return (
    <div
      className={`p-alt arr--sub-headline arrow-component ${clazzName}`}
      style={{
        WebkitLineClamp: lineClamp
      }}
      styleName={`subheadline ${textColor}`}
      data-test-id="subheadline">
      {showFullContent || typeof lineClamp === "number"
        ? story.subheadline
        : truncate(story.subheadline, truncateChars, true)}
    </div>
  );
};

Subheadline.propTypes = {
  /** The Story Object from the API response */
  story: PropTypes.object.isRequired,
  //  Restricts the number of lines for subheadline.
  lineClamp: PropTypes.number,
  /** Number of characters to truncate the subheadline */
  truncateChars: PropTypes.number,
  clazzName: PropTypes.string,
  forceShowAtom: PropTypes.bool,
  showFullContent: PropTypes.bool
};

Subheadline.defaultProps = {
  forceShowAtom: false,
  showFullContent: false
};
