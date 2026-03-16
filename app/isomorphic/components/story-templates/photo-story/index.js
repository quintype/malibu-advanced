import React from "react";
import { PhotoStoryTemplates as PhotoStoryTemplate } from "@quintype/arrow";
import { object, func, node } from "prop-types";

const PhotoStory = ({ story, config, adWidget, widgetComp, secondChild, adPlaceholder, hasAccess }) => {
  const templateSpecific = {
    templateType: "hero-priority-center",
    showSection: false,
  };
  return (
    <PhotoStoryTemplate
      story={story}
      config={{ ...config, ...templateSpecific }}
      adComponent={adWidget}
      widgetComp={widgetComp || adWidget}
      firstChild={adPlaceholder}
      secondChild={secondChild !== undefined ? secondChild : adPlaceholder}
      hasAccess={hasAccess}
    />
  );
};

PhotoStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  widgetComp: func,
  secondChild: node,
  adPlaceholder: node,
  hasAccess: func,
};

export default PhotoStory;
