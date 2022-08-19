import React from "react";
import { array, number, string, func } from "prop-types";

import { getTextColor } from "../../../../utils/utils";
import { useStateValue } from "../../../SharedContext";

import "./slider-indicator.m.css";

export const SliderIndicator = ({ indicatorItems, indicatorClick, selectedIndex, indicatorType }) => {
  if (indicatorItems.length < 1) {
    return null;
  }

  const config = useStateValue() || {};
  const textColor = getTextColor(config.theme);

  return (
    <ul styleName="indicators" className="slider-indicators">
      {indicatorItems.map((_, index) => (
        <li
          key={`slider-${index}`}
          styleName="indicator"
          className="indicator"
          onClick={(e) => indicatorClick(e, index)}>
          <button
            styleName={`indicator-button indicator-${indicatorType} indicator-${indicatorType}-${textColor}`}
            className={`indicator-button indicator-${indicatorType}`}
            aria-pressed={selectedIndex === index ? "true" : "false"}></button>
        </li>
      ))}
    </ul>
  );
};

SliderIndicator.propTypes = {
  indicatorItems: array,
  perView: number,
  indicatorType: string,
  indicatorClick: func,
  selectedIndex: number
};
