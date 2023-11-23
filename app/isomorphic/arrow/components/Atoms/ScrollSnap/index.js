import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { array, number, bool, string } from "prop-types";
import get from "lodash/get";

import { SliderArrow } from "./SliderArrow";
import { SliderIndicator } from "./SliderIndicator";

import "./scroll-snap.m.css";

const smoothScroll = (node, topOrLeft, horizontal) => {
  node.scrollTo({
    [horizontal ? "left" : "top"]: topOrLeft,
    behavior: "smooth"
  });
};

const updateItemSelection = (index, languageDirection, scroller, noOfItems) => {
  const getScrollValue = Math.floor(scroller.current.scrollWidth * (index / noOfItems));
  const scrollValue = languageDirection === "rtl" ? getScrollValue * -1 : getScrollValue;
  smoothScroll(scroller.current, scrollValue, true);
};

const setIndicatorValue = (func, ms) => {
  let timeout;

  return () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func();
    }, ms);
  };
};

export const ScrollSnap = ({
  children,
  isArrow,
  interval,
  isInfinite,
  pauseOnHover,
  perView,
  slideIndicator,
  sliderArrowStyles = {}
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(false);
  const languageDirection = useSelector((state) => get(state, ["qt", "config", "language", "direction"], "ltr"));
  const noOfItems = children ? children.length : 0;
  const scroller = useRef(null);

  const numberOfIndicatorsToShow = children.length - (perView - 1);
  const indicatorItems = children.slice(0, numberOfIndicatorsToShow);

  useEffect(() => {
    if (scroller.current) {
      scroller.current.addEventListener(
        "scroll",
        setIndicatorValue(() => {
          const value = Math.round((scroller.current.scrollLeft / scroller.current.scrollWidth) * noOfItems);
          setSelectedIndex(Math.abs(value));
        }, 150)
      );

      // For Default Selection if selectedIndex is not 0 then manually select it
      if (selectedIndex !== 0) {
        updateItemSelection(selectedIndex);
      }
    }

    return () => {
      scroller.current.removeEventListener("scroll", setIndicatorValue);
    };
  }, []);

  // Infinite scroll
  useEffect(() => {
    if (isInfinite && !autoScroll) {
      const timer = setInterval(() => {
        infiniteScroll();
      }, interval);

      return () => {
        clearInterval(timer);
      };
    }
  }, [isInfinite, autoScroll]);

  const infiniteScroll = () => {
    setSelectedIndex((value) => {
      const newIndex = value === noOfItems - perView ? 0 : value + 1;
      updateItemSelection(newIndex, languageDirection, scroller, noOfItems);
      return newIndex;
    });
  };

  const pauseAutoPlay = () => {
    pauseOnHover && setAutoScroll(!autoScroll);
  };

  const indicatorClick = (e, newIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedIndex(newIndex);
    updateItemSelection(newIndex, languageDirection, scroller, noOfItems);
  };

  const nextClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (selectedIndex < noOfItems) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      updateItemSelection(newIndex, languageDirection, scroller, noOfItems);
    }
  };

  const previousClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newIndex = selectedIndex - 1;
    setSelectedIndex(newIndex);
    updateItemSelection(newIndex, languageDirection, scroller, noOfItems);
  };

  return (
    <div className="scroll-snap-container">
      <div
        styleName="wrapper"
        className="scroll-snap-wrapper"
        onMouseEnter={pauseAutoPlay}
        onMouseLeave={pauseAutoPlay}>
        <div ref={scroller} styleName="carousel" className="scroll-snap-carousel">
          {children}
        </div>
        {isArrow && (
          <SliderArrow
            sliderArrowStyles={sliderArrowStyles}
            noOfItems={noOfItems}
            perView={perView}
            previousClick={previousClick}
            nextClick={nextClick}
            selectedIndex={selectedIndex}
            languageDirection={languageDirection}
          />
        )}
      </div>

      {children.length > perView && slideIndicator !== "none" && (
        <SliderIndicator
          indicatorItems={indicatorItems}
          indicatorClick={indicatorClick}
          selectedIndex={selectedIndex}
          indicatorType={slideIndicator}
        />
      )}
    </div>
  );
};

ScrollSnap.defaultProps = {
  isArrow: true,
  isInfinite: false,
  interval: 4000,
  pauseOnHover: true,
  perView: 1,
  slideIndicator: "dots"
};

ScrollSnap.propTypes = {
  children: array.isRequired,
  isArrow: bool,
  isInfinite: bool,
  interval: number,
  pauseOnHover: bool,
  perView: number,
  slideIndicator: string
};
