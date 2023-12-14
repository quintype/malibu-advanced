import { collectionToStories } from "@quintype/components";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";

import { CollectionName } from "../../Atoms/CollectionName";
import { getNumberOfStoriesToShow, navigateTo, generateNavigateSlug } from "../../../utils/utils";
import { HeroImage } from "../../Atoms/HeroImage";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { ScrollSnap } from "../../Atoms/ScrollSnap";
import { StateProvider } from "../../SharedContext";
import { StoryCard } from "../../Molecules/StoryCard";
import { StorycardContent } from "../../Molecules/StorycardContent";

import "./four-story-slider-portrait.m.css";

const FourStorySliderPortrait = ({ collection, config = {} }) => {
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const deviceWidth = get(global, ["innerWidth"], 480);
    if (deviceWidth > 992) setPerView(4);
    else if (deviceWidth > 764) setPerView(3);
    else setPerView(1);
  }, []);

  const items = collectionToStories(collection);
  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  if (items.length < 1) {
    return null;
  }
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
  const url = generateNavigateSlug(collection, qtConfig);

  const showNumberOfStoriesToShow = getNumberOfStoriesToShow(numberOfStoriesToShow);
  const footerSlotComp = footerSlot ? footerSlot() : null;

  const getItems = () => {
    return items.slice(0, showNumberOfStoriesToShow).map((story, index) => {
      return (
        <StoryCard story={story} theme={theme} border={border} key={index} config={config} useImageAsBackground>
          <HeroImage config={config} story={story} aspectRatio={[[9, 16]]} />
          <StorycardContent story={story} border={border} borderColor={borderColor} config={config} />
        </StoryCard>
      );
    });
  };

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="four-story-slider-portrait"
      style={{ backgroundColor: theme || "initial" }}>
      <div styleName="four-story-slider-portrait-wrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        {showNumberOfStoriesToShow > 4 ? (
          <ScrollSnap
            isArrow={navigationArrows}
            perView={perView}
            slideIndicator={slideIndicator}
            isInfinite={isInfinite}>
            {getItems()}
          </ScrollSnap>
        ) : (
          <div styleName="story-grid" className="four-story-slider-portrait-wrapper__story-grid">
            {getItems()}
          </div>
        )}
        <LoadmoreButton
          collection={collection}
          template={footerButton}
          config={config}
          navigate={() => navigateTo(dispatch, url)}
          qtConfig={qtConfig}
        />
        <div styleName="footer-slot-wrapper">{footerSlotComp}</div>
      </div>
    </div>
  );
};

FourStorySliderPortrait.propTypes = {
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

FourStorySliderPortrait.defaultProps = {
  theme: "#ffffff",
  slotConfig: "story",
  border: ""
};

export default StateProvider(FourStorySliderPortrait);
