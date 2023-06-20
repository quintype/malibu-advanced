import React from "react";
import { useSelector } from "react-redux";
import { StoryElement } from "@quintype/components";
import get from "lodash.get";
import PropTypes from "prop-types";
import { withElementWrapper } from "../withElementWrapper";
import { getTextColor, shapeStory, shapeConfig } from "../../../../utils/utils";
import { useStateValue } from "../../../SharedContext";
import "./video.m.css";

const Videobase = ({ element, story = {}, config = {}, loadIframeOnClick = false, ...restProps }) => {
  const configData = useStateValue() || {};
  const textInvertColor = getTextColor(configData.theme);
  const style =
    !loadIframeOnClick && (element.subtype === "dailymotion-video" || element.type === "youtube-video")
      ? "container wrapper"
      : "container";
  const renderElement = () => {
    if (element.subtype === "brightcove-video") {
      const policyKey = useSelector((state) => get(state, ["qt", "config", "brightcove", "policy-key"], ""));
      return <StoryElement element={element} loadIframeOnClick={loadIframeOnClick} policyKey={policyKey} />;
    } else {
      return <StoryElement element={element} loadIframeOnClick={loadIframeOnClick} />;
    }
  };

  return (
    <div styleName={`${style} ${textInvertColor}`} {...restProps} data-test-id="video">
      {renderElement()}
    </div>
  );
};

Videobase.propTypes = {
  element: PropTypes.object,
  story: shapeStory,
  config: shapeConfig,
  loadIframeOnClick: PropTypes.bool
};

export const Video = withElementWrapper(Videobase);
