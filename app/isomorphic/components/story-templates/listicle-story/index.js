import React from "react";
import ListicleStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/ListicleStoryTemplates";
import { object } from "prop-types";
import { AdPlaceholder } from "../../../arrow/components/Atoms/AdPlaceholder";

const ListicleStory = ({ story, config }) => {
  const templateSpecific = {}; // { templateType: "headline-hero-priority", authorDetails: { template: "centerAligned" } };
  const adWidget = () => {
    return <AdPlaceholder height="250px" width="300px" />;
  };
  return (
    <ListicleStoryTemplate
      story={story}
      config={{ config, ...templateSpecific }}
      adComponent={adWidget}
      widgetComp={adWidget}
      firstChild={<AdPlaceholder height="250px" width="300px" />}
      secondChild={<AdPlaceholder height="250px" width="300px" />}
    />
  );
};

ListicleStory.propTypes = {
  story: object,
};

export default ListicleStory;
