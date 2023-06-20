import React from "react";
import { StoryElement as QTCStoryElement } from "@quintype/components";
import PropTypes from "prop-types";
import { withElementWrapper } from "../withElementWrapper";
import { shapeStory, shapeConfig } from "../../../../utils/utils";

const StoryElementBase = ({ element, story = {}, config = {}, ...restProps }) => {
  return (
    <div {...restProps} data-test-id="story-elements">
      <QTCStoryElement element={element} />
    </div>
  );
};

export const StoryElement = withElementWrapper(StoryElementBase);

StoryElementBase.propTypes = {
  element: PropTypes.object,
  story: shapeStory,
  config: shapeConfig
};
