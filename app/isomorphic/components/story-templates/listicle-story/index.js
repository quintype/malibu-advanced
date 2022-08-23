import React from "react";
import ListicleStoryTemplate from "../../../arrow/components/Rows/StoryTemplates/ListicleStoryTemplates";
import { object } from "prop-types";

const ListicleStory = ({ story }) => {
  return <ListicleStoryTemplate story={story} />;
};

ListicleStory.propTypes = {
  story: object,
};

export default ListicleStory;
