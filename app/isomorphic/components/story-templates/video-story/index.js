import React from "react";
import VideoStoryTemplatex from "../../../arrow/components/Rows/StoryTemplates/VideoStoryTemplates";
import { object } from "prop-types";

const VideoStory = ({ story }) => {
  return <VideoStoryTemplate story={story} />;
};

VideoStory.propTypes = {
  story: object,
};

export default VideoStory;
