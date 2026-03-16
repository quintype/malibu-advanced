import React from "react";
import { LiveBlogStoryTemplate } from "@quintype/arrow";
import { object, func, node } from "prop-types";

const LiveBlogStory = ({ story, config, adWidget, widgetComp, secondChild, adPlaceholder, hasAccess }) => {
  const templateSpecific = { templateType: "hero-overlay", showSection: false };

  return (
    <LiveBlogStoryTemplate
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

LiveBlogStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  widgetComp: func,
  secondChild: node,
  adPlaceholder: node,
  hasAccess: func,
};

export default LiveBlogStory;
