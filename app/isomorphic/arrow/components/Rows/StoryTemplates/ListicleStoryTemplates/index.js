/* eslint-disable react/prop-types */
/* eslint-disable react/no-unknown-property */
import { SocialShare } from "@quintype/components";
import React from "react";
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
import { Paywall } from "../../Paywall";
import { MetypeCommentsWidget } from "../../../../../components/Metype/commenting-widget";
import { MetypeReactionsWidget } from "../../../../../components/Metype/reaction-widget";

const StoryTemplateListicle = ({
  story = {},
  accessLoading = false,
  config = {},
  storyElementsConfig,
  adComponent,
  widgetComp = () => {},
  firstChild,
  secondChild,
  enableDarkMode,
  loadRelatedStories,
  visibleCardsRender = null,
  hasAccess,
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

  // Metype widgets
  const metypeConfig = useSelector((state) => get(state, ["qt", "config", "publisher-attributes", "metypeConfig"], {}));
  const isMetypeEnabled = useSelector((state) =>
    get(state, ["qt", "config", "publisher-attributes", "enableMetype"], true)
  );
  const jwtToken = useSelector((state) => get(state, ["userReducer", "jwt_token"], null));

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
      <StoryReview theme={theme} story={story} />
      <div styleName={`body-block ${isNumberedBullet ? "numbered-bullet-style" : ""}`}>
        {visibleCardsRender ? (
          visibleCardsRender(visibleCards, firstChild)
        ) : (
          <>
            {visibleCards}
            {firstChild}
          </>
        )}
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

  // Templates
  const defaultTemplate = ({ hasAccess }) => (
    <>
      <HeroImageBlock aspectRatio={[[16, 9], [16, 6]]} />
      <div styleName="grid-container">
        <div styleName="full-grid">
          <CaptionAttributionBlock />
        </div>
        <div data-type-column="left" styleName="left-column">
          <HeadlineBlock />
          <AuthorBlock />
          <BodyBlock hasAccess={hasAccess} />
          {isMetypeEnabled && (
            <>
              <MetypeReactionsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                storyUrl={story.url}
                storyId={story.id}
              />
              <MetypeCommentsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                pageURL={story.url}
                primaryColor={metypeConfig.primaryColor}
                className={metypeConfig.className}
                jwt={jwtToken}
                fontUrl={metypeConfig.fontFamilyUrl}
                fontFamily={metypeConfig.fontFamily}
                storyId={story.id}
              />
            </>
          )}
        </div>
        <div data-type-column="right" styleName="right-column">
          <SideColumnBlock />
        </div>
      </div>
    </>
  );
  const heroPriority = ({ hasAccess }) => (
    <div styleName="hero-priority-template">
      <div styleName="grid-container">
        <div styleName="full-grid">
          <HeroImageBlock />
        </div>
        <div styleName="center-column">
          <CaptionAttributionBlock />
          <HeadlineBlock />
          <AuthorBlock />
          <BodyBlock hasAccess={hasAccess} />
          {isMetypeEnabled && (
            <>
              <MetypeReactionsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                storyUrl={story.url}
                storyId={story.id}
              />
              <MetypeCommentsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                pageURL={story.url}
                primaryColor={metypeConfig.primaryColor}
                className={metypeConfig.className}
                jwt={jwtToken}
                fontUrl={metypeConfig.fontFamilyUrl}
                fontFamily={metypeConfig.fontFamily}
                storyId={story.id}
              />
            </>
          )}
        </div>
        <HorizontalAsideCollection />
      </div>
    </div>
  );
  const headlinePriority = ({ hasAccess }) => (
    <div styleName="headline-priority-template">
      <div styleName="grid-container">
        <div styleName="headline-priority-grid">
          <HeadlineBlock />
        </div>
        <div styleName="left-column">
          <HeroImageBlock />
          <CaptionAttributionBlock />
          <AuthourBlock />
          <BodyBlock hasAccess={hasAccess} />
          {isMetypeEnabled && (
            <>
              <MetypeReactionsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                storyUrl={story.url}
                storyId={story.id}
              />
              <MetypeCommentsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                pageURL={story.url}
                primaryColor={metypeConfig.primaryColor}
                className={metypeConfig.className}
                jwt={jwtToken}
                fontUrl={metypeConfig.fontFamilyUrl}
                fontFamily={metypeConfig.fontFamily}
                storyId={story.id}
              />
            </>
          )}
        </div>
        <div styleName="right-column">
          <SideColumnBlock />
        </div>
      </div>
    </div>
  );
  const headlineHeroPriority = ({ hasAccess }) => (
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
          <BodyBlock hasAccess={hasAccess} />
          {isMetypeEnabled && (
            <>
              <MetypeReactionsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                storyUrl={story.url}
                storyId={story.id}
              />
              <MetypeCommentsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                pageURL={story.url}
                primaryColor={metypeConfig.primaryColor}
                className={metypeConfig.className}
                jwt={jwtToken}
                fontUrl={metypeConfig.fontFamilyUrl}
                fontFamily={metypeConfig.fontFamily}
                storyId={story.id}
              />
            </>
          )}
        </div>
        <HorizontalAsideCollection />
      </div>
    </div>
  );
  const heroOverlay = ({ hasAccess }) => (
    <div styleName="hero-overlay-template">
      <div styleName="grid-container">
        <div styleName="full-grid hero-faded-relative">
          <div styleName="hero-faded-wrapper">
            <div styleName="headline-content-holder">
              <HeadlineBlock />
            </div>
          </div>
          <HeroImageBlock aspectRatio={[[2, 3], [16, 9]]} />
        </div>
      </div>
      <div styleName="grid-container">
        <div styleName="center-column">
          <CaptionAttributionBlock />
          <AuthourBlock />
          <BodyBlock hasAccess={hasAccess} />
          {isMetypeEnabled && (
            <>
              <MetypeReactionsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                storyUrl={story.url}
                storyId={story.id}
              />
              <MetypeCommentsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                pageURL={story.url}
                primaryColor={metypeConfig.primaryColor}
                className={metypeConfig.className}
                jwt={jwtToken}
                fontUrl={metypeConfig.fontFamilyUrl}
                fontFamily={metypeConfig.fontFamily}
                storyId={story.id}
              />
            </>
          )}
        </div>
        <HorizontalAsideCollection />
      </div>
    </div>
  );
  const headlineSideway = ({ hasAccess }) => (
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
          <AuthourBlock />
          <BodyBlock hasAccess={hasAccess} />
          {isMetypeEnabled && (
            <>
              <MetypeReactionsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                storyUrl={story.url}
                storyId={story.id}
              />
              <MetypeCommentsWidget
                host={metypeConfig.metypeHost}
                accountId={metypeConfig.metypeAccountId}
                pageURL={story.url}
                primaryColor={metypeConfig.primaryColor}
                className={metypeConfig.className}
                jwt={jwtToken}
                fontUrl={metypeConfig.fontFamilyUrl}
                fontFamily={metypeConfig.fontFamily}
                storyId={story.id}
              />
            </>
          )}
        </div>
        <HorizontalAsideCollection />
      </div>
    </div>
  );

  const renderTemplate = (templateType, { story, config }, hasAccess) => {
    switch (templateType) {
      case "hero-priority":
        return heroPriority({ story, config }, hasAccess);
      case "headline-priority":
        return headlinePriority({ story, config }, hasAccess);
      case "headline-hero-priority":
        return headlineHeroPriority({ story, config }, hasAccess);
      case "hero-overlay":
        return heroOverlay({ story, config }, hasAccess);
      case "headline-sideway":
        return headlineSideway({ story, config }, hasAccess);
      default:
        return defaultTemplate();
    }
  };
  return <>{renderTemplate(templateType, { story, config }, hasAccess)}</>;
};

StoryTemplateListicle.propTypes = {
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
  hasAccess: PropTypes.func,
};

const ListicleStoryTemplate = ({
  story = {},
  config = {},
  storyElementsConfig,
  adComponent,
  widgetComp = () => {},
  firstChild,
  secondChild,
}) => {
  const { theme = "", templateType = "" } = config;
  const timezone = useSelector((state) => get(state, ["qt", "data", "timezone"], null));
  const dataTestId = templateType ? `listicle-story-${templateType}` : "listicle-story";
  return (
    <div
      data-test-id={dataTestId}
      className="arrow-component arr--content-wrapper arr--listicle-story-template-wrapper"
      style={{ backgroundColor: theme || "initial" }}>
      {renderTemplate()}
    </div>
  );
};
ListicleStoryTemplate.propTypes = {
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
  premiumStoryIconConfig: PropTypes.object,
  enableDarkMode: PropTypes.bool,
  loadRelatedStories: PropTypes.func,
  visibleCardsRender: PropTypes.func | undefined
};
export default StateProvider(ListicleStoryTemplate, StoryTemplateListicle);
