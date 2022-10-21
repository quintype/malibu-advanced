import React from "react";
import LiveBlogStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/LiveBlogStoryTemplates";
import { object } from "prop-types";

const LiveBlogStory = ({ story }) => {
  return <LiveBlogStoryTemplate story={story} />;
};

LiveBlogStory.propTypes = {
  story: object,
};

export default React.memo(LiveBlogStory);
