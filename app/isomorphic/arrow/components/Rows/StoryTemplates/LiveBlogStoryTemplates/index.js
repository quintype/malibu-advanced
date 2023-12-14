import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import get from "lodash.get";
import { LiveBlogStoryTemplates } from "./templates";
import { StateProvider } from "../../../SharedContext";
import "./live-blog.m.css";

const LiveBlogStoryTemplate = ({
  story = {},
  accessLoading = false,
  config = {},
  storyElementsConfig,
  adComponent,
  widgetComp,
  firstChild,
  secondChild,
  enableDarkMode,
  loadRelatedStories,
  visibleCardsRender = null,
  hasAccess,
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
      styleName={`${containerClass} ${verticalShare} wrapper`}>
      <LiveBlogStoryTemplates
        templateType={templateType}
        accessLoading={accessLoading}
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
        hasAccess={hasAccess}
      />
    </div>
  );
};

LiveBlogStoryTemplate.propTypes = {
  story: PropTypes.object,
  accessLoading: PropTypes.bool,
  config: PropTypes.shape({
    templateType: PropTypes.string
  }),
  firstChild: PropTypes.node,
  secondChild: PropTypes.node,
  storyElementsConfig: PropTypes.object,
  adComponent: PropTypes.func,
  widgetComp: PropTypes.func,
  enableDarkMode: PropTypes.bool,
  loadRelatedStories: PropTypes.func,
  visibleCardsRender: PropTypes.func | undefined,
  hasAccess: PropTypes.func,
};

export default StateProvider(LiveBlogStoryTemplate);
