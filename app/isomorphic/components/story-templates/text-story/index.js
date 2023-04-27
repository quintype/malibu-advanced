import React from "react";
import TextStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/TextStoryTemplates";
import { object, func } from "prop-types";

const TextStory = ({ story, config, adWidget, adPlaceholder, initAccessType, checkAccess }) => {
  const templateSpecific = {};
  return (
    <TextStoryTemplate
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

TextStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  adPlaceholder: object,
  initAccessType: func,
  checkAccess: func,
};

export default TextStory;
