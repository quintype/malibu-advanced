import React from "react";
import VideoStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/VideoStoryTemplates";
import { object } from "prop-types";

const VideoStory = ({ story }) => {
  return <VideoStoryTemplate story={story} />
};

VideoStory.propTypes = {
  story: object,
};

export default VideoStory;
