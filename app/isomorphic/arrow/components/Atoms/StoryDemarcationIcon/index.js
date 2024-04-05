import React from "react";
import PropTypes from "prop-types";
import { PhotoIcon1, PhotoIcon2, PhotoIcon3, PhotoIcon4 } from "../../Svgs/photo-icons";
import { VideoIcon1, VideoIcon2, VideoIcon3, VideoIcon4, VideoIcon5 } from "../../Svgs/video-icons";
import { VisualStoryIcon1, VisualStoryIcon2, VisualStoryIcon3, VisualStoryIcon4 } from "../../Svgs/visual-story-icons";

function PhotoDemarcationIcon({ iconConfig, enableDarkMode, iconColor, darkIconColor }) {
  const { enablePhotoDemarcationIcon = false, iconStyle } = iconConfig || {};
  if (!enablePhotoDemarcationIcon) return <></>;

  const iconBackground = enableDarkMode ? darkIconColor || "#000000" : iconColor || "#ffffff";
  switch (iconStyle) {
    case "photoIcon2":
      return <PhotoIcon2 background={iconBackground} />;
    case "photoIcon3":
      return <PhotoIcon3 background={iconBackground} />;
    case "photoIcon4":
      return <PhotoIcon4 background={iconBackground} />;
    default:
      return <PhotoIcon1 background={iconBackground} />;
  }
}

function VideoDemarcationIcon({ iconConfig, enableDarkMode, iconColor, darkIconColor }) {
  const { enableVideoDemarcationIcon = false, iconStyle } = iconConfig || {};
  if (!enableVideoDemarcationIcon) return <></>;

  const iconBackground = enableDarkMode ? darkIconColor || "#000000" : iconColor || "#ffffff";
  switch (iconStyle) {
    case "videoIcon2":
      return <VideoIcon2 background={iconBackground} />;
    case "videoIcon3":
      return <VideoIcon3 background={iconBackground} />;
    case "videoIcon4":
      return <VideoIcon4 background={iconBackground} />;
    case "videoIcon5":
      return <VideoIcon5 background={iconBackground} />;
    default:
      return <VideoIcon1 background={iconBackground} />;
  }
}

function VisualStoryDemarcationIcon({ iconConfig, enableDarkMode, iconColor, darkIconColor }) {
  const { enableVisualStoryDemarcationIcon = false, iconStyle } = iconConfig || {};
  if (!enableVisualStoryDemarcationIcon) return <></>;

  const iconBackground = enableDarkMode ? darkIconColor || "#000000" : iconColor || "#ffffff";
  switch (iconStyle) {
    case "visualStoryIcon2":
      return <VisualStoryIcon2 background={iconBackground} />;
    case "visualStoryIcon3":
      return <VisualStoryIcon3 background={iconBackground} />;
    case "visualStoryIcon4":
      return <VisualStoryIcon4 background={iconBackground} />;
    default:
      return <VisualStoryIcon1 background={iconBackground} />;
  }
}

export function StoryDemarcationIcon({ storyTemplate, rowsConfig = {}, enableDarkMode }) {
  const {
    photoDemarcationIcon = {},
    videoDemarcationIcon = {},
    visualStoryDemarcationIcon = {},
    iconColor,
    darkIconColor
  } = rowsConfig || {};

  switch (storyTemplate) {
    case "photo":
      return (
        <PhotoDemarcationIcon
          iconConfig={photoDemarcationIcon}
          enableDarkMode={enableDarkMode}
          iconColor={iconColor}
          darkIconColor={darkIconColor}
        />
      );
    case "video":
      return (
        <VideoDemarcationIcon
          iconConfig={videoDemarcationIcon}
          enableDarkMode={enableDarkMode}
          iconColor={iconColor}
          darkIconColor={darkIconColor}
        />
      );
    case "visual-story":
      return (
        <VisualStoryDemarcationIcon
          iconConfig={visualStoryDemarcationIcon}
          enableDarkMode={enableDarkMode}
          iconColor={iconColor}
          darkIconColor={darkIconColor}
        />
      );
    default:
      return <></>;
  }
}

StoryDemarcationIcon.propTypes = {
  storyTemplate: PropTypes.string,
  rowsConfig: PropTypes.object,
  enableDarkMode: PropTypes.bool
};

VideoDemarcationIcon.propTypes = {
  iconConfig: PropTypes.object,
  enableDarkMode: PropTypes.bool,
  iconColor: PropTypes.string,
  darkIconColor: PropTypes.string
};

VisualStoryDemarcationIcon.propTypes = {
  iconConfig: PropTypes.object,
  enableDarkMode: PropTypes.bool,
  iconColor: PropTypes.string,
  darkIconColor: PropTypes.string
};

PhotoDemarcationIcon.propTypes = {
  iconConfig: PropTypes.object,
  enableDarkMode: PropTypes.bool,
  iconColor: PropTypes.string,
  darkIconColor: PropTypes.string
};
