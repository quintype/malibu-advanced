import React from "react";
import LiveBlogStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/LiveBlogStoryTemplates";
import { object } from "prop-types";
import { AdPlaceholder } from "../../../arrow/components/Atoms/AdPlaceholder";

const LiveBlogStory = ({ story, config }) => {
  const templateSpecific = {};
  // { templateType: "headline-sideway", authorDetails: { template: "centerAligned" } };
  const adWidget = () => {
    return <AdPlaceholder height="250px" width="300px" />;
  };
  return (
    <LiveBlogStoryTemplate
      story={story}
      config={{ config, ...templateSpecific }}
      adComponent={adWidget}
      widgetComp={adWidget}
      firstChild={<AdPlaceholder height="250px" width="300px" />}
      secondChild={<AdPlaceholder height="250px" width="300px" />}
    />
  );
};

LiveBlogStory.propTypes = {
  story: object,
};

export default LiveBlogStory;
