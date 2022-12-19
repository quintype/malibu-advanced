import React from "react";
import LiveBlogStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/LiveBlogStoryTemplates";
import { object } from "prop-types";

const LiveBlogStory = ({ story }) => {
  return (
    <LiveBlogStoryTemplate
      story={story}
      config={{ templateType: "hero-vertical-priority", authorDetails: { template: "centerAligned" } }}
    />
  );
};

LiveBlogStory.propTypes = {
  story: object,
};

export default React.memo(LiveBlogStory);
