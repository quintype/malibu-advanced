import React from "react";
import PropTypes from "prop-types";

import { collectionToStories } from "@quintype/components";
import { CollectionName } from "../../Atoms/CollectionName";
import { HeroImage } from "../../Atoms/HeroImage";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { StoryCard } from "../../Molecules/StoryCard";
import { StateProvider } from "../../SharedContext";
import { generateNavigateSlug, getTextColor, navigateTo, getSlot, rgbToHex } from "../../../utils/utils";
import { Headline } from "../../Atoms/Headline";
import { Subheadline } from "../../Atoms/Subheadline";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { SectionTag } from "../../Atoms/SectionTag";
import { LoadmoreButton } from "../../Atoms/Loadmore";

import "./two-col-seven-stories.m.css";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";

export const TwoColSevenStories = ({ collection, config = {} }) => {
  const items = collectionToStories(collection);
  const {
    border = "",
    borderColor = "",
    collectionNameBorderColor = "",
    theme = "",
    collectionNameTemplate = "",
    footerButton = "",
    slotConfig = [],
    localizationConfig = {},
  } = config;

  if (items.length < 1) {
    return null;
  }

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig);
  const { type = "story", component } = get(slotConfig, [0], {});
  const isAdWidgetEnabled = type === "ad" || type === "widget";
  const adWidgetSlot = isAdWidgetEnabled ? getSlot(type, component) : null;
  const textColor = getTextColor(theme);
  const sectionTagBorderColor = rgbToHex(borderColor);

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="two-col-seven-stories"
      style={{ backgroundColor: theme, color: textColor }}
    >
      <div styleName="two-col-seven-story">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="wrapper">
          <div styleName="first-card" className="first-card">
            <StoryCard
              story={items[0]}
              theme={theme}
              border={border}
              bgImgContentOverlap
              headerLevel="2"
              aspectRatio={[
                [16, 9],
                [16, 9],
              ]}
              config={config}
            >
              <HeroImage
                config={config}
                story={items[0]}
                aspectRatio={[
                  [16, 9],
                  [16, 9],
                ]}
              />
              <StorycardContent story={items[0]} headerLevel="3" config={config}>
                <SectionTag story={items[0]} borderColor={sectionTagBorderColor} />
                <Headline premiumStoryIconConfig={config} story={items[0]} headerLevel={2} />
                <Subheadline story={items[0]} />
                <AuthorWithTime story={items[0]} config={localizationConfig} />
              </StorycardContent>
            </StoryCard>
          </div>
          <span styleName={`divider ${textColor}`} className={`divider ${textColor}`} />
          <div styleName="other-cards" className="other-cards">
            {items.slice(1, 5).map((story, index) => {
              return (
                <div key={index}>
                  <StoryCard story={story} border={border} theme={theme} config={config}>
                    <HeroImage
                      config={config}
                      story={story}
                      aspectRatio={[
                        [16, 9],
                        [16, 9],
                      ]}
                    />
                    <StorycardContent
                      theme={theme}
                      border={border}
                      story={story}
                      isHorizontalMobile
                      borderColor={borderColor}
                      config={config}
                      separator="dot"
                    />
                  </StoryCard>
                </div>
              );
            })}
            {adWidgetSlot ? (
              <div styleName="ad-wrapper">{adWidgetSlot}</div>
            ) : (
              items.slice(5, 7).map((story, index) => {
                return (
                  <div key={index}>
                    <StoryCard story={story} border={border} theme={theme} config={config}>
                      <HeroImage
                        config={config}
                        story={story}
                        aspectRatio={[
                         [16, 9],
                         [16, 9],
                        ]}
                      />
                      <StorycardContent
                        theme={theme}
                        border={border}
                        story={story}
                        isHorizontalMobile
                        borderColor={borderColor}
                        config={config}
                        separator="dot"
                      />
                    </StoryCard>
                  </div>
                );
              })
            )}
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
    </div>
  );
};

export default StateProvider(TwoColSevenStories);

TwoColSevenStories.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    borderColor: PropTypes.string,
    theme: PropTypes.string,
    border: PropTypes.string,
    footerButton: PropTypes.string,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
  }),
};

TwoColSevenStories.defaultProps = {
  theme: "#ffffff",
  border: "",
};
