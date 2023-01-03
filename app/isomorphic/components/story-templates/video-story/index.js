import React from "react";
import VideoStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/VideoStoryTemplates";
import { object, func } from "prop-types";

const VideoStory = ({ story, config, adWidget, adPlaceholder }) => {
  const templateSpecific = {}; // {templateType: "headline-priority", authorDetails: { template: "centerAligned" } };

  return (
    <VideoStoryTemplate
      story={story}
      config={{ ...config, ...templateSpecific }}
      adComponent={adWidget}
      widgetComp={adWidget}
      firstChild={adPlaceholder}
      secondChild={adPlaceholder}
    />
  );
};

VideoStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  adPlaceholder: object,
};

export default VideoStory;
