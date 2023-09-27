import React from "react";
import PropTypes from "prop-types";
import get from "lodash.get";
import { collectionToStories, Link } from "@quintype/components";
import { HeroImage } from "../../Atoms/HeroImage";
import { SectionTag } from "../../Atoms/SectionTag";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { CollectionName } from "../../Atoms/CollectionName";
import { Headline } from "../../Atoms/Headline";
import { getSlug } from "../../../utils/utils";
import { StateProvider } from "../../SharedContext";
import { StoryCard } from "../../Molecules/StoryCard/index";
import "./four-col-twelve-story.m.css";

function OtherNewsLinkComp({ slug, textColor, Icon, text }) {
  return (
    <Link href={slug} aria-label="arrow-icon">
      <div styleName="other-news-container">
        <div
          styleName="other-news-text"
          style={{
            color: textColor,
          }}
        >
          {text}
        </div>
        <div styleName="arrow-icon">
          <Icon />
        </div>
      </div>
    </Link>
  );
}
const SingleCol3Story = ({ collection, border, collectionNameTemplate, otherTextData, slug, theme, config = {} }) => {
  const items = collectionToStories(collection);
  if (items.length < 1) {
    return null;
  }
  const [firstStory, ...rest] = items || [];
  let text;
  let Icon;
  let textColor;
  let contentPosition = "top";
  const { localizationConfig = {} } = config;

  if (otherTextData) {
    text = otherTextData.text;
    Icon = otherTextData.Icon;
    textColor = otherTextData.textColor;
    contentPosition = otherTextData.contentPosition || contentPosition;
  }

  return (
    <div>
      <div styleName="collection-name-container">
        <CollectionName collection={collection} headerLevel="4" collectionNameTemplate={collectionNameTemplate} />
        {contentPosition === "top" && text && Icon && (
          <div styleName="other-news-top-container">
            <OtherNewsLinkComp textColor={textColor} Icon={Icon} slug={slug} text={text} />
          </div>
        )}
      </div>
      <div className="first-card">
        <StoryCard story={firstStory} border={border} theme={theme} config={config}>
          <HeroImage
            story={firstStory}
            aspectRatio={[
              [16, 9],
              [16, 9],
            ]}
          />
          <SectionTag story={firstStory} />
          <Headline story={firstStory} headerLevel="4" premiumStoryIconConfig={config} />
          <AuthorWithTime config={localizationConfig} story={firstStory} collectionId={collection.id} />
        </StoryCard>
      </div>

      <div className="second-card">
        {rest.slice(0, 2).map((story, index) => {
          return (
            <StoryCard config={config} key={index} story={story} isHorizontal theme={theme} border={border}>
              <HeroImage
                story={story}
                aspectRatio={[
                  [16, 9],
                  [16, 9],
                ]}
              />
              <div styleName="small-card-content-container" className="small-card-container">
                <Headline story={story} premiumStoryIconConfig={config} />
                <AuthorWithTime config={localizationConfig} story={story} collectionId={collection.id} />
              </div>
            </StoryCard>
          );
        })}
      </div>
      {contentPosition === "bottom" && text && Icon && (
        <div styleName="other-news-link">
          <OtherNewsLinkComp textColor={textColor} Icon={Icon} slug={slug} text={text} />
        </div>
      )}
    </div>
  );
};

const FourColTwelveStory = ({ collection = {}, publisherConfig = {}, config = {}, otherTextData }) => {
  const { theme = "", border = "", footerSlotConfig = {}, collectionNameTemplate = "" } = config;
  const { footerSlot } = footerSlotConfig;
  const footerSlotComp = footerSlot ? footerSlot() : null;

  const getFilteredCollection = get(collection, ["items"], []).filter(
    (collections) => collections.type === "collection"
  );

  // if number of collection is less than 4 return null
  if (getFilteredCollection.length < 4) return null;

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="four-col-twelve-stories"
      style={{ backgroundColor: theme || "initial" }}
    >
      <div styleName="columns-container">
        {getFilteredCollection.slice(0, 4).map((collection, index) => {
          const slugName = getSlug(collection, publisherConfig);
          return (
            <SingleCol3Story
              border={border}
              collection={collection}
              collectionNameTemplate={collectionNameTemplate}
              key={index}
              slug={slugName}
              otherTextData={otherTextData}
              theme={theme}
              config={config}
            />
          );
        })}
      </div>
      {footerSlotComp}
    </div>
  );
};

FourColTwelveStory.propTypes = {
  collection: PropTypes.object.isRequired,
  publisherConfig: PropTypes.object,
  otherTextData: PropTypes.shape({
    text: PropTypes.string,
    Icon: PropTypes.func,
    textColor: PropTypes.string,
  }),
  config: PropTypes.shape({
    theme: PropTypes.string,
    border: PropTypes.string,
    showSection: PropTypes.bool,
    showSubheadline: PropTypes.bool,
    showAuthor: PropTypes.bool,
    showTime: PropTypes.bool,
    showRowTitle: PropTypes.bool,
    collectionNameTemplate: PropTypes.string,
  }),
};

SingleCol3Story.propTypes = {
  collection: PropTypes.object.isRequired,
  border: PropTypes.string,
  collectionNameTemplate: PropTypes.string,
  slug: PropTypes.string,
  theme: PropTypes.string,
  otherTextData: PropTypes.shape({
    text: PropTypes.string,
    Icon: PropTypes.func,
    textColor: PropTypes.string,
    // can be either 'top' or 'bottom'
    contentPosition: PropTypes.string,
  }),
  config: PropTypes.object,
};

OtherNewsLinkComp.propTypes = {
  slug: PropTypes.string,
  textColor: PropTypes.string,
  Icon: PropTypes.func,
  text: PropTypes.string,
};

export default StateProvider(FourColTwelveStory);
