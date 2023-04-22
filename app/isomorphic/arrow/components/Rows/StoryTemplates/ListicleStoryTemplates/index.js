import { SocialShare } from "@quintype/components";
import React from "react";
import { useSelector } from "react-redux";
import get from "lodash/get";
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

const ListicleStoryTemplate = ({
  story = {},
  config = {},
  storyElementsConfig,
  adComponent,
  widgetComp = () => {},
  firstChild,
  secondChild,
}) => {
  const {
    theme = "",
    noOfVisibleCards = -1,
    publishedDetails = {},
    templateType = "",
    authorDetails = {
      template: "default",
    },
    asideCollection = {},
    showSection,
    sectionTagSettings,
    premiumStoryIconConfig = {},
  } = config;
  const visibledCards = noOfVisibleCards < 0 ? story.cards : story.cards.slice(0, noOfVisibleCards);
  const { "bullet-type": storyBulletType = "" } = story;
  const storyId = get(story, ["id"], "");
  const isNumberedBullet = storyBulletType !== "bullets";
  const timezone = useSelector((state) => get(state, ["qt", "data", "timezone"], null));

  // Content Blocks
  const HeroImageBlock = (settings) => {
    const { widths = [320, 480, 768, 1024, 1140], aspectRatio = [[16, 9]] } = settings;
    return (
      <HeroImage
        defaultWidth={320}
        story={story}
        widths={widths}
        aspectRatio={aspectRatio}
        defaultFallback={false}
        isStoryPageImage
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

  const AuthourBlock = () => (
    <>
      <AuthorCard story={story} {...authorDetails} />
      <div styleName="timestamp-social-share">
        <PublishDetails story={story} opts={publishedDetails} template="story" timezone={timezone} />
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

  const BodyBlock = () => (
    <div styleName={`body-block ${isNumberedBullet ? "numbered-bullet-style" : ""}`}>
      {visibledCards.map((card, index) => {
        return (
          <React.Fragment key={card.id}>
            {!isNumberedBullet ? (
              <div styleName="bullet-style-dash" />
            ) : (
              <div styleName="bullet-style-number">{index + 1}.</div>
            )}
            <StoryElementCard
              story={story}
              card={card}
              key={card.id}
              config={storyElementsConfig}
              adComponent={adComponent}
              widgetComp={widgetComp}
            />
          </React.Fragment>
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
    </div>
  );
  const SideColumnBlock = () =>
    asideCollection && (
      <AsideCollection
        {...asideCollection}
        adComponent={adComponent}
        widgetComp={widgetComp}
        sticky={true}
        storyId={storyId}
        opts={publishedDetails}
      />
    );

  // Templates
  const DefaultTemplate = () => (
    <>
      <HeroImageBlock
        aspectRatio={[
          [16, 9],
          [16, 6],
        ]}
      />
      <div styleName="grid-container">
        <div styleName="full-grid">
          <CaptionAttributionBlock />
        </div>
        <div data-type-column="left" styleName="left-column">
          <HeadlineBlock />
          <AuthourBlock />
          <BodyBlock />
        </div>
        <div data-type-column="right" styleName="right-column">
          <SideColumnBlock />
        </div>
      </div>
    </>
  );
  const HeroPriority = () => (
    <div styleName="hero-priority-template">
      <div styleName="grid-container">
        <div styleName="full-grid">
          <HeroImageBlock />
        </div>
        <div styleName="center-column">
          <CaptionAttributionBlock />
          <HeadlineBlock />
          <AuthourBlock />
          <BodyBlock />
        </div>
      </div>
    </div>
  );
  const HeadlinePriority = () => (
    <div styleName="headline-priority-template">
      <div styleName="grid-container">
        <div styleName="headline-priority-grid">
          <HeadlineBlock />
        </div>
        <div styleName="left-column">
          <HeroImageBlock />
          <CaptionAttributionBlock />
          <AuthourBlock />
          <BodyBlock />
        </div>
        <div styleName="right-column">
          <SideColumnBlock />
        </div>
      </div>
    </div>
  );
  const HeadlineHeroPriority = () => (
    <div styleName="headline-hero-priority-template">
      <div styleName="grid-container">
        <div styleName="center-column">
          <HeadlineBlock />
        </div>
        <div styleName="full-grid">
          <HeroImageBlock />
        </div>
        <div styleName="center-column">
          <CaptionAttributionBlock />
          <AuthourBlock />
          <BodyBlock />
        </div>
      </div>
    </div>
  );
  const HeroOverlay = () => (
    <div styleName="hero-overlay-template">
      <div styleName="grid-container">
        <div styleName="full-grid hero-faded-relative">
          <div styleName="hero-faded-wrapper">
            <div styleName="headline-content-holder">
              <HeadlineBlock />
            </div>
          </div>
          <HeroImageBlock
            aspectRatio={[
              [2, 3],
              [16, 9],
            ]}
          />
        </div>
      </div>
      <div styleName="grid-container">
        <div styleName="center-column">
          <CaptionAttributionBlock />
          <AuthourBlock />
          <BodyBlock />
        </div>
      </div>
    </div>
  );
  const HeadlineSideway = () => (
    <div styleName="headline-sideway-template">
      <div styleName="sideway-grid">
        <div styleName="sideway-headline">
          <HeadlineBlock />
        </div>
        <div styleName="sideway-hero">
          <HeroImageBlock
            aspectRatio={[
              [16, 9],
              [4, 3],
            ]}
          />
          <CaptionAttributionBlock />
        </div>
      </div>
      <div styleName="grid-container">
        <div styleName="center-column">
          <AuthourBlock />
          <BodyBlock />
        </div>
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (templateType) {
      case "hero-priority":
        return <HeroPriority />;
      case "headline-priority":
        return <HeadlinePriority />;
      case "headline-hero-priority":
        return <HeadlineHeroPriority />;
      case "hero-overlay":
        return <HeroOverlay />;
      case "headline-sideway":
        return <HeadlineSideway />;
      default:
        return <DefaultTemplate />;
    }
  };
  const dataTestId = templateType ? `listicle-story-${templateType}` : "listicle-story";
  return (
    <div
      data-test-id={dataTestId}
      className="arrow-component arr--content-wrapper arr--listicle-story-template-wrapper"
      style={{ backgroundColor: theme }}
      styleName="story-content-inner-wrapper"
    >
      {renderTemplate()}
    </div>
  );
};

ListicleStoryTemplate.propTypes = {
  story: PropTypes.object,
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
  premiumStoryIconConfig: PropTypes.object,
};

export default StateProvider(ListicleStoryTemplate);
