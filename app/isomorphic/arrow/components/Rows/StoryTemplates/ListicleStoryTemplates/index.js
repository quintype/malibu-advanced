import { SocialShare } from "@quintype/components";
import React, { useCallback } from "react";
import { useSelector } from "react-redux";
import get from "lodash.get";
import cloneDeep from "lodash/cloneDeep";
import PropTypes from "prop-types";
import { AuthorCard } from "../../../Atoms/AuthorCard";
import { CaptionAttribution } from "../../../Atoms/CaptionAttribution";
import { StoryHeadline } from "../../../Atoms/StoryHeadline";
import { HeroImage } from "../../../Atoms/HeroImage";
import { PublishDetails } from "../../../Atoms/PublishDetail";
import { SectionTag } from "../../../Atoms/SectionTag";
import { Subheadline } from "../../../Atoms/Subheadline";
import { StateProvider } from "../../../SharedContext";
import { SocialShareTemplate } from "../../../Molecules/SocialShareTemplate";
import "./listicle-story.m.css";
import { StoryElementCard, SlotAfterStory } from "../../../Molecules/StoryElementCard";
import { StoryTags } from "../../../Atoms/StoryTags";
import AsideCollection from "../../AsideCollection";
import { StoryReview } from "../../../Atoms/StoryReview";
import { getTextColor } from "../../../../utils/utils";
import { getTitleElementsIndex, isIntroCardPresent, getFirstDescriptionElementsIndex } from "./listicleUtils.js";

