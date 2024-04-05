import { SocialShare } from "@quintype/components";
import PropTypes from "prop-types";
import React, { useCallback } from "react";
import get from "lodash.get";
import { useSelector } from "react-redux";
import kebabCase from "lodash.kebabcase";
import { AuthorCard } from "../../../Atoms/AuthorCard";
import { CaptionAttribution } from "../../../Atoms/CaptionAttribution";
import { SocialShareTemplate } from "../../../Molecules/SocialShareTemplate";
import { SectionTag } from "../../../Atoms/SectionTag";
import { StoryHeadline } from "../../../Atoms/StoryHeadline";
import { Subheadline } from "../../../Atoms/Subheadline";
import { HeroImage } from "../../../Atoms/HeroImage";
import { PublishDetails } from "../../../Atoms/PublishDetail";
import { StoryTags } from "../../../Atoms/StoryTags";
import { PhotoStoryElement, SlotAfterStory } from "../../../Molecules/StoryElementCard";
import { StoryReview } from "../../../Atoms/StoryReview";
import { StateProvider } from "../../../SharedContext";
import AsideCollection from "../../AsideCollection";
import "./photo.m.css";

const PhotoStory = ({
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
  const {
    theme = "",
    asideCollection = {},
    templateType = "default",
    noOfVisibleCards = -1,
    publishedDetails = {},
    verticalShare = "",
    shareIconType = "plain-color-svg",
    authorDetails = {
      template: "default",
    },
    imageRender = "fullBleed",
    premiumStoryIconConfig = {},
  } = config;
  const isFullBleed = imageRender === "fullBleed";
  const visibledCards = noOfVisibleCards < 0 ? story.cards : story.cards.slice(0, noOfVisibleCards);
  const storyId = get(story, ["id"], "");

  const qtState = useSelector((state) => get(state, ["qt"], {}));
  const timezone = get(qtState, ["data", "timezone"], null);
  const mountAt = get(qtState, ["config", "mountAt"], "");

  const HeaderCard = () => {
    return (
      <div styleName="grid-col-2-10 header-details">
        <SectionTag story={story} />
        <StoryHeadline story={story} premiumStoryIconConfig={premiumStoryIconConfig} />
        <Subheadline story={story} showFullContent />
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

  const StoryData = () => {
    const visibleCards = visibledCards.map((card) => {
      return (
        <PhotoStoryElement
          story={story}
          card={card}
          key={get(card, ["id"], "")}
          config={{ ...storyElementsConfig, theme }}
          adComponent={adComponent}
          widgetComp={widgetComp}
          enableDarkMode={enableDarkMode}
          theme={theme}
        />
      );
    });
    const accessGranted = storyAccess?.accessGranted;
    const accessLoading = accessGranted === null;
    const showPaywallBanner = !accessLoading && !accessGranted;
    return (
      <>
        {authorDetails && (
          <AuthorCard
            clazzName="gap-32"
            story={story}
            template={authorDetails.template}
            opts={authorDetails.opts}
            mountAt={mountAt}
          />
        )}
        <div styleName="story-details">
          <div id={`publish-details-container-${storyId}`}>
            <PublishDetails story={story} opts={publishedDetails} template="story" timezone={timezone} />
          </div>
          {!verticalShare && <SocialShareComponent />}
        </div>
        {meteringIndicator}
        <StoryReview theme={theme} story={story} />
        {visibleCardsRender ? visibleCardsRender(visibleCards, null, storyAccess) : visibleCards}
        <div styleName="space-32">
          {showPaywallBanner && firstChild}
          <StoryTags tags={story.tags} />
          {meteringIndicator}
          <SlotAfterStory
            id={story.id}
            element={story.customSlotAfterStory}
            AdComponent={adComponent}
            WidgetComp={widgetComp}
          />
          {secondChild}
        </div>
      </>
    );
  };

  const renderImages = (imageRender) => {
    switch (imageRender) {
      case "fullBleed":
        return "grid-col-full";
      case "container":
        return "grid-container";
      default:
        return "grid-col-full";
    }
  };

  const DefaultTemplateSideColumn = () => {
    return (
      asideCollection && (
        <div styleName="grid-col-10-14 space-12">
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

  // Caching is done to avoid widget and Ad re-renderings
  const CachedDefaultSideColumn = useCallback(DefaultTemplateSideColumn, [templateType, story["story-template"]]);

  const defaultTemplate = () => {
    return (
      <>
        <div data-test-id="hero-image" styleName={`${renderImages(imageRender)} index-2`}>
          <HeroImage
            story={story}
            widths={[250, 480, 640, 1200]}
            aspectRatio={[
              [16, 9],
              [8, 3],
            ]}
            defaultFallback={false}
            isStoryPageImage
            isFullWidthImage
          />
        </div>
        <div styleName="grid-col-2-10 space-12">
          <CaptionAttribution story={story} config={config} />
          <HeaderCard />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <CachedDefaultSideColumn />
      </>
    );
  };

  const HeroPrioritySideColumn = () => {
    return (
      asideCollection && (
        <div styleName="grid-container space-12 tablet-index-2">
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
      )
    );
  };

  const CachedHeroPrioritySideColumn = useCallback(HeroPrioritySideColumn, [templateType, story["story-template"]]);

  const heroPriority = () => {
    return (
      <>
        <div data-test-id="hero-image" styleName={`${renderImages(imageRender)} index-2`}>
          <HeroImage
            widths={[250, 480, 640, 1200]}
            story={story}
            aspectRatio={[[16, 9]]}
            defaultFallback={false}
            isStoryPageImage
            isFullWidthImage
          />
        </div>
        <div styleName="grid-col-4-12 space-12">
          <CaptionAttribution story={story} config={config} />
          <HeaderCard />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <CachedHeroPrioritySideColumn />
      </>
    );
  };

  const HeadlinePrioritySideColumn = () => {
    return (
      asideCollection && (
        <div styleName="grid-col-9-14">
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

  const CachedHeadlinePrioritySideColumn = useCallback(HeadlinePrioritySideColumn, [templateType]);

  const headlinePriority = () => {
    return (
      <>
        <div styleName="grid-container side-space">
          <HeaderCard />
        </div>
        <div styleName="grid-col-2-9 side-space index-2">
          <HeroImage
            widths={[250, 480, 640, 1200]}
            story={story}
            aspectRatio={[[16, 9]]}
            defaultFallback={false}
            isStoryPageImage
          />
        </div>
        <div styleName="grid-col-2-9 side-space">
          <CaptionAttribution story={story} config={config} />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <CachedHeadlinePrioritySideColumn />
      </>
    );
  };

  const getStoryTemplate = (templateType) => {
    switch (templateType) {
      case "hero-priority-center":
        return heroPriority();
      case "headline-priority":
        return headlinePriority();
      default:
        return defaultTemplate();
    }
  };

  return (
    <div
      styleName={`${verticalShare} ${isFullBleed ? "fullBleed" : ""} ${
        templateType !== "headline-priority" && !isFullBleed ? "container" : ""
      }`}
      data-test-id={`photo-story-${templateType}-${kebabCase(imageRender)}`}
      className={`arrow-component arr-story-grid arr--content-wrapper arr--photo-story-template-wrapper ${templateType} `}
      style={{ backgroundColor: theme || "initial" }}
    >
      {getStoryTemplate(templateType)}
    </div>
  );
};

PhotoStory.propTypes = {
  storyAccess: PropTypes.object,
  story: PropTypes.object,
  config: PropTypes.shape({
    templateType: PropTypes.string,
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

export default StateProvider(PhotoStory);
