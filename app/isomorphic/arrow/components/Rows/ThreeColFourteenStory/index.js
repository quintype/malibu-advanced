import React from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import { collectionToStories } from "@quintype/components";

import { CollectionName } from "../../Atoms/CollectionName";
import { HeroImage } from "../../Atoms/HeroImage";
import { StoryCard } from "../../Molecules/StoryCard";
import { StateProvider } from "../../SharedContext";
import { getTextColor, getSlot } from "../../../utils/utils";
import { Headline } from "../../Atoms/Headline";
import { Subheadline } from "../../Atoms/Subheadline/index";
import { SectionTag } from "../../Atoms/SectionTag";

import "./three-col-fourteen-story.m.css";

const ThreeColFourteenStories = ({ collection = {}, config = {} }) => {
  const items = collectionToStories(collection);
  const {
    collectionNameBorderColor = "",
    borderColor = "",
    border = "",
    theme = "",
    collectionNameTemplate = "",
    slotConfig = [],
  } = config;
  const { type, component } = get(slotConfig, [0], {});

  if (items.length < 1) {
    return null;
  }

  const textColor = getTextColor(theme);

  const [firstStory, secondStory, ...restOftheStories] = items || [];

  const storyCallBack = (restOftheStories = []) => {
    return restOftheStories.slice(10, 13).map((item) => {
      return (
        <StoryCard
         key={item}
         story={item}
         isHorizontal
         aspectRatio={[
           [1, 1],
           [4, 3],
          ]}
         border={border}
        />
      )
    });
  };

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="three-col-fourteen-stories"
      style={{ backgroundColor: theme, color: textColor }}
    >
      <div styleName="wrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="storycards-row">
          <div styleName="card-with-separator first-card" className="first-card">
            <StoryCard
              story={firstStory}
              headerLevel="2"
              theme={theme}
              aspectRatio={[
                [16, 9],
                [16, 9],
              ]}
              config={config}
            >
              <HeroImage
                story={firstStory}
                aspectRatio={[
                  [16, 9],
                  [16, 9],
                ]}
              />
              <div className="card-content">
                <SectionTag story={firstStory} borderColor={borderColor} />
                <Headline story={firstStory} headerLevel="2" premiumStoryIconConfig={config} />
              </div>
              <Subheadline story={firstStory} forceShowAtom />
            </StoryCard>
            {secondStory && (
              <StoryCard
                border={border}
                story={secondStory}
                isHorizontal
                aspectRatio={[
                  [1, 1],
                  [4, 3],
                ]}
                borderColor={borderColor}
                config={config}
              />
            )}
          </div>
          <div styleName="card-with-separator second-card" className="second-card">
            {restOftheStories.length > 0 &&
              restOftheStories.slice(0, 6).map((item) => {
                return (
                  <StoryCard
                    key={item}
                    story={item}
                    isHorizontal
                    theme={theme}
                    aspectRatio={[
                      [1, 1],
                      [4, 3],
                    ]}
                    border={border}
                    borderColor={borderColor}
                    config={config}
                  />
                );
              })}
          </div>
          <div styleName="card-with-separator third-card" className="third-card">
            {restOftheStories.length > 0 &&
              restOftheStories.slice(6, 10).map((item) => {
                return (
                  <StoryCard
                    key={items}
                    story={item}
                    isHorizontal
                    theme={theme}
                    aspectRatio={[
                      [1, 1],
                      [4, 3],
                    ]}
                    border={border}
                    borderColor={borderColor}
                    config={config}
                  />
                );
              })}
            <div styleName="ad-slot">{getSlot(type, component, () => storyCallBack(restOftheStories))}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

ThreeColFourteenStories.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    theme: PropTypes.string,
    border: PropTypes.string,
    slotConfig: PropTypes.array,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
    borderColor: PropTypes.string,
  }),
};

export default StateProvider(ThreeColFourteenStories);
