import PropTypes from "prop-types";
import React from "react";
import { useSelector } from "react-redux";
import kebabCase from "lodash.kebabcase";
import { StateProvider } from "../../../SharedContext";
import { StoryTemplate } from "./templates";
import get from "lodash/get";
import "./text-story.m.css";

const TextStoryTemplate = ({
  story = {},
  config = {},
  storyElementsConfig,
  adComponent,
  widgetComp,
  firstChild,
  secondChild,
  enableDarkMode,
  loadRelatedStories,
  visibleCardsRender,
  hasAccess,
}) => {
  const {
    theme = "",
    templateType = "default",
    imageRender = "fullBleed",
    sort = "headline-first",
    verticalShare = ""
  } = config;
  const sortOption = templateType === "hero-vertical-priority" ? sort : "";
  const supportImageType = {
    default: imageRender,
    "hero-priority-center": imageRender,
    "headline-hero-priority": imageRender,
    "hero-vertical-priority": imageRender
  };

  const qtState = useSelector((state) => get(state, ["qt"], {}));
  const timezone = get(qtState, ["data", "timezone"], null);
  const mountAt = get(qtState, ["config", "mountAt"], "");

  const dataTestId = supportImageType[templateType]
    ? `text-story-${templateType}-${kebabCase(supportImageType[templateType])}`
    : `text-story-${templateType}`;
  return (
    <div
      data-test-id={dataTestId}
      className="arrow-component arr-story-grid arr--content-wrapper arr--text-story-template-wrapper"
      styleName={`${templateType} ${verticalShare} ${supportImageType[templateType] || ""} ${sortOption}`}
      style={{ backgroundColor: theme || "initial" }}>
      <StoryTemplate
        story={story}
        config={config}
        storyElementsConfig={storyElementsConfig}
        adComponent={adComponent}
        widgetComp={widgetComp}
        firstChild={firstChild}
        secondChild={secondChild}
        timezone={timezone}
        enableDarkMode={enableDarkMode}
        mountAt={mountAt}
        loadRelatedStories={loadRelatedStories}
        visibleCardsRender={visibleCardsRender}
        storyAccess={story.access}
        hasAccess={hasAccess}
      />
    </div>
  );
};

TextStoryTemplate.propTypes = {
  story: PropTypes.object,
  accessLoading: PropTypes.bool,
  config: PropTypes.shape({
    templateType: PropTypes.string,
    authorCard: PropTypes.object,
    asideCollection: PropTypes.object
  }),
  firstChild: PropTypes.node,
  secondChild: PropTypes.node,
  storyElementsConfig: PropTypes.object,
  adComponent: PropTypes.func,
  widgetComp: PropTypes.func,
  enableDarkMode: PropTypes.bool,
  mountAt: PropTypes.string,
  loadRelatedStories: PropTypes.func,
  visibleCardsRender: PropTypes.func | undefined,
  hasAccess: PropTypes.bool,
};

export default StateProvider(TextStoryTemplate);
