import React from "react";
import { StoryElement as QTCStoryElement } from "@quintype/components";
import PropTypes from "prop-types";
import { withElementWrapper } from "../withElementWrapper";
import { shapeStory, shapeConfig } from "../../../../utils/utils";
import "./storyElement.m.css";

const StoryElementBase = ({ element, story = {}, config = {}, ...restProps }) => {
  if (element.type === "title" && element.hasDashedBullet) {
    return (
      <div data-test-id="story-elements">
        <div className="story-element story-element-title">
          <h2>
            <div styleName="bullet-style-dash"></div>
            {element.text}
          </h2>
        </div>
      </div>
    );
  }

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
  config: shapeConfig,
};
