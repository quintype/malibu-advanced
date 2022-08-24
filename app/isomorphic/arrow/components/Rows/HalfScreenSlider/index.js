import React from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";

import { collectionToStories } from "@quintype/components";
import { CollectionName } from "../../Atoms/CollectionName";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { SliderHorizontalCard } from "../../Molecules/SliderHorizontalCard";
import { StateProvider } from "../../SharedContext";
import { getTextColor, getNumberOfStoriesToShow, generateNavigateSlug, navigateTo } from "../../../utils/utils";
import { ScrollSnap } from "../../Atoms/ScrollSnap";

import "./half-screen-slider.m.css";

const HalfScreenSlider = ({ collection, config = {} }) => {
  const {
    collectionNameBorderColor = "",
    borderColor = "",
    theme = "",
    border = "",
    numberOfStoriesToShow = 1,
    collectionNameTemplate,
    footerButton = "",
    footerSlotConfig = {},
    navigationArrows = true,
    slideIndicator = "none",
    isInfinite = false
  } = config;
  const { footerSlot } = footerSlotConfig;
  const items = collectionToStories(collection);
  const textColor = getTextColor(theme);
  const isBorderEnable = border === "full" ? "border" : "";
  if (items.length < 1) {
    return null;
  }

  const footerSlotComp = footerSlot ? footerSlot() : null;
  const showNumberOfStoriesToShow = getNumberOfStoriesToShow(numberOfStoriesToShow);

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig);

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="half-screen-slider"
      style={{ backgroundColor: theme, color: textColor }}>
      <div styleName="half-screen-slider">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName={`wrapper ${isBorderEnable} ${textColor}`}>
          <ScrollSnap isArrow={navigationArrows} slideIndicator={slideIndicator} isInfinite={isInfinite}>
            {items.slice(0, showNumberOfStoriesToShow).map((story, index) => {
              return (
                <SliderHorizontalCard
                  headerLevel="2"
                  key={index}
                  story={story}
                  isHorizontal
                  borderColor={borderColor}
                  config={config}
                />
              );
            })}
          </ScrollSnap>
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
  );
};
export default StateProvider(HalfScreenSlider);
HalfScreenSlider.propTypes = {
  footerButton: PropTypes.string,
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  // config is the configuration of the row
  config: PropTypes.object.isRequired,
  // border around the storycard
  border: PropTypes.string,
  // speed of the slider(ms)
  autoplaySpeed: PropTypes.number,
  // no of slides in slider
  numberOfStoriesToShow: PropTypes.number,
  // background and text color configuration
  theme: PropTypes.string,
  // style of the row title
  collectionTemplate: PropTypes.string,
  collectionNameBorderColor: PropTypes.string,
  // section tag border color
  borderColor: PropTypes.string
};
