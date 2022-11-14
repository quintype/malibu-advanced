import React from "react";
import TextStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/TextStoryTemplates";
import { object } from "prop-types";

const TextStory = ({ story }) => {
  return <TextStoryTemplate story={story} />;
};

TextStory.propTypes = {
  story: object,
};

export default React.memo(TextStory);
