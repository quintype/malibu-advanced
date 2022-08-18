/*
 *  ************************************************************************
 *  *  © [2015 - 2020] Quintype Technologies India Private Limited
 *  *  All Rights Reserved.
 *  *************************************************************************
 */
import get from "lodash/get";
import PropTypes from "prop-types";
import React, { lazy, Suspense, useState } from "react";
import { getTextColor } from "../../../utils/utils";
import "./../Loadmore/load-more.m.css";

const getTemplate = (templateName) => {
  switch (templateName) {
    case "ArrowFourColGrid":
      return lazy(() => import("../../Rows/FourColGrid"));
    case "ArrowThreeColGrid":
      return lazy(() => import("../../Rows/ThreeColGrid"));
    case "ArrowOneColStoryList":
      return lazy(() => import("../../Rows/OneColStoryList"));
    case "ArrowFourColFiveStories":
      return lazy(() => import("../../Rows/FourColFiveStories"));
    case "ArrowOpinionCollection":
      return lazy(() => import("../../Rows/OpinionCollection"));
    case "ArrowSixColSixStories":
      return lazy(() => import("../../Rows/SixColSixStories"));
    case "ArrowThreeColFlexStories":
      return lazy(() => import("../../Rows/ThreeColFlexStories"));
    case "ArrowFourColPortraitStories":
      return lazy(() => import("../../Rows/FourColPortraitStories"));
    default:
      return lazy(() => import("../../Rows/ThreeColGrid"));
  }
};

export const ExtendedLoadMore = ({ config, componentName, WithArrowConfig, withSubsequentLoad }) => {
  const showButton = get(config, ["showButton"], true);
  const btnText = get(config, ["buttonText"], "Read More");
  const theme = get(config, ["theme"], "");
  const textColor = getTextColor(theme);

  /* Open an array to maintain load-more initiated components to re-render */
  const [components, setComponents] = useState([]);

  const addComponent = async (event) => {
    event.persist();
    const collectionSlug = event.target.parentElement.getAttribute("data-collection-slug");
    const offset = event.target.parentElement.getAttribute("data-collection-offset");
    const limit = event.target.parentElement.getAttribute("data-collection-limit");

    const Component = getTemplate(componentName);

    const { items } = await (
      await fetch(
      `/api/v1/collections/${collectionSlug}?item-type=story&offset=${offset}&limit=${limit}`
      )
    ).json();

    if (items.length) {
      const updatedOffset = parseInt(offset) + parseInt(limit);
      event.target.parentElement.setAttribute("data-collection-offset", updatedOffset);
    }

    const updatedCompList = [
      ...components,
      {
        // Passing a number below the initial collection length (which we will not know here)
        // as the second parameter causes the Load More button to be rendered regardless of
        // the value given to `isLoadMoreVisible`. Since this paramter will be ignored anyway,
        // we pass in a number that is sufficiently always larger.
        Component: WithArrowConfig(withSubsequentLoad(Component, limit || 10, true)),
        props: {
          collection: {
            items,
          },
          isLoadMoreVisible: false,
          config,
        },
        componentName,
      },
    ];

    setComponents(updatedCompList);
  };

  if (!showButton) return null;

  /* TODO: !HACK! Remove this line post deployment */
  const componentStyles = (componentName) => (componentName === "ArrowOneColStoryList" ? { marginLeft: 0 } : {});

  return (
    <>
      {components.map(({ Component, props }, index) => (
        <div style={{ maxWidth: 1172, margin: "auto" }} key={`extendedLoadMoreBase-key-${index}`}>
          <Suspense fallback={<div>Loading...</div>}>
            <Component {...props} />
          </Suspense>
        </div>
      ))}
      <div
        className="arr--button"
        styleName={`button ${textColor} default`}
        style={componentStyles(componentName)}
        onClick={addComponent}
      >
        {btnText}
      </div>
    </>
  );
};

ExtendedLoadMore.propTypes = {
  componentName: PropTypes.string,
  config: PropTypes.object,
  WithArrowConfig: PropTypes.func,
  withSubsequentLoad: PropTypes.func,
};
