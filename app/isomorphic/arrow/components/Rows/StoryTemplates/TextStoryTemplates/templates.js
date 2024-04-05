import React, { useCallback } from "react";
import get from "lodash.get";
import PropTypes from "prop-types";
import { SocialShareTemplate } from "../../../Molecules/SocialShareTemplate";
import { SocialShare } from "@quintype/components";
import { SectionTag } from "../../../Atoms/SectionTag";
import { StoryHeadline } from "../../../Atoms/StoryHeadline";
import { Subheadline } from "../../../Atoms/Subheadline";
import AsideCollection from "../../AsideCollection";
import { AuthorCard } from "../../../Atoms/AuthorCard";
import { CaptionAttribution } from "../../../Atoms/CaptionAttribution";
import { HeroImage } from "../../../Atoms/HeroImage";
import { PublishDetails } from "../../../Atoms/PublishDetail";
import { StoryTags } from "../../../Atoms/StoryTags";
import { StoryElementCard, SlotAfterStory } from "../../../Molecules/StoryElementCard";
import { StoryReview } from "../../../Atoms/StoryReview";
import "./text-story.m.css";

export const StoryTemplate = ({
  storyAccess = null,
  story = {},
  config = {},
  storyElementsConfig,
  widgetComp,
  adComponent,
  firstChild,
  secondChild,
  timezone,
  enableDarkMode,
  mountAt,
  loadRelatedStories,
  visibleCardsRender = null,
  meteringIndicator
}) => {
  const {
    theme = "",
    asideCollection = {},
    templateType = "default",
    noOfVisibleCards = 0,
    publishedDetails = {},
    authorDetails = {},
    verticalShare = "",
    shareIconType = "plain-color-svg",
    premiumStoryIconConfig = {}
  } = config;

  const visibledCards = noOfVisibleCards < 0 ? story.cards : story.cards.slice(0, noOfVisibleCards);
  const storyId = get(story, ["id"], "");
  const HeaderCard = () => {
    return (
      <div styleName="header-details">
        <SectionTag story={story} />
        <StoryHeadline story={story} premiumStoryIconConfig={premiumStoryIconConfig} />
        <Subheadline story={story} showFullContent />
      </div>
    );
  };

  const AsideCollectionCard = () => {
    return (
      asideCollection && (
        <div styleName="aside-collection tablet-index-2">
          <AsideCollection
            horizontal={true}
            {...asideCollection}
            widgetComp={widgetComp}
            adComponent={adComponent}
            opts={publishedDetails}
            loadRelatedStories={loadRelatedStories}
            story={story}
          />
        </div>
      )
    );
  };

  // Caching is done to avoid widget and Ad re-renderings
  const CachedAsideCollectionCard = useCallback(AsideCollectionCard, [templateType, story["story-template"]]);

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

  const StoryData = () => {
    const visibleCards = visibledCards.map((card) => {
      return (
        <StoryElementCard
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
      <div styleName="gap-16">
        {authorDetails && (
          <AuthorCard story={story} template={authorDetails.template} opts={authorDetails.opts} mountAt={mountAt} />
        )}
        <div styleName="timestamp-social-share">
          <div id={`publish-details-container-${storyId}`}>
            <PublishDetails story={story} opts={publishedDetails} template="story" timezone={timezone} />
          </div>
          {!verticalShare && <SocialShareComponent />}
        </div>
        {meteringIndicator}
        <StoryReview theme={theme} story={story} />
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
        <div styleName="text-story-side-column">
          <AsideCollection
            {...asideCollection}
            widgetComp={widgetComp}
            adComponent={adComponent}
            sticky={true}
            opts={publishedDetails}
            loadRelatedStories={loadRelatedStories}
            story={story}
          />
        </div>
      )
    );
  };

  // Caching is done to avoid widget and Ad re-renderings
  const CachedSideColumn = useCallback(SideColumn, [templateType, story["story-template"]]);

  const heroPriorityCenterTemplate = () => {
    return (
      <>
        <div styleName="hero-image index-2" data-test-id="hero-priority-center-image">
          <HeroImage
            story={story}
            widths={[250, 480, 640, 1200]}
            FullBleed={false}
            aspectRatio={[[16, 9]]}
            defaultFallback={false}
            isStoryPageImage
            isFullWidthImage
          />
        </div>
        <div styleName="story-content-inner-wrapper">
          <CaptionAttribution story={story} config={config} />
          <HeaderCard />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <CachedAsideCollectionCard />
      </>
    );
  };

  const headlineHeroPriorityTemplate = () => {
    return (
      <>
        <div styleName="story-content-inner-wrapper">
          <HeaderCard />
        </div>
        <div styleName="hero-image index-2" data-test-id="headline-hero-priority-image">
          <HeroImage
            story={story}
            widths={[250, 480, 640, 1200]}
            FullBleed={false}
            aspectRatio={[[16, 9]]}
            defaultFallback={false}
            isStoryPageImage
            isFullWidthImage
          />
        </div>
        <div styleName="story-content-inner-wrapper">
          <CaptionAttribution story={story} config={config} />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <CachedAsideCollectionCard />
      </>
    );
  };

  const heroVerticalTemplate = () => {
    return (
      <>
        <HeaderCard />
        <div styleName="hero-image index-2" data-test-id="hero-vertical-image">
          <HeroImage
            story={story}
            widths={[250, 480, 640, 1200]}
            FullBleed={false}
            aspectRatio={[[3, 4]]}
            defaultFallback={false}
            isStoryPageImage
          />
        </div>
        <CaptionAttribution story={story} config={config} />
        <div styleName="story-content-inner-wrapper">
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <CachedAsideCollectionCard />
      </>
    );
  };

  const heroPriorityLeftTemplate = () => {
    return (
      <>
        <div styleName="hero-image index-2" data-test-id="hero-priority-left-image">
          <HeroImage
            story={story}
            widths={[250, 480, 640, 1200]}
            FullBleed={false}
            aspectRatio={[[16, 9]]}
            defaultFallback={false}
            isStoryPageImage
            isFullWidthImage
          />
        </div>
        <div styleName="story-content-inner-wrapper">
          <CaptionAttribution story={story} config={config} />
          <HeaderCard />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <CachedSideColumn />
      </>
    );
  };

  const headlinePriorityTemplate = () => {
    return (
      <>
        <HeaderCard />
        <div styleName="story-content-inner-wrapper hero-image index-2" data-test-id="headline-priority-hero-image">
          <HeroImage
            story={story}
            widths={[250, 480, 640, 1200]}
            FullBleed={false}
            aspectRatio={[[16, 9]]}
            defaultFallback={false}
            isStoryPageImage
          />
        </div>
        <div styleName="story-content-inner-wrapper">
          <CaptionAttribution story={story} config={config} />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <CachedSideColumn />
      </>
    );
  };

  const headlineOverlayTemplate = () => {
    return (
      <>
        <div styleName="hero-image index-2" data-test-id="headline-overlay-hero-image">
          <HeroImage
            story={story}
            widths={[250, 480, 640, 1200]}
            FullBleed={false}
            aspectRatio={[[3, 4], [16, 9]]}
            isStoryPageImage
            isFullWidthImage
          />
        </div>
        <HeaderCard />
        <div styleName="story-content-inner-wrapper">
          <CaptionAttribution story={story} config={config} />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <CachedAsideCollectionCard />
      </>
    );
  };

  const getStoryTemplate = (templateType) => {
    switch (templateType) {
      case "hero-priority-center":
        return heroPriorityCenterTemplate();
      case "default":
        return heroPriorityLeftTemplate();
      case "headline-hero-priority":
        return headlineHeroPriorityTemplate();
      case "hero-vertical-priority":
        return heroVerticalTemplate();
      case "headline-priority":
        return headlinePriorityTemplate();
      case "headline-overlay-priority":
        return headlineOverlayTemplate();
    }
  };

  return <>{getStoryTemplate(templateType)}</>;
};

StoryTemplate.propTypes = {
  storyAccess: PropTypes.object,
  story: PropTypes.object,
  config: PropTypes.shape({
    templateType: PropTypes.string,
    authorDetails: PropTypes.object,
    asideCollection: PropTypes.object
  }),
  firstChild: PropTypes.node,
  secondChild: PropTypes.node,
  timezone: PropTypes.string,
  storyElementsConfig: PropTypes.object,
  widgetComp: PropTypes.func,
  adComponent: PropTypes.func,
  enableDarkMode: PropTypes.bool,
  mountAt: PropTypes.string,
  loadRelatedStories: PropTypes.func,
  visibleCardsRender: PropTypes.func | undefined,
  meteringIndicator: PropTypes.node | undefined
};
