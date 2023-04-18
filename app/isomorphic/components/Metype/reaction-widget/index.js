import { MetypeReactionsWidget } from "@metype/components";
import get from "lodash/get";
import { object } from "prop-types";
import React from "react";
import { useSelector } from "react-redux";

const generateHostUrl = (story = {}) => {
  if (global.location) {
    return `${global.location.origin}/${story.slug}`;
  }
};

export const ReactionsWidget = () => {
  const story = useSelector((state) => get(state, ["qt", "data", "story"], {}));
  const metypeConfig = useSelector((state) => get(state, ["qt", "config", "publisher-attributes", "metypeConfig"], {}));
  const { metypeHost = "", metypeAccountId = "", fontUrl = "", fontFamily = "" } = metypeConfig;
  return (
    <MetypeReactionsWidget
      host={metypeHost}
      accountId={metypeAccountId}
      pageURL={generateHostUrl(story)}
      fontUrl={fontUrl}
      fontFamily={fontFamily}
    />
  );
};

ReactionsWidget.propTypes = {
  metypeConfig: object,
  story: object,
};
