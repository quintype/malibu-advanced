import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import { collectionToStories } from "@quintype/components";

import { CollectionName } from "../../Atoms/CollectionName";
import { StateProvider } from "../../SharedContext";
import { getTextColor, getNumberOfStoriesToShow, navigateTo, generateNavigateSlug } from "../../../utils/utils";
import { StoryCard } from "../../Molecules/StoryCard";
import { HeroImage } from "../../Atoms/HeroImage";
import { StorycardContent } from "../../Molecules/StorycardContent";
import PropTypes from "prop-types";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { ScrollSnap } from "../../Atoms/ScrollSnap";

import "./four-story-slider.m.css";

const FourStorySlider = ({ collection, config = {} }) => {
  const {
    collectionNameBorderColor = "",
    borderColor = "",
    theme = "",
    border = "",
    collectionNameTemplate = "",
    numberOfStoriesToShow = 0,
    footerButton = "",
    footerSlotConfig = {},
    navigationArrows = true,
    slideIndicator = "none",
    isInfinite = false
  } = config;
  const { footerSlot } = footerSlotConfig;
  const items = collectionToStories(collection);
  if (items.length < 1) {
    return null;
  }

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig);
  const [perView, setPerView] = useState(1);

  const showNumberOfStoriesToShow = getNumberOfStoriesToShow(numberOfStoriesToShow);
  const textColor = getTextColor(theme);
  const footerSlotComp = footerSlot ? footerSlot() : null;

  useEffect(() => {
    const deviceWidth = get(global, ["innerWidth"], 480);
    if (deviceWidth > 992) setPerView(4);
    else if (deviceWidth > 764) setPerView(3);
    else setPerView(1);
  }, []);

  const getItems = () => {
    return items.slice(0, showNumberOfStoriesToShow).map((story, index) => {
      return (
        <StoryCard story={story} theme={theme} border={border} key={index} config={config}>
          <HeroImage config={config} story={story} aspectRatio={[[16, 9]]} />
          <StorycardContent story={story} border={border} borderColor={borderColor} config={config} />
        </StoryCard>
      );
    });
  };

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="four-story-slider"
      style={{ backgroundColor: theme, color: textColor }}>
      <div styleName="four-story-slider-wrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        {items.length > 4 ? (
          <ScrollSnap
            isArrow={navigationArrows}
            perView={perView}
            slideIndicator={slideIndicator}
            isInfinite={isInfinite}>
            {getItems()}
          </ScrollSnap>
        ) : (
          <div styleName="story-grid">{getItems()}</div>
        )}
        <LoadmoreButton
          collection={collection}
          template={footerButton}
          config={config}
          navigate={() => navigateTo(dispatch, url)}
          qtConfig={qtConfig}
        />
        {footerSlotComp}
      </div>
    </div>
  );
};

FourStorySlider.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    // section tag border color
    borderColor: PropTypes.string,
    //   background color of the row
    theme: PropTypes.string,
    border: PropTypes.string,
    footerButton: PropTypes.string,
    // configure ad slot widget and story
    collectionNameTemplate: PropTypes.string,
    autoplaySpeed: PropTypes.number,
    // speed of the slider(ms)
    numberOfStoriesToShow: PropTypes.number,
    // no of slides in slider
    collectionNameBorderColor: PropTypes.string
  })
};

FourStorySlider.defaultProps = {
  theme: "#ffffff",
  slotConfig: "story",
  border: ""
};

export default StateProvider(FourStorySlider);
