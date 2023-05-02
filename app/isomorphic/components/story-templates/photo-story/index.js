import React from "react";
import PhotoStoryTemplates from "../../../arrow/components/Rows/StoryTemplates/PhotoStoryTemplates";
import { object, func } from "prop-types";

const PhotoStory = ({ story, config, adWidget, adPlaceholder, initAccessType, checkAccess }) => {
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
      initAccessType={initAccessType}
      checkAccess={checkAccess}
    />
  );
};

PhotoStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  adPlaceholder: object,
  initAccessType: func,
  checkAccess: func,
};

export default PhotoStory;
