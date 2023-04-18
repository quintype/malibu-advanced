import { MetypeFeedWidget } from "@metype/components";
import get from "lodash/get";
import { object } from "prop-types";
import React from "react";
import { useSelector } from "react-redux";

const generateHostUrl = (story = {}) => {
  if (global.location) {
    return `${global.location.origin}/${story.slug}`;
  }
};

export const FeedWidget = () => {
  const story = useSelector((state) => get(state, ["qt", "data", "story"], {}));
  const metypeConfig = useSelector((state) => get(state, ["qt", "config", "publisher-attributes", "metypeConfig"], {}));
  const {
    metypeHost = "",
    metypeAccountId = "",
    primaryColor = "",
    secondaryColor = "",
    fontColor = "",
    fontUrl = "",
    fontFamily = "",
    windowHeight,
    windowWidth,
    className,
  } = metypeConfig;
  return (
    <MetypeFeedWidget
      host={metypeHost}
      accountId={metypeAccountId}
      pageURL={generateHostUrl(story)}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      fontColor={fontColor}
      fontUrl={fontUrl}
      fontFamily={fontFamily}
      className={className}
      windowHeight={windowHeight}
      windowWidth={windowWidth}
    />
  );
};

FeedWidget.propTypes = {
  metypeConfig: object,
  story: object,
};
