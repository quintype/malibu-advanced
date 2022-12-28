import React from "react";
import TextStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/TextStoryTemplates";
import { object } from "prop-types";
import { AdPlaceholder } from "../../../arrow/components/Atoms/AdPlaceholder";

const TextStory = ({ story, config }) => {
  const templateSpecific = {};
  // {templateType: "hero-vertical-priority", authorDetails: { template: "centerAligned" } };
  const adWidget = () => {
    return <AdPlaceholder height="250px" width="300px" />;
  };

  return (
    <TextStoryTemplate
      story={story}
      config={{ ...config, ...templateSpecific }}
      adComponent={adWidget}
      widgetComp={adWidget}
      firstChild={<AdPlaceholder height="250px" width="300px" />}
      secondChild={<AdPlaceholder height="250px" width="300px" />}
    />
  );
};

TextStory.propTypes = {
  story: object,
  config: object,
};

export default TextStory;
