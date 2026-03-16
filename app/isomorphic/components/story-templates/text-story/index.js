import React from "react";
import { TextStoryTemplate } from "@quintype/arrow";
import { object, func, bool, node } from "prop-types";

const TextStory = ({ story, config, adWidget, widgetComp, secondChild, adPlaceholder, hasAccess }) => {
  const templateSpecific = {};
  return (
    <TextStoryTemplate
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

TextStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  widgetComp: func,
  secondChild: node,
  adPlaceholder: node,
  hasAccess: bool,
};

export default TextStory;
