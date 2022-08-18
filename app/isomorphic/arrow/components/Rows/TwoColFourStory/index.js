import React from "react";
import PropTypes from "prop-types";

import { collectionToStories } from "@quintype/components";
import { CollectionName } from "../../Atoms/CollectionName";
import { HeroImage } from "../../Atoms/HeroImage";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { StoryCard } from "../../Molecules/StoryCard";
import { StateProvider } from "../../SharedContext";
import { generateNavigateSlug, getTextColor, navigateTo } from "../../../utils/utils";

import { LoadmoreButton } from "../../Atoms/Loadmore";

import "./two-col-four-story.m.css";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash.get";

export const TwoColFourStories = ({ collection, config = {} }) => {
  const items = collectionToStories(collection);
  const {
    border = "",
    borderColor = "",
    collectionNameBorderColor = "",
    theme = "",
    collectionNameTemplate = "",
    footerSlotConfig = {},
    footerButton = ""
  } = config;
  const { footerSlot } = footerSlotConfig;
  const borderStyle = border === "bottom" ? "border-box" : "";
  const firstCardBorderStyle = border === "bottom" ? "first-card-border-box" : "";

  if (items.length < 1) {
    return null;
  }

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig);

  const textColor = getTextColor(theme);
  const footerSlotComp = footerSlot ? footerSlot() : null;
  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="two-col-four-stories"
      style={{ backgroundColor: theme, color: textColor }}>
      <div styleName="two-col-four-story" style={{ backgroundColor: theme, color: textColor }}>
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="wrapper">
          <div styleName={`first-card ${borderStyle} ${textColor}`}>
            <StoryCard
              story={items[0]}
              theme={theme}
              headerLevel="3"
              bgImgContentOverlap
              aspectRatio={[[16, 9], [16, 9]]}
              config={config}>
              <HeroImage story={items[0]} aspectRatio={[[16, 9], [16, 9]]} />
              <StorycardContent
                styleName={firstCardBorderStyle}
                story={items[0]}
                headerLevel="3"
                theme={theme}
                isHorizontal
                borderColor={borderColor}
                config={config}
              />
            </StoryCard>
          </div>

          <div styleName={`storyCards ${borderStyle} ${textColor}`}>
            {items.slice(1, 4).map((story, index) => {
              if (index === 2) {
                return (
                  <div styleName="card" key={index}>
                    <StoryCard
                      story={story}
                      theme={theme}
                      headerLevel="4"
                      isHorizontal
                      aspectRatio={[[16, 9], [16, 9]]}
                      config={config}>
                      <HeroImage story={story} isHorizontal aspectRatio={[[16, 9], [16, 9]]} />
                      <StorycardContent
                        theme={theme}
                        story={story}
                        isHorizontal
                        borderColor={borderColor}
                        config={config}
                      />
                    </StoryCard>
                  </div>
                );
              }
              return (
                <div styleName="card" key={index}>
                  <StoryCard
                    story={story}
                    theme={theme}
                    headerLevel="4"
                    isHorizontal
                    border={border}
                    aspectRatio={[[16, 9], [16, 9]]}
                    config={config}>
                    <HeroImage story={story} isHorizontal aspectRatio={[[16, 9], [16, 9]]} />
                    <StorycardContent
                      theme={theme}
                      story={story}
                      isHorizontal
                      borderColor={borderColor}
                      config={config}
                    />
                  </StoryCard>
                </div>
              );
            })}
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

export default StateProvider(TwoColFourStories);

TwoColFourStories.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    borderColor: PropTypes.string,
    theme: PropTypes.string,
    border: PropTypes.string,
    footerButton: PropTypes.string,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string
  })
};
