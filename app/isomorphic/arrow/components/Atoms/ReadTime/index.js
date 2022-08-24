import get from "lodash/get";
import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { getTextColor } from "../../../utils/utils";
import { useStateValue } from "../../SharedContext";
import "./read-time.m.css";
import { Dot } from "../Dot/dot";

export const ReadTime = ({ story, opts = {}, isLightTheme = false }) => {
  const config = useStateValue() || {};
  const showReadTime = get(config, ["showReadTime"]) || get(opts, ["showReadTime"], true);
  const readTime = get(story, ["read-time"], 0);
  const textColor = isLightTheme ? "light" : getTextColor(config.theme);

  const isLocalizedNumber = useSelector((state) => get(state, ["qt", "config", "isLocalizedNumber"], false));
  const languageCode = isLocalizedNumber
    ? useSelector((state) => get(state, ["qt", "config", "language", "ietf-code"], "en"))
    : "en";

  if (!showReadTime || !readTime) return null;

  const timeToRead =
    get(opts, ["localizedTimeToRead"]) || get(opts, ["localizationConfig", "localizedTimeToRead"]) || "min read";

  return (
    <>
      <div
        className="arrow-component arr--read-time"
        styleName={`read-time-wrapper ${textColor}`}
        data-test-id="read-time">
        <span styleName="dot-indicator" className="read-time-indicator">
          <Dot color={textColor} />
        </span>
        <span>
          {readTime.toLocaleString(`${languageCode}`)} {timeToRead}
        </span>
      </div>
    </>
  );
};

ReadTime.propTypes = {
  story: PropTypes.shape({
    "read-time": PropTypes.number
  }),
  opts: PropTypes.shape({
    showReadTime: PropTypes.bool
  }),
  isLightTheme: PropTypes.bool,
  languageCode: PropTypes.string
};
