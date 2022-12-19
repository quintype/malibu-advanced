import React from "react";
import ListicleStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/ListicleStoryTemplates";
import { object } from "prop-types";

const ListicleStory = ({ story }) => {
  return (
    <ListicleStoryTemplate
      story={story}
      config={{ templateType: "hero-vertical-priority", authorDetails: { template: "centerAligned" } }}
    />
  );
};

ListicleStory.propTypes = {
  story: object,
};

export default React.memo(ListicleStory);
