import get from "lodash.get";
import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { getTextColor, getSeparator, getTheme } from "../../../utils/utils";
import { useStateValue } from "../../SharedContext";
import "./read-time.m.css";

export const ReadTime = ({ story, opts = {}, isLightTheme = false, layout, enableDarkModePreview = false }) => {
  const config = useStateValue() || {};
  const showReadTime = get(config, ["showReadTime"]) || get(opts, ["showReadTime"], true);
  const readTime = get(story, ["read-time"], 0);

  if (!showReadTime || !readTime) return null;
  const { showDotIndicator = true } = opts;
  const theme = getTheme(config, layout, enableDarkModePreview);
  const textColor = isLightTheme ? "light" : getTextColor(theme);
  const isLocalizedNumber = useSelector((state) => get(state, ["qt", "config", "isLocalizedNumber"], false));
  const languageCode = isLocalizedNumber
    ? useSelector((state) => get(state, ["qt", "config", "language", "ietf-code"], "en"))
    : "en";

  const timeToRead =
    get(opts, ["localizedTimeToRead"]) || get(opts, ["localizationConfig", "localizedTimeToRead"]) || "min read";
  const separator = get(opts, ["separator"], "");
  const separatorStyle = separator === "divider" ? "dash" : "dot";
  return (
    <>
      <div
        className="arrow-component arr--read-time"
        styleName={`read-time-wrapper ${textColor}`}
        data-test-id="read-time">
        {showDotIndicator && (
          <div styleName={separatorStyle} className="read-time-indicator">
            {getSeparator(separator, textColor)}
          </div>
        )}
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
  languageCode: PropTypes.string,
  layout: PropTypes.string,
  enableDarkModePreview: PropTypes.bool
};
