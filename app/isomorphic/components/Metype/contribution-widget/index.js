import { MetypeContributionWidget } from "@metype/components";
import get from "lodash/get";
import { object } from "prop-types";
import React from "react";
import { useSelector } from "react-redux";

const generateHostUrl = (story = {}) => {
  if (global.location) {
    return `${global.location.origin}/${story.slug}`;
  }
};

export const ContributionWidget = () => {
  const story = useSelector((state) => get(state, ["qt", "data", "story"], {}));
  const metypeConfig = useSelector((state) => get(state, ["qt", "config", "publisher-attributes", "metypeConfig"], {}));
  const { metypeHost = "", metypeAccountId = "", fontUrl = "", fontFamily = "" } = metypeConfig;
  return (
    <MetypeContributionWidget
      host={metypeHost}
      pageURL={generateHostUrl(story)}
      accountId={metypeAccountId}
      fontUrl={fontUrl}
      fontFamily={fontFamily}
    />
  );
};

ContributionWidget.propTypes = {
  metypeConfig: object,
  story: object,
};
