import React from "react";
import get from "lodash/get";
import PropTypes from "prop-types";
import { StoryCard } from "../../Molecules/StoryCard";
import { collectionToStories } from "@quintype/components";
import { CollectionName } from "../../Atoms/CollectionName";
import { Headline } from "../../Atoms/Headline";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { HeroImage } from "../../Atoms/HeroImage";
import "./three-col-twelve-stories.m.css";
import { generateNavigateSlug, getTextColor, navigateTo, rgbToHex } from "../../../utils/utils";
import { StateProvider } from "../../SharedContext";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { useDispatch, useSelector } from "react-redux";
import { SectionTag } from "../../Atoms/SectionTag";

const getChildCollectionData = (collection = {}, config = {}, collectionIndex, qtConfig) => {
  const stories = collectionToStories(collection);
  if (!stories.length) return null;
  const [firstStory, ...otherStories] = stories;
  const {
    collectionNameTemplate,
    withSeparator = true,
    theme,
    footerButton = "",
    localizationConfig = {},
    collectionNameBorderColor = "",
    borderColor = "",
  } = config;

  const sectionTagBorderColor = rgbToHex(borderColor);
  const dispatch = useDispatch();
  const url = generateNavigateSlug(collection, qtConfig);

  return (
    <div styleName="column" style={{ order: collectionIndex }}>
      <div>
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div>
          <StoryCard story={firstStory} theme={theme} border={withSeparator ? "bottom" : ""} config={config}>
            <div styleName="big-card">
              <div styleName="big-card-hero-image">
                <HeroImage story={firstStory} aspectRatio={[[16, 9]]} />
              </div>
              <div styleName="big-card-content">
                <SectionTag story={firstStory} borderColor={sectionTagBorderColor} />
                <Headline story={firstStory} premiumStoryIconConfig={config} />
                <AuthorWithTime config={localizationConfig} story={firstStory} hideAuthorImage={true} />
              </div>
            </div>
          </StoryCard>
        </div>
        {otherStories.slice(0, 3).map((story) => (
          <div styleName="small-card" key={story.id}>
            <StoryCard story={story} theme={theme} border={withSeparator ? "bottom" : ""} config={config}>
              <div styleName="small-card-top-row">
                <div styleName="small-card-content">
                  <SectionTag story={story} borderColor={sectionTagBorderColor} />
                  <Headline story={story} premiumStoryIconConfig={config} />
                </div>
                <div styleName="small-card-hero-image">
                  <HeroImage story={story} aspectRatio={[[16, 9]]} />
                </div>
              </div>
              <AuthorWithTime config={localizationConfig} story={story} hideAuthorImage={true} />
            </StoryCard>
          </div>
        ))}
      </div>

      <LoadmoreButton
        template={footerButton}
        collection={collection}
        config={config}
        navigate={() => navigateTo(dispatch, url)}
        qtConfig={qtConfig}
      />
    </div>
  );
};

function ThreeColTwelveStories({ collection, config = {} }) {
  const childCollections = get(collection, ["items"], []).filter((collections) => collections.type === "collection");
  if (childCollections.length < 2) return null; // if number of collection is less than 2 return null
  const { theme = "", slotConfig = [] } = config;
  const isSlotTypeStory = get(slotConfig, [0, "type"], "story") === "story";
  const collectionCount = isSlotTypeStory ? 3 : 2;
  const textColor = getTextColor(theme);
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const adWidgetComponent = get(slotConfig, [0, "component"]);
  return (
    <div
      className="full-width-with-padding arrow-component arr--three-col-twelve-stories"
      data-test-id="three-col-twelve-stories"
      style={{ backgroundColor: theme, color: textColor }}
    >
      <div styleName="wrapper">
        {childCollections
          .slice(0, collectionCount)
          .map((childCollection, index) => getChildCollectionData(childCollection, config, index, qtConfig))}
        {!isSlotTypeStory && adWidgetComponent && <div styleName="ad-widget-container">{adWidgetComponent()}</div>}
      </div>
    </div>
  );
}

ThreeColTwelveStories.propTypes = {
  collection: PropTypes.object.isRequired,
  config: PropTypes.shape({
    borderColor: PropTypes.string,
    theme: PropTypes.string,
    border: PropTypes.string,
    slotConfig: PropTypes.array,
    footerButton: PropTypes.string,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
  }),
};

export default StateProvider(ThreeColTwelveStories);
