import React from "react";
import ListicleStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/ListicleStoryTemplates";
import { object, func } from "prop-types";

const ListicleStory = ({ story, config, adWidget, adPlaceholder, initAccessType, checkAccess }) => {
  const templateSpecific = { templateType: "headline-sideway" };

  return (
    <ListicleStoryTemplate
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

ListicleStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  adPlaceholder: object,
  initAccessType: func,
  checkAccess: func,
};

export default ListicleStory;
