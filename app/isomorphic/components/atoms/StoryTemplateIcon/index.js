import React from "react";
import { string, object } from "prop-types";
import { SvgIconHandler } from "../../atoms/svg-icon-hadler";
import "./svg-icon-handler.m.css";

export const StoryTemplateIcon = ({ storyTemplate, iconSizes }) => {
  const { width, height } = iconSizes;

  switch (storyTemplate) {
    case "photo":
      return <SvgIconHandler styleName={`story-icon`} type="photo" height={height} width={width} />;
    case "video":
      return <SvgIconHandler styleName={`story-icon center`} type="video" height={height} width={width} />;
    case "listicle":
      return <SvgIconHandler styleName={`story-icon`} type="podcast" height={height} width={width} />;

    default:
      return null;
  }
};

StoryTemplateIcon.propTypes = {
  storyTemplate: string,
  iconSizes: object,
};
