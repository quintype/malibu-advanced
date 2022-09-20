import React from "react";
import get from "lodash/get";
import { collectionToStories } from "@quintype/components";
import { getTextColor, getSlot, generateNavigateSlug, navigateTo } from "../../../utils/utils";
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
  if (storyItems.length < 1) {
    return null;
  }

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
      <StoryCard story={story} theme={theme} border={border} isHorizontal config={config}>
        <HeroImage
          story={story}
          isHorizontal
          aspectRatio={[
            [16, 9],
            [16, 9]
          ]}
        />
        <StorycardContent theme={theme} border={border} story={story} borderColor={borderColor} config={config} />
      </StoryCard>
    );
  };

  const storyCardWidthoutBorder = (story) => {
    return (
      <StoryCard story={story} theme={theme} isHorizontal config={config}>
        <HeroImage story={story} isHorizontal aspectRatio={[[16, 9], [16, 9]]} />
        <StorycardContent theme={theme} story={story} borderColor={borderColor} config={config} />
      </StoryCard>
    );
  };

  const storySlot = () => {
    return (
      <div>
        {storyItems.slice(5, 6).map((story, index) => {
          return (
            <div styleName={`${borderBottomStyle}`} key={`default-${index}`}>
              {storyCardComponent(story)}
            </div>
          );
        })}
        {storyItems.slice(6, 7).map((story, index) => {
          return (
            <div styleName={`${borderBottomStyle}`} key={`default-${index}`}>
              {storyCardWidthoutBorder(story)}
            </div>
          );
        })}
      </div>
    );
  };

  const slot = getSlot(type, component, storySlot);
  const footerSlotComp = footerSlot ? footerSlot() : null;

  const textColor = getTextColor(theme);
  const Cards = border === "bottom" ? "cards" : "";

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="three-col-seven-stories"
      style={{ backgroundColor: theme, color: textColor }}>
      <div styleName="wrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
          customCollectionName={customCollectionName}
          navigate={navigate}
        />
        <div styleName="three-col-five-stories">
          <div styleName={`${Cards}`}>
            {storyItems.slice(0, 1).map((story, index) => {
              return (
                <div styleName={`${borderBottomStyle}`} key={`default-${index}`}>
                  <StoryCard
                    story={story}
                    theme={theme}
                    aspectRatio={[[16, 9], [16, 9]]}
                    headerLevel="5"
                    borderColor={borderColor}
                    config={config}
                  />
                </div>
              );
            })}
          </div>

          <div styleName={`${Cards}`}>
            {storyItems.slice(1, 3).map((story, index) => {
              return (
                <div styleName={`${borderBottomStyle}`} key={`default-${index}`}>
                  {storyCardComponent(story)}
                </div>
              );
            })}
            {storyItems.slice(3, 4).map((story, index) => {
              return (
                <div styleName={`${borderBottomStyle}`} key={`default-${index}`}>
                  {storyCardWidthoutBorder(story)}
                </div>
              );
            })}
          </div>
          <div>
            {storyItems.slice(4, 5).map((story, index) => {
              return (
                <div styleName={`${borderBottomStyle} ${lastCardBorderBottom}`} key={`default-${index}`}>
                  {storyCardComponent(story)}
                </div>
              );
            })}
            <div styleName="ads">{slot}</div>
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
  }),
};

export default StateProvider(ThreeColSevenStory);
