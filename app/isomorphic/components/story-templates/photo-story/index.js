import React from "react";
import PhotoStoryTemplates from "../../../arrow/components/Rows/StoryTemplates/PhotoStoryTemplates";
import { object, func } from "prop-types";

const PhotoStory = ({ story, config, adWidget, adPlaceholder }) => {
  const templateSpecific = {
    templateType: "hero-priority-center",
    showSection: false,
  };
  return (
    <PhotoStoryTemplates
      story={story}
      config={{ ...config, ...templateSpecific }}
      adComponent={adWidget}
      widgetComp={adWidget}
      firstChild={adPlaceholder}
      secondChild={adPlaceholder}
    />
  );
};

PhotoStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  adPlaceholder: object,
};

export default PhotoStory;
