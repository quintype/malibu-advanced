import React from "react";
import PhotoStoryTemplates from "../../../arrow/components/Rows/StoryTemplates/PhotoStoryTemplates";
import { object } from "prop-types";

const PhotoStory = ({ story, config, adWidget, adPlaceholder }) => {
  const templateSpecific = {}; // {templateType: "hero-priority-center", authorDetails: { template: "centerAligned" } };

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
};

export default PhotoStory;
