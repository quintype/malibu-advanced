import React from "react";
import { ListicleStoryTemplate } from "@quintype/arrow";
import { object, func, node } from "prop-types";

const ListicleStory = ({ story, config, adWidget, widgetComp, secondChild, adPlaceholder, hasAccess }) => {
  const templateSpecific = { templateType: "headline-sideway" };

  return (
    <ListicleStoryTemplate
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

ListicleStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  widgetComp: func,
  secondChild: node,
  adPlaceholder: node,
  hasAccess: func,
};

export default ListicleStory;
