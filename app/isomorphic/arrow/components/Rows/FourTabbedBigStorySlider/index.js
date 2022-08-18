import React, { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";

import { collectionToStories, Link } from "@quintype/components";
import { StateProvider } from "../../SharedContext";
import {
  generateNavigateSlug,
  getStoryUrl,
  getTextColor,
  isExternalStory,
  navigateTo,
  rgbToHex
} from "../../../utils/utils";
import { CollectionName } from "../../Atoms/CollectionName";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { StoryCard } from "../../Molecules/StoryCard";
import { HeroImage } from "../../Atoms/HeroImage";
import { StorycardContent } from "../../../components/Molecules/StorycardContent";
import { SectionTag } from "../../Atoms/SectionTag";
import { Headline } from "../../Atoms/Headline";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { Subheadline } from "../../Atoms/Subheadline";

import "./four-tabbed-big-story-slider.m.css";

export const FourTabbedBigStorySlider = ({ collection, config = {} }) => {
  const items = collectionToStories(collection);
  if (items.length < 1) {
    return null;
  }
  const {
    collectionNameBorderColor = "",
    theme = "",
    collectionNameTemplate = "",
    footerSlotConfig = {},
    footerButton = "",
    borderColor = "",
    showSubheadline = true,
    showButton = true
  } = config;
  const { footerSlot } = footerSlotConfig;
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig);

  const [currentStory, updateCurrentStory] = useState(items[0]);
  const [active, handleActive] = useState(0);

  const footerSlotComp = footerSlot ? footerSlot() : null;
  const textColor = getTextColor(theme);
  const dispatch = useDispatch();

  const updateActiveTab = (story, index) => {
    updateCurrentStory(story);
    handleActive(index);
  };

  const getActiveIndexStylename = (isActive) => {
    if (isActive) {
      return `active-story active-${textColor}-headline-container`;
    } else return "";
  };

  const getCustomStyleName = textColor === "light" ? "light-wrapper" : "";

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="two-col-three-stories"
      style={{ backgroundColor: theme, color: textColor }}>
      <div styleName={`four-tabbed-big-story-slider ${getCustomStyleName}`}>
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <StoryCard story={currentStory} useImageAsBackground>
          <HeroImage config={config} story={currentStory} aspectRatio={[[16, 9]]} />
          <div styleName="story-card-content">
            <StorycardContent story={currentStory}>
              <DefaultStoryCardContent
                story={currentStory}
                config={config}
                borderColor={borderColor}
                showSubheadline={showSubheadline}
              />
            </StorycardContent>
          </div>
        </StoryCard>
        <div styleName="stories-wrapper" className="stories-wrapper-ftbss">
          {items.map((story, index) => (
            <div
              styleName={`story-headline-container ${textColor}-headline-container ${getActiveIndexStylename(
                index === active
              )}`}
              onClick={() => updateActiveTab(story, index)}
              key={story.id}
              className={`story-headline-container ${getActiveIndexStylename(index === active)}`}>
              <Headline story={story} premiumStoryIconConfig={config} isLink={false} />
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
        <div styleName={`${showButton ? "" : "no-button-wrapper"}`}>{footerSlotComp}</div>
      </div>
    </div>
  );
};

const DefaultStoryCardContent = ({ story, config = {}, borderColor, showSubheadline }) => {
  const SectionTagborderColor = rgbToHex(borderColor);
  const { localizationConfig = {} } = config;
  return (
    <div>
      <SectionTag story={story} borderColor={SectionTagborderColor} isLightTheme />
      <Headline story={story} premiumStoryIconConfig={config} />
      <AuthorWithTime config={localizationConfig} story={story} isLightTheme />
      {showSubheadline && (
        <Link
          href={getStoryUrl(story, `/${story.slug}`)}
          externalLink={isExternalStory(story)}
          aria-label="sub-headline">
          <Subheadline story={story} />
        </Link>
      )}
    </div>
  );
};

export default StateProvider(FourTabbedBigStorySlider);

FourTabbedBigStorySlider.propTypes = {
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

DefaultStoryCardContent.propTypes = {
  story: PropTypes.object.isRequired,
  config: PropTypes.object,
  borderColor: PropTypes.string,
  showSubheadline: PropTypes.bool
};
