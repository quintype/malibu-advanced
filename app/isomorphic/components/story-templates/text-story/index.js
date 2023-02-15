import React from "react";
import TextStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/TextStoryTemplates";
import { object, func } from "prop-types";

const TextStory = ({ story, config, adWidget, adPlaceholder }) => {
  const templateSpecific = { templateType: "hero-priority-center" };
  return (
    <TextStoryTemplate
      story={story}
      config={{ ...config, ...templateSpecific }}
      adComponent={adWidget}
      widgetComp={adWidget}
      firstChild={adPlaceholder}
      secondChild={adPlaceholder}
    />
  );
};

TextStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  adPlaceholder: object,
};

export default TextStory;
