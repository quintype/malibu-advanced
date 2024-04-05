import React, { useCallback } from "react";
import get from "lodash.get";
import PropTypes from "prop-types";
import { SocialShare } from "@quintype/components";
import { SocialShareTemplate } from "../../../Molecules/SocialShareTemplate";
import { SectionTag } from "../../../Atoms/SectionTag";
import { Subheadline } from "../../../Atoms/Subheadline";
import AsideCollection from "../../AsideCollection";
import { AuthorCard } from "../../../Atoms/AuthorCard";
import { SlotAfterStory, LiveBlogStoryElement } from "../../../Molecules/StoryElementCard";
import { PublishDetails } from "../../../Atoms/PublishDetail";
import { StoryTags } from "../../../Atoms/StoryTags";
import { HeroImage } from "../../../Atoms/HeroImage";
import "./live-blog.m.css";
import { CaptionAttribution } from "../../../Atoms/CaptionAttribution";
import {
  clientWidth,
  getTextColor,
  getTimeStamp,
  timestampToFormat,
  getTimeStampConfig,
} from "../../../../utils/utils";
import LiveIcon from "../../../Svgs/liveicon";
import KeyEvents from "../../../Molecules/KeyEvents";
import { ClockIcon } from "../../../Svgs/clock-icon";
import { StoryHeadline } from "../../../Atoms/StoryHeadline";
import { StoryReview } from "../../../Atoms/StoryReview";
import { useSelector } from "react-redux";

