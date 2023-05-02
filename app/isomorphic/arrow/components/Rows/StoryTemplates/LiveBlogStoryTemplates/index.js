/* eslint-disable max-len */
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import get from "lodash/get";
import { LiveBlogStoryTemplates } from "./templates";
import { StateProvider } from "../../../SharedContext";
import "./live-blog.m.css";

const LiveBlogStoryTemplate = ({
  story = {},
  config = {},
  storyElementsConfig,
  adComponent,
  widgetComp,
  firstChild,
  secondChild,
  initAccessType,
  checkAccess,
}) => {
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    initAccessType(() => {
      checkAccess(story.id).then((res) => {
        const { granted } = res[story.id];
        console.log("Access granted value in LiveBlogStoryTemplate --->", granted);
        setHasAccess(granted);
      });
    });
  }, []);
  const { theme = "", templateType = "default", verticalShare = "" } = config;

  const containerClass = templateType !== "hero-overlay" ? "container" : "";
  const timezone = useSelector((state) => get(state, ["qt", "data", "timezone"], null));

  return (
    <div
      data-test-id={`live-blog-${templateType}`}
      className={`arrow-component arr--content-wrapper arr-story-grid arr--live-blog-story-template-wrapper ${templateType}`}
      style={{ backgroundColor: theme }}
      styleName={`${containerClass} ${verticalShare} wrapper`}
    >
      <LiveBlogStoryTemplates
        templateType={templateType}
        story={story}
        storyElementsConfig={storyElementsConfig}
        config={config}
        adComponent={adComponent}
        widgetComp={widgetComp}
        firstChild={firstChild}
        secondChild={secondChild}
        timezone={timezone}
        hasAccess={hasAccess}
      />
    </div>
  );
};

LiveBlogStoryTemplate.propTypes = {
  story: PropTypes.object,
  config: PropTypes.shape({
    templateType: PropTypes.string,
  }),
  firstChild: PropTypes.node,
  secondChild: PropTypes.node,
  storyElementsConfig: PropTypes.object,
  adComponent: PropTypes.func,
  widgetComp: PropTypes.func,
  initAccessType: PropTypes.func,
  checkAccess: PropTypes.func,
};

export default StateProvider(LiveBlogStoryTemplate);