const ListicleStoryTemplate = ({
  storyAccess = null,
  story = {},
  config = {},
  storyElementsConfig,
  adComponent,
  widgetComp = () => {},
  firstChild,
  secondChild,
  enableDarkMode,
  loadRelatedStories,
  visibleCardsRender = null,
  meteringIndicator
}) => {
  const {
    theme = "",
    noOfVisibleCards = -1,
    publishedDetails = {},
    templateType = "",
    authorDetails = {
      template: "default"
    },
    asideCollection = {},
    showSection,
    sectionTagSettings,
    premiumStoryIconConfig = {}
  } = config;
  const visibledCards = noOfVisibleCards < 0 ? story.cards : story.cards.slice(0, noOfVisibleCards);
  const { "bullet-type": storyBulletType = "" } = story;
  const storyId = get(story, ["id"], "");
  const isNumberedBullet = storyBulletType !== "bullets";
  const ascendingNumbers = storyBulletType === "123";
  const numberOfCards = visibledCards.length;

  const qtState = useSelector((state) => get(state, ["qt"], {}));
  const timezone = get(qtState, ["data", "timezone"], null);
  const mountAt = get(qtState, ["config", "mountAt"], "");

  const introCardPresent = isIntroCardPresent(visibledCards);
  const numberedBulletColor = getTextColor(theme) === "dark" ? "black" : "white";

  const visibleCardsWithInlineBullets = visibledCards.map((card, index) => {
    const titleElementsIndex = getTitleElementsIndex(card);
    const isTitlePresent = titleElementsIndex > -1;
    const titleCard = isTitlePresent ? cloneDeep(get(card, ["story-elements", titleElementsIndex], {})) : {};

    if ((introCardPresent && index === 0) || !isTitlePresent) return card;
    if (isNumberedBullet) {
      const ascendingBulletNumber = introCardPresent ? index : index + 1;
      const bulletNumber = ascendingNumbers ? ascendingBulletNumber : numberOfCards - index;
      titleCard.text = `${bulletNumber}. ${titleCard.text}`;
    } else {
      titleCard.hasDashedBullet = true;
    }

    return {
      ...card,
      "story-elements": Object.assign([], card["story-elements"], { [titleElementsIndex]: titleCard })
    };
  });

  function addNonInlineBullets(opts) {
    const {
      cardIndex,
      introCardPresent,
      isNumberedBullet,
      numberedBulletColor,
      ascendingNumbers,
      numberOfCards
    } = opts;
    if (introCardPresent && cardIndex === 0) return;
    if (!isNumberedBullet) return <div styleName="bullet-style-dash" />;
    const ascendingBulletNumber = introCardPresent ? cardIndex : cardIndex + 1;
    return (
      <div styleName="bullet-style-number" style={{ color: numberedBulletColor }}>
        {ascendingNumbers ? ascendingBulletNumber : numberOfCards - cardIndex}.
      </div>
    );
  }

  const visibleCards = visibleCardsWithInlineBullets.map((card, index) => {
    const titleElementsIndex = getTitleElementsIndex(card);
    const isTitlePresent = titleElementsIndex > -1;
    const firstDescriptionElementsIndex = getFirstDescriptionElementsIndex(card);
    const opts = {
      isTitlePresent,
      firstDescriptionElementsIndex,
      cardIndex: index,
      introCardPresent,
      isNumberedBullet,
      numberedBulletColor,
      ascendingNumbers,
      numberOfCards,
      addNonInlineBullets
    };

    return (
      <React.Fragment key={card.id}>
        <StoryElementCard
          story={story}
          card={card}
          key={card.id}
          config={storyElementsConfig}
          listicleBulletOpts={opts}
          adComponent={adComponent}
          widgetComp={widgetComp}
          enableDarkMode={enableDarkMode}
        />
      </React.Fragment>
    );
  });

  // Content Blocks
  const HeroImageBlock = (settings) => {
    const { widths = [320, 480, 768, 1024, 1140], aspectRatio = [[16, 9]], isFullWidthImage = false } = settings;
    return (
      <HeroImage
        defaultWidth={320}
        story={story}
        widths={widths}
        aspectRatio={aspectRatio}
        defaultFallback={false}
        isStoryPageImage
        isFullWidthImage={isFullWidthImage}
      />
    );
  };

  const CaptionAttributionBlock = () => (
    <div styleName="caption-attribution-block">
      <CaptionAttribution story={story} />
    </div>
  );

  const HeadlineBlock = () => (
    <div styleName="headline-block">
      <div styleName="section-tag">{showSection && <SectionTag story={story} {...sectionTagSettings} />}</div>
      <StoryHeadline story={story} premiumStoryIconConfig={premiumStoryIconConfig} />
      <Subheadline story={story} showFullContent />
    </div>
  );

  const AuthorBlock = () => {
    return (
      <>
        <AuthorCard story={story} {...authorDetails} mountAt={mountAt} />
        <div styleName="timestamp-social-share">
          <div id={`publish-details-container-${storyId}`}>
            <PublishDetails story={story} opts={publishedDetails} template="story" timezone={timezone} />
          </div>
          <div id={`story-share-${storyId}`} className="content-style">
            <SocialShare
              template={SocialShareTemplate}
              theme={theme}
              fullUrl={encodeURI(story.url)}
              title={story.headline}
              shareIconId={`share-icon-story-share-${storyId}`}
            />
          </div>
        </div>
      </>
    );
  };

  const BodyBlock = () => (
    <>
      {meteringIndicator}
      <StoryReview theme={theme} story={story} />
      <div styleName={`body-block ${isNumberedBullet ? "numbered-bullet-style" : ""}`}>
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
    </>
  );

  const SideColumnBlock = () =>
    asideCollection && (
      <AsideCollection
        {...asideCollection}
        adComponent={adComponent}
        widgetComp={widgetComp}
        sticky={true}
        story={story}
        opts={publishedDetails}
        loadRelatedStories={loadRelatedStories}
      />
    );

  // Caching is done to avoid widget and Ad re-renderings
  const CachedSideColumnBlock = useCallback(SideColumnBlock, [templateType, story["story-template"]]);

  const HorizontalAsideCollection = () =>
    asideCollection && (
      <div styleName="horizontal-aside-collection">
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
    );

  // Caching is done to avoid widget and Ad re-renderings
  const CachedHorizontalAsideCollection = useCallback(HorizontalAsideCollection, [
    templateType,
    story["story-template"]
  ]);

  // Templates
  const defaultTemplate = () => (
    <>
      <HeroImageBlock aspectRatio={[[16, 9], [16, 6]]} isFullWidthImage={true} />
      <div styleName="grid-container">
        <div styleName="full-grid">
          <CaptionAttributionBlock />
        </div>
        <div data-type-column="left" styleName="left-column">
          <HeadlineBlock />
          <AuthorBlock />
          <BodyBlock />
        </div>
        <div data-type-column="right" styleName="right-column">
          <CachedSideColumnBlock />
        </div>
      </div>
    </>
  );

  const heroPriority = () => (
    <div styleName="hero-priority-template">
      <div styleName="grid-container">
        <div styleName="full-grid">
          <HeroImageBlock isFullWidthImage={true} />
        </div>
        <div styleName="center-column">
          <CaptionAttributionBlock />
          <HeadlineBlock />
          <AuthorBlock />
          <BodyBlock />
        </div>
        <CachedHorizontalAsideCollection />
      </div>
    </div>
  );

  const headlinePriority = () => (
    <div styleName="headline-priority-template">
      <div styleName="grid-container">
        <div styleName="headline-priority-grid">
          <HeadlineBlock />
        </div>
        <div styleName="left-column">
          <HeroImageBlock />
          <CaptionAttributionBlock />
          <AuthorBlock />
          <BodyBlock />
        </div>
        <div styleName="right-column">
          <CachedSideColumnBlock />
        </div>
      </div>
    </div>
  );

  const headlineHeroPriority = () => (
    <div styleName="headline-hero-priority-template">
      <div styleName="grid-container">
        <div styleName="center-column">
          <HeadlineBlock />
        </div>
        <div styleName="full-grid">
          <HeroImageBlock isFullWidthImage={true} />
        </div>
        <div styleName="center-column">
          <CaptionAttributionBlock />
          <AuthorBlock />
          <BodyBlock />
        </div>
        <CachedHorizontalAsideCollection />
      </div>
    </div>
  );

  const heroOverlay = () => (
    <div styleName="hero-overlay-template">
      <div styleName="grid-container">
        <div styleName="full-grid hero-faded-relative">
          <div styleName="hero-faded-wrapper">
            <div styleName="headline-content-holder">
              <HeadlineBlock />
            </div>
          </div>
          <HeroImageBlock aspectRatio={[[2, 3], [16, 9]]} isFullWidthImage={true} />
        </div>
      </div>
      <div styleName="grid-container">
        <div styleName="center-column">
          <CaptionAttributionBlock />
          <AuthorBlock />
          <BodyBlock />
        </div>
        <CachedHorizontalAsideCollection />
      </div>
    </div>
  );

  const headlineSideway = () => (
    <div styleName="headline-sideway-template">
      <div styleName="sideway-grid">
        <div styleName="sideway-headline">
          <HeadlineBlock />
        </div>
        <div styleName="sideway-hero">
          <HeroImageBlock aspectRatio={[[16, 9], [4, 3]]} />
          <CaptionAttributionBlock />
        </div>
      </div>
      <div styleName="grid-container">
        <div styleName="center-column">
          <AuthorBlock />
          <BodyBlock />
        </div>
        <CachedHorizontalAsideCollection />
      </div>
    </div>
  );

  const renderTemplate = (templateType) => {
    switch (templateType) {
      case "hero-priority":
        return heroPriority();
      case "headline-priority":
        return headlinePriority();
      case "headline-hero-priority":
        return headlineHeroPriority();
      case "hero-overlay":
        return heroOverlay();
      case "headline-sideway":
        return headlineSideway();
      default:
        return defaultTemplate();
    }
  };
  const dataTestId = templateType ? `listicle-story-${templateType}` : "listicle-story";
  return (
    <div
      data-test-id={dataTestId}
      className="arrow-component arr--content-wrapper arr--listicle-story-template-wrapper"
      style={{ backgroundColor: theme || "initial" }}>
      {renderTemplate(templateType)}
    </div>
  );
};

ListicleStoryTemplate.propTypes = {
  storyAccess: PropTypes.object,
  story: PropTypes.object,
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
  premiumStoryIconConfig: PropTypes.object,
  enableDarkMode: PropTypes.bool,
  loadRelatedStories: PropTypes.func,
  visibleCardsRender: PropTypes.func | undefined,
  meteringIndicator: PropTypes.node | undefined
};

export default StateProvider(ListicleStoryTemplate);
