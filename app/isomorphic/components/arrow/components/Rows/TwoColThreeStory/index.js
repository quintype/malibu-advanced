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

import "./two-col-three-story.m.css";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash.get";

export const TwoColThreeStories = ({ collection, config = {} }) => {
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
      data-test-id="two-col-three-stories"
      style={{ backgroundColor: theme, color: textColor }}>
      <div styleName="two-col-three-story">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="wrapper">
          <div styleName="first-card">
            <StoryCard
              story={items[0]}
              theme={theme}
              border={border}
              bgImgContentOverlap
              headerLevel="2"
              aspectRatio={[[16, 9], [16, 9]]}
              config={config}>
              <HeroImage story={items[0]} aspectRatio={[[16, 9], [16, 9]]} />
              <StorycardContent
                story={items[0]}
                headerLevel="2"
                border={border}
                theme={theme}
                borderColor={borderColor}
                config={config}
              />
            </StoryCard>
          </div>

          <div>
            {items.slice(1, 3).map((story, index) => {
              if (index === 1) {
                return (
                  <div key={index}>
                    <StoryCard story={story} border={border} theme={theme} isHorizontalMobile config={config}>
                      <HeroImage story={story} isHorizontalMobile />
                      <StorycardContent
                        theme={theme}
                        border={border}
                        story={story}
                        isHorizontalMobile
                        borderColor={borderColor}
                        config={config}
                      />
                    </StoryCard>
                  </div>
                );
              } else
                return (
                  <div styleName="storycard" key={index}>
                    <StoryCard story={story} border={border} theme={theme} isHorizontalMobile config={config}>
                      <HeroImage story={story} isHorizontalMobile />
                      <StorycardContent
                        theme={theme}
                        border={border}
                        story={story}
                        isHorizontalMobile
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

export default StateProvider(TwoColThreeStories);

TwoColThreeStories.propTypes = {
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
