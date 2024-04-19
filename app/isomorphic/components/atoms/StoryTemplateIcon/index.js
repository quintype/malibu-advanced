import React from "react";
import PropTypes from "prop-types";
import { SvgIconHandler } from "../../atoms/svg-icon-hadler";
import "./svg-icon-handler.m.css";

export const StoryTemplateIcon = ({ storyTemplate }) => {
  switch (storyTemplate) {
    case "photo":
      return <SvgIconHandler styleName={`story-icon`} type="photo" />;
    case "video":
      return <SvgIconHandler styleName={`story-icon center`} type="video" />;
    case "listicle":
      return <SvgIconHandler styleName={`story-icon`} type="podcast" />;

    default:
      return null;
  }
};

StoryTemplateIcon.propTypes = {
  storyTemplate: PropTypes.string,
};
