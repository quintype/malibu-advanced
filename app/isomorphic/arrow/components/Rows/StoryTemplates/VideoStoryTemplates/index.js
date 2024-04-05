import { SocialShare } from "@quintype/components";
import PropTypes from "prop-types";
import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import get from "lodash.get";
import { SocialShareTemplate } from "../../../Molecules/SocialShareTemplate";
import { SectionTag } from "../../../Atoms/SectionTag";
import { StoryHeadline } from "../../../Atoms/StoryHeadline";
import { Subheadline } from "../../../Atoms/Subheadline";
import { Video } from "../../../Atoms/StoryElements/Video";
import AsideCollection from "../../AsideCollection";
import { AuthorCard } from "../../../Atoms/AuthorCard";
import { PublishDetails } from "../../../Atoms/PublishDetail";
import { StoryTags } from "../../../Atoms/StoryTags";
import { StoryReview } from "../../../Atoms/StoryReview";
import { StoryElementCard, SlotAfterStory } from "../../../Molecules/StoryElementCard";
import { StateProvider } from "../../../SharedContext";
import "./video-story.m.css";

const VideoStoryTemplate = ({
  storyAccess = null,
  story = {},
  config = {},
  storyElementsConfig,
  widgetComp,
  adComponent,
  firstChild,
  secondChild,
  enableDarkMode,
  loadRelatedStories,
  visibleCardsRender = null,
  meteringIndicator,
}) => {
  const heroVideo =
    story.cards
      .flatMap((card) => card["story-elements"])
      .find(
        ({ type, subtype }) =>
          type === "youtube-video" ||
          (type === "jsembed" && (subtype === "dailymotion-video" || subtype === "dailymotion-embed-script")) ||
          subtype === "brightcove-video"
      ) || {};

  const {
    theme = "",
    authorCard = {},
    authorDetails = {},
    asideCollection = {},
    templateType = "",
    noOfVisibleCards = 0,
    publishedDetails = {},
    verticalShare = "",
    shareIconType = "plain-color-svg",
    premiumStoryIconConfig = {},
  } = config;

  const visibledCards = noOfVisibleCards < 0 ? story.cards : story.cards.slice(0, noOfVisibleCards);
  const storyId = get(story, ["id"], "");

  const qtState = useSelector((state) => get(state, ["qt"], {}));
  const timezone = get(qtState, ["data", "timezone"], null);
  const mountAt = get(qtState, ["config", "mountAt"], "");

  const HeroVideo = () => {
    const lazyLoad = get(storyElementsConfig, ["jsEmbed", "lazyLoad"], true);
    return (
      <div styleName="hero-video index-2" id={`video-${get(heroVideo, ["id"])}`}>
        <Video element={heroVideo} loadIframeOnClick={lazyLoad} />
      </div>
    );
  };

  const SocialShareComponent = () => {
    return (
      <div id={`story-share-${storyId}`} className="content-style">
        <SocialShare
          template={SocialShareTemplate}
          fullUrl={encodeURI(story.url)}
          title={story.headline}
          theme={theme}
          vertical={!!verticalShare}
          iconType={shareIconType}
          shareIconId={`share-icon-story-share-${storyId}`}
        />
      </div>
    );
  };

  const HeaderCard = () => {
    return (
      <div styleName="header-details">
        <SectionTag story={story} />
        <StoryHeadline story={story} premiumStoryIconConfig={premiumStoryIconConfig} />
        <Subheadline story={story} showFullContent />
      </div>
    );
  };

  const StoryData = () => {
    const visibleCards = visibledCards.map((card) => {
      return (
        <StoryElementCard
          heroVideoElementId={heroVideo.id}
          story={story}
          card={card}
          key={get(card, ["id"], "")}
          config={storyElementsConfig}
          adComponent={adComponent}
          widgetComp={widgetComp}
          enableDarkMode={enableDarkMode}
        />
      );
    });
    return (
      <div styleName="story-details">
        <div styleName="author">
          {authorCard && (
            <AuthorCard story={story} template={authorDetails.template} opts={authorDetails.opts} mountAt={mountAt} />
          )}
        </div>
        <div styleName="timestamp-social-share">
          <div id={`publish-details-container-${storyId}`}>
            <PublishDetails story={story} opts={publishedDetails} template="story" timezone={timezone} />
          </div>
          {!verticalShare && <SocialShareComponent />}
        </div>
        <StoryReview theme={theme} story={story} />
        {meteringIndicator}
        {visibleCardsRender ? (
          visibleCardsRender(visibleCards, firstChild, storyAccess)
        ) : (
          <>
            {visibleCards}
            {firstChild}
          </>
        )}
        <div styleName="story-tags">
          <StoryTags tags={story.tags} />
          {meteringIndicator}
          <SlotAfterStory
            id={story.id}
            element={story.customSlotAfterStory}
            AdComponent={adComponent}
            WidgetComp={widgetComp}
          />
        </div>
        {secondChild}
      </div>
    );
  };

  const SideColumn = () => {
    return (
      asideCollection && (
        <div styleName="video-story-side-column">
          <AsideCollection
            {...asideCollection}
            widgetComp={widgetComp}
            adComponent={adComponent}
            sticky={true}
            story={story}
            opts={publishedDetails}
            loadRelatedStories={loadRelatedStories}
          />
        </div>
      )
    );
  };

  // caching is done to avoid widget and Ad re-renderings
  const CachedSideColumn = useCallback(SideColumn, [templateType, story["story-template"]]);

  const heroPriorityTemplate = () => {
    return (
      <>
        <HeroVideo />
        <div styleName="story-content-wrapper">
          <HeaderCard />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        {asideCollection && (
          <div styleName="aside-collection tablet-index-2">
            <AsideCollection
              horizontal={true}
              {...asideCollection}
              widgetComp={widgetComp}
              adComponent={adComponent}
              story={story}
              opts={publishedDetails}
              loadRelatedStories={loadRelatedStories}
            />
          </div>
        )}
      </>
    );
  };

  const headlinePriorityTemplate = () => {
    return (
      <>
        <div styleName="story-content-wrapper">
          <HeaderCard />
        </div>
        <div styleName="story-content-wrapper index-2">
          <HeroVideo />
        </div>
        <div styleName="story-content-wrapper">
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <CachedSideColumn />
      </>
    );
  };

  const defaultTemplate = () => {
    return (
      <>
        <HeroVideo />
        <div styleName="story-content-wrapper">
          <HeaderCard />
          <StoryData />
        </div>

        {verticalShare && <SocialShareComponent />}
        <CachedSideColumn />
      </>
    );
  };

  const getStoryTemplate = (templateType) => {
    switch (templateType) {
      case "hero-priority":
        return heroPriorityTemplate();
      case "headline-priority":
        return headlinePriorityTemplate();
      default:
        return defaultTemplate();
    }
  };

  const templateClass = templateType && templateType !== "default" ? templateType : "default";
  const dataTestId = templateType ? `video-story-${templateType}` : "video-story";
  return (
    <div
      data-test-id={dataTestId}
      className="arrow-component arr--content-wrapper arr-story-grid arr--video-story-template-wrapper"
      styleName={`${templateClass} ${verticalShare}`}
      style={{ backgroundColor: theme || "initial" }}
    >
      {getStoryTemplate(templateType)}
    </div>
  );
};

VideoStoryTemplate.propTypes = {
  storyAccess: PropTypes.object,
  story: PropTypes.object,
  accessLoading: PropTypes.bool,
  config: PropTypes.shape({
    templateType: PropTypes.string,
    authorCard: PropTypes.object,
    asideCollection: PropTypes.object,
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

export default StateProvider(VideoStoryTemplate);
