import React from "react";
import LiveBlogStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/LiveBlogStoryTemplates";
import { object, func } from "prop-types";

const LiveBlogStory = ({ story, config, adWidget, adPlaceholder, initAccessType, checkAccess }) => {
  const templateSpecific = { templateType: "hero-overlay", showSection: false };

  return (
    <LiveBlogStoryTemplate
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

LiveBlogStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  adPlaceholder: object,
  initAccessType: func,
  checkAccess: func,
};

export default LiveBlogStory;
