import React from "react";
import get from "lodash.get";
import { useSelector } from "react-redux";
import { useStateValue } from "../../SharedContext";
import { formatter, getStoryTemplate, getTextColor, getTimeStamp } from "../../../utils/utils";
import PropTypes from "prop-types";
import "./timestamp.m.css";

const timeMapping = {
  published: "first-published-at",
  updated: "last-published-at"
};

export const TimeStamp = ({ story, config = {} }) => {
  const configState = useStateValue() || {};
  const isTime = get(config, ["showTime"], get(configState, ["showTime"], true));
  let time = story["first-published-at"] || story["last-published-at"];
  const textColor = getTextColor(configState.theme);
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const isLocalizedNumber = get(qtConfig, ["isLocalizedNumber"], false);

  const languageCode = get(qtConfig, ["language", "ietf-code"], "en");

  const storyCardTime = get(qtConfig, ["pagebuilder-config", "general", "storyCardTime"], null);
  const storyTemplate = getStoryTemplate(story, get(qtConfig, ["pagebuilder-config"], {}));

  if (storyCardTime) {
    const storyTime = storyTemplate === "live-blog" ? storyCardTime["liveBlog"] : storyCardTime["rest"];
    if (storyTime) {
      const mappedTime = timeMapping[storyTime];
      time = story[mappedTime] || time;
    }
  }
  const timeAgoFormat = get(
    qtConfig,
    ["pagebuilder-config", "general", "timeAgoFormat"],
    get(configState, ["timeAgoFormat"], "time unit ago")
  );

  return (
    <>
      {isTime && (
        <div className="time arr--publish-time" styleName={`time ${textColor}`} data-test-id="publish-time">
          <div>{getTimeStamp(time, formatter, config, languageCode, "", "", isLocalizedNumber, timeAgoFormat)}</div>
        </div>
      )}
    </>
  );
};

TimeStamp.propTypes = {
  /** The Story Object from the API response */
  story: PropTypes.object,
  config: PropTypes.object
};
