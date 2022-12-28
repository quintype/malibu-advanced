import React from "react";
import PhotoStoryTemplates from "../../../arrow/components/Rows/StoryTemplates/PhotoStoryTemplates";
import { object } from "prop-types";
import { AdPlaceholder } from "../../../arrow/components/Atoms/AdPlaceholder";

const PhotoStory = ({ story, config }) => {
  const templateSpecific = {}; // {templateType: "hero-priority-center", authorDetails: { template: "centerAligned" } };
  const adWidget = () => {
    return <AdPlaceholder height="250px" width="300px" />;
  };
  return (
    <PhotoStoryTemplates
      story={story}
      config={{ ...config, ...templateSpecific }}
      adComponent={adWidget}
      widgetComp={adWidget}
      firstChild={<AdPlaceholder height="250px" width="300px" />}
      secondChild={<AdPlaceholder height="250px" width="300px" />}
    />
  );
};

PhotoStory.propTypes = {
  story: object,
};

export default PhotoStory;
