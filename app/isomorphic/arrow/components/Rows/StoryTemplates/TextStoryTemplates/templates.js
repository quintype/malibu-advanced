import React from "react";
import get from "lodash/get";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { SocialShareTemplate } from "../../../Molecules/SocialShareTemplate";
import { Link, SocialShare } from "@quintype/components";
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
import "./text-story.m.css";

export const StoryTemplate = ({
  story = {},
  config = {},
  storyElementsConfig,
  widgetComp,
  adComponent,
  firstChild,
  secondChild,
  timezone,
  storyAccess,
}) => {
  const {
    theme = "",
    asideCollection = {},
    templateType = "default",
    noOfVisibleCards = -1,
    publishedDetails = {},
    authorDetails = {
      template: "default",
    },
    verticalShare = "",
    shareIconType = "plain-color-svg",
    premiumStoryIconConfig = {},
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
            storyId={storyId}
            opts={publishedDetails}
          />
        </div>
      )
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

  const Paywall = function () {
    const member = useSelector((state) => get(state, ["member"], null));

    return (
      <div styleName="paywall-container">
        <div styleName="paywall-headline">Want to read full story?</div>
        <p styleName="paywall-description">
          We’re glad you’re enjoying this story. Subscribe to our plans to continue reading the story.
        </p>
        <div styleName="view-plans-btn">
          <Link href="/subscription" styleName="view-plans-link">
            View All Plans
          </Link>
        </div>
        {!member && (
          <div styleName="go-to-login">
            Already have a subscription?
            <Link href="/user-login" styleName="go-to-login-link">
              Login
            </Link>
          </div>
        )}
      </div>
    );
  };

  const StoryData = () => {
    return (
      <div styleName="gap-16">
        {authorDetails && <AuthorCard story={story} template={authorDetails.template} opts={authorDetails.opts} />}
        <div styleName="timestamp-social-share">
          <PublishDetails story={story} opts={publishedDetails} template="story" timezone={timezone} />
          {!verticalShare && <SocialShareComponent />}
        </div>
        {storyAccess === "subscription" ? (
          <>
            <StoryElementCard
              story={story}
              card={visibledCards[0]}
              key={get(visibledCards[0], ["id"], "")}
              config={storyElementsConfig}
              adComponent={adComponent}
              widgetComp={widgetComp}
            />
            <Paywall />
          </>
        ) : (
          <>
            {visibledCards.map((card) => {
              return (
                <StoryElementCard
                  story={story}
                  card={card}
                  key={get(card, ["id"], "")}
                  config={storyElementsConfig}
                  adComponent={adComponent}
                  widgetComp={widgetComp}
                />
              );
            })}
            {firstChild}
            <div styleName="story-tags">
              <StoryTags tags={story.tags} />
              <SlotAfterStory
                id={story.id}
                element={story.customSlotAfterStory}
                AdComponent={adComponent}
                WidgetComp={widgetComp}
              />
            </div>
            {secondChild}
          </>
        )}
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
            storyId={storyId}
            opts={publishedDetails}
          />
        </div>
      )
    );
  };

  const heroPriorityCenterTemplate = () => {
    return (
      <>
        <div styleName="hero-image index-2" data-test-id="hero-priority-center-image">
          <HeroImage story={story} FullBleed={false} aspectRatio={[[16, 9]]} defaultFallback={false} isStoryPageImage />
        </div>
        <div styleName="story-content-inner-wrapper">
          <CaptionAttribution story={story} config={config} />
          <HeaderCard />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <AsideCollectionCard />
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
          <HeroImage story={story} FullBleed={false} aspectRatio={[[16, 9]]} defaultFallback={false} isStoryPageImage />
        </div>
        <div styleName="story-content-inner-wrapper">
          <CaptionAttribution story={story} config={config} />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <AsideCollectionCard />
      </>
    );
  };

  const heroVerticalTemplate = () => {
    return (
      <>
        <HeaderCard />
        <div styleName="hero-image index-2" data-test-id="hero-vertical-image">
          <HeroImage story={story} FullBleed={false} aspectRatio={[[3, 4]]} defaultFallback={false} isStoryPageImage />
        </div>
        <CaptionAttribution story={story} config={config} />
        <div styleName="story-content-inner-wrapper">
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <AsideCollectionCard />
      </>
    );
  };

  const heroPriorityLeftTemplate = () => {
    return (
      <>
        <div styleName="hero-image index-2" data-test-id="hero-priority-left-image">
          <HeroImage story={story} FullBleed={false} aspectRatio={[[16, 9]]} defaultFallback={false} isStoryPageImage />
        </div>
        <div styleName="story-content-inner-wrapper">
          <CaptionAttribution story={story} config={config} />
          <HeaderCard />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <SideColumn />
      </>
    );
  };

  const headlinePriorityTemplate = () => {
    return (
      <>
        <HeaderCard />
        <div styleName="story-content-inner-wrapper hero-image index-2" data-test-id="headline-priority-hero-image">
          <HeroImage story={story} FullBleed={false} aspectRatio={[[16, 9]]} defaultFallback={false} isStoryPageImage />
        </div>
        <div styleName="story-content-inner-wrapper">
          <CaptionAttribution story={story} config={config} />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <SideColumn />
      </>
    );
  };

  const headlineOverlayTemplate = () => {
    return (
      <>
        <div styleName="hero-image index-2" data-test-id="headline-overlay-hero-image">
          <HeroImage
            story={story}
            FullBleed={false}
            aspectRatio={[
              [3, 4],
              [16, 9],
            ]}
            isStoryPageImage
          />
        </div>
        <HeaderCard />
        <div styleName="story-content-inner-wrapper">
          <CaptionAttribution story={story} config={config} />
          <StoryData />
        </div>
        {verticalShare && <SocialShareComponent />}
        <AsideCollectionCard />
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
  story: PropTypes.object,
  config: PropTypes.shape({
    templateType: PropTypes.string,
    authorDetails: PropTypes.object,
    asideCollection: PropTypes.object,
  }),
  firstChild: PropTypes.node,
  secondChild: PropTypes.node,
  timezone: PropTypes.string,
  storyElementsConfig: PropTypes.object,
  widgetComp: PropTypes.func,
  adComponent: PropTypes.func,
  storyAccess: PropTypes.string,
};
