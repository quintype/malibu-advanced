/* eslint-disable react/prop-types */
import React from "react";
import { number, string, func } from "prop-types";

import { getTextColor } from "../../../../utils/utils";
import { LeftArrow } from "../../../Svgs/left-arrow";
import { RightArrow } from "../../../Svgs/right-arrow";
import { useStateValue } from "../../../SharedContext";

import "./slider-arrow.m.css";

export const SliderArrow = ({
  selectedIndex,
  previousClick,
  nextClick,
  noOfItems,
  perView,
  languageDirection,
  sliderArrowStyles,
}) => {
  if (noOfItems < 1) {
    return null;
  }

  const config = useStateValue() || {};
  const textColor = getTextColor(config.theme);

  const rightArrowView = () => {
    if (selectedIndex >= noOfItems - perView) return false;
    return true;
  };

  const getLeftArrowClassName = languageDirection === "rtl" ? "left-arrow-rtl" : "left-arrow-ltr";
  const getRightArrowClassName = languageDirection === "rtl" ? "right-arrow-rtl" : "right-arrow-ltr";
  return (
    <>
      {selectedIndex !== 0 ? (
        <button
          onClick={previousClick}
          style={sliderArrowStyles}
          styleName={`arrow left-arrow-${textColor} ${getLeftArrowClassName}`}
          className={`left-arrow ${getLeftArrowClassName}`}
        >
          <LeftArrow color={textColor === "dark" ? "#fff" : "#333"} />
        </button>
      ) : null}

      {selectedIndex < noOfItems - 1 && rightArrowView() ? (
        <button
          onClick={nextClick}
          style={sliderArrowStyles}
          styleName={`arrow right-arrow-${textColor} ${getRightArrowClassName}`}
          className={`right-arrow ${getRightArrowClassName}`}
        >
          <RightArrow color={textColor === "dark" ? "#fff" : "#333"} />
        </button>
      ) : null}
    </>
  );
};

SliderArrow.propTypes = {
  noOfItems: number,
  perView: number,
  slideIndicator: string,
  previousClick: func,
  nextClick: func,
  selectedIndex: number,
  languageDirection: string,
};
