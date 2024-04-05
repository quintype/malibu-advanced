import React from "react";
import get from "lodash.get";
import { collectionToStories } from "@quintype/components";
import { getSlot, generateNavigateSlug, navigateTo } from "../../../utils/utils";
import { CollectionName } from "../../Atoms/CollectionName";
import { StoryCard } from "../../Molecules/StoryCard";
import { HeroImage } from "../../Atoms/HeroImage";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { StateProvider } from "../../SharedContext";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import PropTypes from "prop-types";
import "./three-col-seven-story.m.css";
import { useDispatch, useSelector } from "react-redux";

const ThreeColSevenStory = ({ collection, config = {} }) => {
  const storyItems = collectionToStories(collection);
  if (!storyItems.length) return null;

  const {
    collectionNameBorderColor = "",
    borderColor = "",
    border = "",
    theme = "",
    slotConfig = [],
    collectionNameTemplate = "",
    footerSlotConfig = {},
    footerButton = "",
    customCollectionName,
    navigate = true,
    isHorizontal = true,
    horizontalImageLast = false,
  } = config;
  const { footerSlot } = footerSlotConfig;
  const { type = "story", component } = get(slotConfig, [0], {});
  const borderBottomStyle = border === "bottom" ? "card-bottom" : "card";
  const lastCardBorderBottom = slotConfig === "ad" ? "border-unset" : "";
  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig);

  const storyCardComponent = (story) => {
    return (
      <StoryCard
        story={story}
        theme={theme}
        border={border}
        config={config}
        isHorizontal={isHorizontal}
        isHorizontalWithImageLast={horizontalImageLast}
      >
        <HeroImage
          story={story}
          isHorizontal
          aspectRatio={[
            [16, 9],
            [16, 9],
          ]}
        />
        <StorycardContent
          theme={theme}
          border={border}
          story={story}
          borderColor={borderColor}
          config={config}
          isHorizontalMobile
          collectionId={collection.id}
        />
      </StoryCard>
    );
  };

  const storyCardWidthoutBorder = (story) => {
    return (
      <StoryCard
        story={story}
        theme={theme}
        config={config}
        isHorizontal={isHorizontal}
        isHorizontalWithImageLast={horizontalImageLast}
      >
        <HeroImage
          story={story}
          isHorizontal
          aspectRatio={[
            [16, 9],
            [16, 9],
          ]}
        />
        <StorycardContent
          theme={theme}
          story={story}
          borderColor={borderColor}
          config={config}
          collectionId={collection.id}
        />
      </StoryCard>
    );
  };

  const storySlot = () => {
    return (
      <div>
        {storyItems.slice(5, 6).map((story, index) => {
          return (
            <div
              styleName={`${borderBottomStyle}`}
              key={`default-${index}`}
              className="three-col-seven-story_three-col-storycard-wrapper"
            >
              {storyCardComponent(story)}
            </div>
          );
        })}
        {storyItems.slice(6, 7).map((story, index) => {
          return (
            <div
              styleName={`${borderBottomStyle}`}
              key={`default-${index}`}
              className="three-col-seven-story_three-col-storycard-wrapper"
            >
              {storyCardWidthoutBorder(story)}
            </div>
          );
        })}
      </div>
    );
  };

  const slot = getSlot(type, component, storySlot);
  const footerSlotComp = footerSlot ? footerSlot() : null;

  const Cards = border === "bottom" ? "cards" : "";

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="three-col-seven-stories"
      style={{ backgroundColor: theme || "initial" }}
    >
      <div styleName="wrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
          customCollectionName={customCollectionName}
          navigate={navigate}
        />
        <div styleName="three-col-five-stories" className="three-col-seven-story_three-col-five-stories">
          <div styleName={`${Cards}`} className="three-col-seven-story_three-col-five-card">
            {storyItems.slice(0, 1).map((story, index) => {
              return (
                <div
                  styleName={`${borderBottomStyle}`}
                  key={`default-${index}`}
                  className="three-col-seven-story_three-col-storycard-wrapper"
                >
                  <StoryCard
                    story={story}
                    theme={theme}
                    aspectRatio={[
                      [16, 9],
                      [16, 9],
                    ]}
                    headerLevel="5"
                    borderColor={borderColor}
                    config={config}
                    collectionId={collection.id}
                  />
                </div>
              );
            })}
          </div>

          <div styleName={`${Cards}`} className="three-col-seven-story_three-col-five-card">
            {storyItems.slice(1, 3).map((story, index) => {
              return (
                <div
                  styleName={`${borderBottomStyle}`}
                  key={`default-${index}`}
                  className="three-col-seven-story_three-col-storycard-wrapper"
                >
                  {storyCardComponent(story)}
                </div>
              );
            })}
            {storyItems.slice(3, 4).map((story, index) => {
              return (
                <div
                  styleName={`${borderBottomStyle}`}
                  key={`default-${index}`}
                  className="three-col-seven-story_three-col-storycard-wrapper"
                >
                  {storyCardWidthoutBorder(story)}
                </div>
              );
            })}
          </div>
          <div className="three-col-seven-story_three-col-five-card">
            {storyItems.slice(4, 5).map((story, index) => {
              return (
                <div
                  styleName={`${borderBottomStyle} ${lastCardBorderBottom}`}
                  key={`default-${index}`}
                  className="three-col-seven-story_three-col-storycard-wrapper"
                >
                  {storyCardComponent(story)}
                </div>
              );
            })}
            <div styleName="ads" className="three-col-seven-story_three-col-seven-ad">
              {slot}
            </div>
          </div>
        </div>
        <LoadmoreButton
          template={footerButton}
          collection={collection}
          config={config}
          navigate={() => navigateTo(dispatch, url)}
          qtConfig={qtConfig}
        />
        {footerSlotComp}
      </div>
    </div>
  );
};

ThreeColSevenStory.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    borderColor: PropTypes.string,
    theme: PropTypes.string,
    border: PropTypes.string,
    slotConfig: PropTypes.array,
    footerButton: PropTypes.string,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
    horizontalImageLast: PropTypes.bool,
  }),
};

export default StateProvider(ThreeColSevenStory);
