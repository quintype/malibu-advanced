import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import get from "lodash.get";
import { LiveBlogStoryTemplates } from "./templates";
import { StateProvider } from "../../../SharedContext";
import "./live-blog.m.css";

const LiveBlogStoryTemplate = ({
  storyAccess = null,
  story = {},
  config = {},
  storyElementsConfig,
  adComponent,
  widgetComp,
  firstChild,
  secondChild,
  enableDarkMode,
  loadRelatedStories,
  visibleCardsRender = null,
  meteringIndicator,
}) => {
  const { theme = "", templateType = "default", verticalShare = "" } = config;

  const containerClass = templateType !== "hero-overlay" ? "container" : "";
  const qtState = useSelector((state) => get(state, ["qt"], {}));
  const timezone = get(qtState, ["data", "timezone"], null);
  const mountAt = get(qtState, ["config", "mountAt"], "");

  return (
    <div
      data-test-id={`live-blog-${templateType}`}
      className={`arrow-component arr--content-wrapper arr-story-grid arr--live-blog-story-template-wrapper ${templateType}`}
      style={{ backgroundColor: theme || "initial" }}
      styleName={`${containerClass} ${verticalShare} wrapper`}
    >
      <LiveBlogStoryTemplates
        storyAccess={storyAccess}
        templateType={templateType}
        story={story}
        storyElementsConfig={storyElementsConfig}
        config={config}
        adComponent={adComponent}
        widgetComp={widgetComp}
        firstChild={firstChild}
        secondChild={secondChild}
        timezone={timezone}
        enableDarkMode={enableDarkMode}
        mountAt={mountAt}
        loadRelatedStories={loadRelatedStories}
        visibleCardsRender={visibleCardsRender}
        meteringIndicator={meteringIndicator}
      />
    </div>
  );
};

LiveBlogStoryTemplate.propTypes = {
  story: PropTypes.object,
  storyAccess: PropTypes.object,
  config: PropTypes.shape({
    templateType: PropTypes.string,
  }),
  firstChild: PropTypes.node,
  secondChild: PropTypes.node,
  storyElementsConfig: PropTypes.object,
  adComponent: PropTypes.func,
  widgetComp: PropTypes.func,
  enableDarkMode: PropTypes.bool,
  loadRelatedStories: PropTypes.func,
  visibleCardsRender: PropTypes.func | undefined,
  meteringIndicator: PropTypes.node | undefined,
};

export default StateProvider(LiveBlogStoryTemplate);