export const LiveBlogStoryTemplates = ({
  storyAccess = null,
  story = {},
  config = {},
  storyElementsConfig,
  adComponent,
  widgetComp,
  firstChild,
  secondChild,
  timezone,
  enableDarkMode,
  mountAt,
  loadRelatedStories,
  visibleCardsRender = null,
  meteringIndicator,
}) => {
  const {
    theme = "",
    asideCollection = {},
    templateType,
    noOfVisibleCards = 0,
    publishedDetails = {},
    verticalShare = "",
    shareIconType = "plain-color-svg",
    authorDetails = {
      template: "default",
    },
    premiumStoryIconConfig = {},
  } = config;

  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const timeStampConfig = getTimeStampConfig(qtConfig);
  const direction = get(qtConfig, ["language", "direction"], "ltr");

  const visibleCards = noOfVisibleCards < 0 ? story.cards : story.cards.slice(0, noOfVisibleCards);
  const textColor = getTextColor(theme);
  const dark = "#333";
  const light = "#fff";
  const updateColor = textColor === "dark" ? dark : light;

  const isMobile = clientWidth("mobile");
  const storyId = get(story, ["id"], "");

  const HeaderCard = () => {
    const isBlogClosed = get(story, ["metadata", "is-closed"]);
    return (
      <div styleName="header-wrapper header-details">
        <SectionTag story={story} />
        <div styleName="live-headline">
          {!isBlogClosed && (
            <div styleName="live-icon">
              <LiveIcon />
            </div>
          )}
          <StoryHeadline story={story} premiumStoryIconConfig={premiumStoryIconConfig} />
        </div>
        <Subheadline story={story} showFullContent />
      </div>
    );
  };
  const StoryCards = () => {
    return visibleCards.map((card = {}, index) => {
      const borderBottom = index === visibleCards.length - 1 ? "" : `share-cards ${textColor}`;
      const cardId = get(card, ["id"], "");
      const { "card-added-at": cardAddedAt } = card;

      const storyUrl = new URL(story.url);
      const shareUrl = encodeURI(storyUrl.origin + `${mountAt}${storyUrl.pathname}#${story.slug}-${cardId}`);

      function CardShare() {
        const rltDateTimeWithOutLocalization =
          direction === "rtl" && !timeStampConfig.enableLocalization ? "rtl-date-time" : "";
        return (
          <div styleName="card-share">
            <div styleName={`time-wrapper ${rltDateTimeWithOutLocalization} ${textColor}`}>
              <ClockIcon color={updateColor} />
              {getTimeStamp(cardAddedAt, timestampToFormat, {
                isTimeFirst: true,
                ...timeStampConfig,
                direction,
                showTime: true,
              })}
            </div>
            <div id={`card-share-${cardId}_${storyId}`} className="content-style">
              <SocialShare
                template={SocialShareTemplate}
                fullUrl={shareUrl}
                title={story.headline}
                theme={theme}
                iconType={shareIconType}
              />
            </div>
          </div>
        );
      }

      return (
        <div key={index} styleName={borderBottom} id={`${story.slug}-${cardId}`} style={{ scrollMarginTop: "20vh" }}>
          <LiveBlogStoryElement
            story={story}
            card={card}
            key={cardId}
            config={storyElementsConfig}
            theme={theme}
            adComponent={adComponent}
            widgetComp={widgetComp}
            enableDarkMode={enableDarkMode}
            CardShare={CardShare}
          />
        </div>
      );
    });
  };

  const keyEvents = () => {
    return (
      <div styleName="key-events" id={`key-events-${storyId}`}>
        <KeyEvents story={story} showLoadMore={true} config={config} publishedDetails={publishedDetails} />
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

  const showKeyEvents = () => {
    if ((templateType === "default" || templateType === "headline-priority") && !isMobile) {
      return null;
    }
    return keyEvents();
  };

  const StoryData = () => {
    const accessGranted = storyAccess?.accessGranted;
    const accessLoading = accessGranted === null;
    return (
      <>
        <AuthorCard
          clazzName="gap-32"
          story={story}
          template={authorDetails.template}
          opts={authorDetails.opts}
          mountAt={mountAt}
        />
        <div styleName="timestamp-social-share">
          <div id={`publish-details-container-${storyId}`}>
            <PublishDetails story={story} opts={publishedDetails} template="story" timezone={timezone} />
          </div>
          {!verticalShare && <SocialShareComponent />}
        </div>
        {meteringIndicator}
        <StoryReview theme={theme} story={story} />
        {showKeyEvents()}
        {visibleCardsRender ? visibleCardsRender(<StoryCards />, null, storyAccess) : <StoryCards />}
        <div styleName="space-32">
          {!accessLoading && firstChild}
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

  const cachedAsideCollection = useCallback(
    (story) => (
      <AsideCollection
        {...asideCollection}
        adComponent={adComponent}
        widgetComp={widgetComp}
        sticky={true}
        enableKeyEvents={!isMobile}
        keyEventsData={{ story, config, showLoadMore: true }}
        story={story}
        opts={publishedDetails}
        loadRelatedStories={loadRelatedStories}
      />
    ),
    [templateType, story]
  );

  const DefaultTemplate = (story) => {
    return (
      <>
        <div data-test-id="hero-image" styleName="grid-col-full index-2">
          <HeroImage
            story={story}
            aspectRatio={[
              [16, 9],
              [8, 3],
            ]}
            isStoryPageImage
            isFullWidthImage
          />
        </div>
        <div styleName="header-wrapper">
          <CaptionAttribution story={story} config={config} />
          <HeaderCard />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <div styleName="side-column">{asideCollection && cachedAsideCollection(story)}</div>
      </>
    );
  };

  const cachedAsideColumn = useCallback(
    (story) => (
      <AsideCollection
        horizontal={true}
        {...asideCollection}
        adComponent={adComponent}
        widgetComp={widgetComp}
        story={story}
        opts={publishedDetails}
        loadRelatedStories={loadRelatedStories}
      />
    ),
    [templateType, story]
  );

  const HeroOverlay = (story) => {
    return (
      <>
        <div styleName="overlay-hero  index-2">
          <HeroImage
            story={story}
            aspectRatio={[
              [1, 2],
              [16, 9],
            ]}
            isStoryPageImage
            isFullWidthImage
          />
        </div>
        <div styleName="overlay-grid">
          <HeaderCard />
        </div>
        <div styleName="grid-col-4-12 ">
          <CaptionAttribution story={story} config={config} />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        {asideCollection && <div styleName="grid-container tablet-index-2">{cachedAsideColumn(story)}</div>}
      </>
    );
  };

  const HeadlineSideway = (story) => {
    return (
      <>
        <div styleName="grid-col-2-9 sideway ">
          <HeaderCard />
        </div>
        <div styleName="grid-col-9-15 index-2">
          <HeroImage story={story} aspectRatio={[[4, 3]]} isStoryPageImage />
          <CaptionAttribution story={story} config={config} />
        </div>
        <div styleName="grid-col-4-12 ">
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        {asideCollection && <div styleName="grid-container tablet-index-2">{cachedAsideColumn(story)}</div>}
      </>
    );
  };

  const HeadlinePriority = (story) => {
    return (
      <>
        <div styleName="grid-col-2-9  grid-row-1-2 headline-space">
          <HeaderCard />
        </div>
        <div styleName="grid-col-2-9  grid-row-2-3 index-2">
          <HeroImage story={story} aspectRatio={[[16, 9]]} isStoryPageImage />
        </div>
        <div styleName="grid-col-2-9  grid-row-3-4">
          <CaptionAttribution story={story} config={config} />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <div styleName="grid-col-9-14 grid-row-1-6">{asideCollection && cachedAsideCollection(story)}</div>
      </>
    );
  };

  const HeroPriority = (story) => {
    return (
      <>
        <div styleName="grid-container index-2">
          <HeroImage story={story} aspectRatio={[[16, 9]]} isStoryPageImage isFullWidthImage />
        </div>
        <div styleName="grid-col-4-12 ">
          <CaptionAttribution story={story} config={config} />
          <HeaderCard />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        {asideCollection && <div styleName="grid-container tablet-index-2">{cachedAsideColumn(story)}</div>}
      </>
    );
  };

  const HeadlineHeroPriority = (story) => {
    return (
      <>
        <div styleName="grid-col-4-12 headline-space">
          <HeaderCard />
        </div>
        <div styleName="grid-container  index-2">
          <HeroImage story={story} aspectRatio={[[16, 9]]} isStoryPageImage isFullWidthImage />
        </div>
        <div styleName="grid-col-4-12 ">
          <CaptionAttribution story={story} config={config} />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        {asideCollection && <div styleName="grid-container tablet-index-2">{cachedAsideColumn(story)}</div>}
      </>
    );
  };

  const getLiveBlogStoryTemplates = (templateType) => {
    switch (templateType) {
      case "hero-priority":
        return HeroPriority(story);
      case "hero-overlay":
        return HeroOverlay(story);
      case "headline-sideway":
        return HeadlineSideway(story);
      case "headline-priority":
        return HeadlinePriority(story);
      case "headline-hero-priority":
        return HeadlineHeroPriority(story);
      default:
        return DefaultTemplate(story);
    }
  };

  return <>{getLiveBlogStoryTemplates(templateType)}</>;
};

LiveBlogStoryTemplates.propTypes = {
  story: PropTypes.object,
  storyAccess: PropTypes.object,
  config: PropTypes.shape({
    templateType: PropTypes.string,
    authorCard: PropTypes.object,
    asideCollection: PropTypes.object,
  }),
  timezone: PropTypes.string,
  firstChild: PropTypes.node,
  secondChild: PropTypes.node,
  storyElementsConfig: PropTypes.object,
  adComponent: PropTypes.func,
  widgetComp: PropTypes.func,
  enableDarkMode: PropTypes.bool,
  loadRelatedStories: PropTypes.func,
  mountAt: PropTypes.string,
  visibleCardsRender: PropTypes.func | undefined,
  meteringIndicator: PropTypes.node | undefined,
};
