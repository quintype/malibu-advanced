import React from "react";
import LiveBlogStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/LiveBlogStoryTemplates";
import { object, func } from "prop-types";

const LiveBlogStory = ({ story, config, adWidget, adPlaceholder }) => {
  const templateSpecific = {}; // { templateType: "hero-priority", authorDetails: { template: "centerAligned" } };

  return (
    <LiveBlogStoryTemplate
      story={story}
      config={{ ...config, ...templateSpecific }}
      adComponent={adWidget}
      widgetComp={adWidget}
      firstChild={adPlaceholder}
      secondChild={adPlaceholder}
    />
  );
};

LiveBlogStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  adPlaceholder: object,
};

export default LiveBlogStory;
