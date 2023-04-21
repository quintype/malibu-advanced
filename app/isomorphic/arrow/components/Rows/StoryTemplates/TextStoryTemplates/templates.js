import React, { useEffect, useState } from "react";
import get from "lodash/get";
import PropTypes from "prop-types";
import { SocialShareTemplate } from "../../../Molecules/SocialShareTemplate";
import { AccessType, SocialShare } from "@quintype/components";
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
import { Paywall } from "../../Paywall";
import { useSelector } from "react-redux";

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

  // eslint-disable-next-line react/prop-types
  const StoryData = ({ initAccessType, checkAccess }) => {
    const [hasAccess, setHasAccess] = useState(false);
    useEffect(() => {
      !global.AccessType && initAccessType(() => console.log("Accesstype is initialized"));
      if (global.AccessType) {
        console.log("global.AccessType inside useEffect--->", global.AccessType, story.id, checkAccess(story.id));
        checkAccess(story.id).then((res) => {
          console.log("checkAccess inside StoryData is --->", res, story.id);
          setHasAccess(true);
        });
      }
    }, []);

    return (
      <div styleName="gap-16">
        {authorDetails && <AuthorCard story={story} template={authorDetails.template} opts={authorDetails.opts} />}
        <div styleName="timestamp-social-share">
          <PublishDetails story={story} opts={publishedDetails} template="story" timezone={timezone} />
          {!verticalShare && <SocialShareComponent />}
        </div>
        {storyAccess === "subscription" && hasAccess ? (
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

  const StoryDataWithAccesstype = () => {
    const member = useSelector((state) => get(state, ["member"], null));
    const email = get(member, ["email"], "abc@email.com");
    const phone = get(member, ["metadata", "phone-number"], "1234");
    const { key, accessTypeBkIntegrationId } = useSelector((state) =>
      get(state, ["qt", "config", "publisher-attributes", "accesstypeConfig"], {})
    );
    return (
      <AccessType
        enableAccesstype={true}
        isStaging={true}
        accessTypeKey={key}
        email={email}
        phone={phone}
        accessTypeBkIntegrationId={accessTypeBkIntegrationId}
      >
        {({ initAccessType, checkAccess }) => <StoryData checkAccess={checkAccess} initAccessType={initAccessType} />}
      </AccessType>
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
          <StoryDataWithAccesstype />
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
          <StoryDataWithAccesstype />
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
          <StoryDataWithAccesstype />
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
          <StoryDataWithAccesstype />
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
          <StoryDataWithAccesstype />
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
          <StoryDataWithAccesstype />
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
