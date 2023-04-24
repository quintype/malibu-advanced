import React, { useEffect, useState } from "react";
import TextStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/TextStoryTemplates";
import { object, func } from "prop-types";

const TextStory = ({ story, config, adWidget, adPlaceholder, checkAccess }) => {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    if (global.Accesstype) {
      checkAccess(story.id).then((res) => {
        const { granted } = res[story.id];
        console.log("Granted in text story --->", granted);
        setHasAccess(granted);
      });
    } else {
      console.log("Accesstype not found");
    }
  }, []);

  const templateSpecific = {};
  return (
    <TextStoryTemplate
      story={story}
      config={{ ...config, ...templateSpecific }}
      adComponent={adWidget}
      widgetComp={adWidget}
      firstChild={adPlaceholder}
      secondChild={adPlaceholder}
      hasAccess={hasAccess}
    />
  );
};

TextStory.propTypes = {
  story: object,
  config: object,
  adWidget: func,
  adPlaceholder: object,
  checkAccess: func,
};

export default TextStory;
