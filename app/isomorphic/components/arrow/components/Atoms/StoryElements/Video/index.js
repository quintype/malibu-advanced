import React from "react";
import { StoryElement } from "@quintype/components";
import PropTypes from "prop-types";
import { withElementWrapper } from "../withElementWrapper";
import { shapeStory, shapeConfig } from "../../../../utils/utils";
import "./video.m.css";

const Videobase = ({ element, story = {}, config = {}, loadIframeOnClick = false, ...restProps }) => {
  return (
    <div styleName="container" {...restProps} data-test-id="video">
      <StoryElement element={element} loadIframeOnClick={loadIframeOnClick} />
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
