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
import { generateNavigateSlug, navigateTo, rgbToHex } from "../../../utils/utils";
import { StateProvider } from "../../SharedContext";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { useDispatch, useSelector } from "react-redux";
import { SectionTag } from "../../Atoms/SectionTag";
import { roundedCornerClass } from "../../../constants";

const getChildCollectionData = (collection = {}, config = {}, collectionIndex, qtConfig, parentCollectionId) => {
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
    borderColor = ""
  } = config;

  const sectionTagBorderColor = rgbToHex(borderColor);
  const dispatch = useDispatch();
  const url = generateNavigateSlug(collection, qtConfig);
  const languageDirection = get(qtConfig, ["language", "direction"], "ltr");
  const customClassName = languageDirection === "rtl" ? "rtl-threeColTwelveStories" : "ltr-threeColTwelveStories";

  const enableRoundedCorners = useSelector((state) =>
    get(state, ["qt", "config", "pagebuilder-config", "general", "enableRoundedCorners"], false)
  );

  const roundedCorners = enableRoundedCorners ? roundedCornerClass : "";

  return (
    <div styleName="column" style={{ order: collectionIndex }}>
      <CollectionName
        collection={collection}
        collectionNameTemplate={collectionNameTemplate}
        collectionNameBorderColor={collectionNameBorderColor}
      />
      <div>
        <div>
          <StoryCard story={firstStory} theme={theme} border={withSeparator ? "bottom" : ""} config={config}>
            <div styleName="big-card">
              <div styleName="big-card-hero-image" className={`${roundedCorners}`}>
                <HeroImage story={firstStory} aspectRatio={[[16, 9]]} />
              </div>
              <div styleName="big-card-content">
                <SectionTag story={firstStory} borderColor={sectionTagBorderColor} />
                <Headline story={firstStory} premiumStoryIconConfig={config} />
                <AuthorWithTime
                  config={localizationConfig}
                  story={firstStory}
                  hideAuthorImage={true}
                  collectionId={`${parentCollectionId}-${collection.id}`}
                />
              </div>
            </div>
          </StoryCard>
          {otherStories.slice(0, 3).map((story) => (
            <div styleName="small-card" key={story.id}>
              <StoryCard story={story} theme={theme} border={withSeparator ? "bottom" : ""} config={config}>
                <div styleName="small-card-top-row">
                  <div styleName="small-card-content" className={`${customClassName}`}>
                    <SectionTag story={story} borderColor={sectionTagBorderColor} />
                    <Headline story={story} premiumStoryIconConfig={config} />
                    <AuthorWithTime
                      config={localizationConfig}
                      story={story}
                      hideAuthorImage={true}
                      collectionId={`${parentCollectionId}-${collection.id}`}
                    />
                  </div>
                  <div styleName="small-card-hero-image">
                    <HeroImage story={story} aspectRatio={[[16, 9]]} />
                  </div>
                </div>
              </StoryCard>
            </div>
          ))}
        </div>
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
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const adWidgetComponent = get(slotConfig, [0, "component"]);
  return (
    <div
      className="full-width-with-padding arrow-component arr--three-col-twelve-stories"
      data-test-id="three-col-twelve-stories"
      style={{ backgroundColor: theme || "initial" }}>
      <div styleName="wrapper">
        {childCollections
          .slice(0, collectionCount)
          .map((childCollection, index) =>
            getChildCollectionData(childCollection, config, index, qtConfig, collection.id)
          )}
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
    collectionNameBorderColor: PropTypes.string
  })
};

export default StateProvider(ThreeColTwelveStories);
