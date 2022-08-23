import React from "react";
import PhotoStoryTemplates from "../../../arrow/components/Rows/StoryTemplates/PhotoStoryTemplates";
import { object } from "prop-types";

const PhotoStory = ({ story }) => {
  return <PhotoStoryTemplates story={story} />;
};

PhotoStory.propTypes = {
  story: object,
};

export default PhotoStory;
