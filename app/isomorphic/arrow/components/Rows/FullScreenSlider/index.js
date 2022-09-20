import React from "react";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";

import { CollectionName } from "../../Atoms/CollectionName";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { StoryCard } from "../../Molecules/StoryCard";
import { collectionToStories } from "@quintype/components";
import PropTypes from "prop-types";
import { getTextColor, getNumberOfStoriesToShow, generateNavigateSlug, navigateTo } from "../../../utils/utils";
import { StateProvider } from "../../SharedContext";
import { ScrollSnap } from "../../Atoms/ScrollSnap";

import "./full-screen-slider.m.css";

const FullScreenSlider = ({ collection = {}, config = {} }) => {
  const {
    collectionNameBorderColor = "",
    borderColor = "",
    theme = "",
    collectionNameTemplate = "",
    isFullWidth = false,
    numberOfStoriesToShow = 1,
    contentAlignment = "",
    footerButton = "",
    footerSlotConfig = {},
    navigationArrows = true,
    slideIndicator = "none",
    isInfinite = false,
    aspectRatio = [
      [16, 9],
      [4, 2],
    ]
  } = config;
  const { footerSlot } = footerSlotConfig;
  const items = collectionToStories(collection);
  const containerStyle = isFullWidth ? "full-width" : "container-width";
  const alignment = contentAlignment === "center" ? "content-align" : "";

  if (items.length < 1) {
    return null;
  }

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig);

  const showNumberOfStoriesToShow = getNumberOfStoriesToShow(numberOfStoriesToShow);
  const textColor = getTextColor(theme);
  const footerSlotComp = footerSlot ? footerSlot() : null;
  const imageAspectRatio = aspectRatio || [
    [16, 9],
    [4, 2],
  ];
  return (
    <div
      className={`arrow-component full-width-with-padding ${containerStyle}`}
      data-test-id="full-screen-slider"
      styleName="full-screen-slider-wrapper"
      style={{ backgroundColor: theme, color: textColor }}
    >
      <div styleName={`full-screen-slider ${containerStyle}`}>
        <span styleName={`${containerStyle}`}>
          <CollectionName
            styleName={`${containerStyle}`}
            collection={collection}
            collectionNameTemplate={collectionNameTemplate}
            collectionNameBorderColor={collectionNameBorderColor}
          />
        </span>
        <div styleName={`wrapper ${containerStyle} ${alignment}`}>
          <ScrollSnap isArrow={navigationArrows} slideIndicator={slideIndicator} isInfinite={isInfinite}>
            {items.slice(0, showNumberOfStoriesToShow).map((story, index) => {
              return (
                <StoryCard
                  key={index}
                  story={story}
                  useImageAsBackground
                  aspectRatio={imageAspectRatio}
                  headerLevel={"1"}
                  borderColor={borderColor}
                  config={config}
                />
              );
            })}
          </ScrollSnap>
        </div>
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

FullScreenSlider.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    // section tag border color
    borderColor: PropTypes.string,
    // backgroundColor and text color based on theme
    theme: PropTypes.string,
    // row title style
    collectionTemplate: PropTypes.string,
    // width of the slider
    isFullWidth: PropTypes.bool,
    // no of slides in slider
    numberOfStoriesToShow: PropTypes.number,
    // content alignment
    contentAlignment: PropTypes.string,
    footerButton: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
    // aspect ratio of the image
    aspectRatio: PropTypes.array,
  }),
};

export default StateProvider(FullScreenSlider);
