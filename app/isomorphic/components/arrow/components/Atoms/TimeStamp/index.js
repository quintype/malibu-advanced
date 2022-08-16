import React from "react";
import get from "lodash.get";
import { useSelector } from "react-redux";
import { useStateValue } from "../../SharedContext";
import { formatter, getTextColor, getTimeStamp } from "../../../utils/utils";
import PropTypes from "prop-types";
import "./timestamp.m.css";

export const TimeStamp = ({ story, isBottom, config = {} }) => {
  const configState = useStateValue() || {};
  const isTime = get(config, ["showTime"], get(configState, ["showTime"], true));
  const time = story["last-published-at"] || story["first-published-at"];
  const isBottomClasses = isBottom ? "bottom-fix" : "";
  const textColor = getTextColor(configState.theme);
  const isLocalizedNumber = useSelector((state) => get(state, ["qt", "config", "isLocalizedNumber"], false));
  const languageCode = isLocalizedNumber
    ? useSelector((state) => get(state, ["qt", "config", "language", "ietf-code"], "en"))
    : "en";

  return (
    <>
      {isTime && (
        <div
          className="time arr--publish-time"
          styleName={`time  ${textColor} ${isBottomClasses}`}
          data-test-id="publish-time">
          <div styleName="time-wrapper">{getTimeStamp(time, formatter, config, languageCode)}</div>
        </div>
      )}
    </>
  );
};

TimeStamp.propTypes = {
  /** The Story Object from the API response */
  story: PropTypes.object,
  isBottom: PropTypes.bool,
  config: PropTypes.object,
  languageCode: PropTypes.string
};
