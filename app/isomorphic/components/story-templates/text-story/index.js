import React from "react";
import TextStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/TextStoryTemplates";
import { object } from "prop-types";

const TextStory = ({ story, config, adWidget, adPlaceholder }) => {
  const templateSpecific = {};
  // {templateType: "hero-vertical-priority", authorDetails: { template: "centerAligned" } };

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
};

export default TextStory;
