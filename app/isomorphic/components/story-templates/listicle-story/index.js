import React from "react";
import ListicleStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/ListicleStoryTemplates";
import { object, func } from "prop-types";

const ListicleStory = ({ story, config, adWidget, adPlaceholder }) => {
  const templateSpecific = {
    templateType: "headline-sideway",
    showSection: true,
    publishedDetails: {
      enablePublishedTime: true,
      enableUpdatedTime: true,
      showReadTime: true,
    },
  };
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
  config: object,
  adWidget: func,
  adPlaceholder: object,
};

export default ListicleStory;
