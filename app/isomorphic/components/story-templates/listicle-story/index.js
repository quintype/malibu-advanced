import React from "react";
import ListicleStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/ListicleStoryTemplates";
import { object } from "prop-types";

const ListicleStory = ({ story, config, adWidget, adPlaceholder }) => {
  const templateSpecific = {}; // { templateType: "headline-hero-priority", authorDetails: { template: "centerAligned" } };

  return (
    <ListicleStoryTemplate
      story={story}
      config={{ ...config, ...templateSpecific }}
      adComponent={adWidget}
      widgetComp={adWidget}
      firstChild={adPlaceholder}
      secondChild={adPlaceholder}
    />
  );
};

ListicleStory.propTypes = {
  story: object,
};

export default ListicleStory;
