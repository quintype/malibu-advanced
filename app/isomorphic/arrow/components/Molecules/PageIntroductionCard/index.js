import React from "react";
import PropTypes from "prop-types";
import upperCase from "lodash/upperCase";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import { getTextColor, navigateTo, generateNavigateSlug } from "../../../utils/utils";
import "./page-intro-card.m.css";
import { LoadmoreButton } from "../../Atoms/Loadmore";

export const PageIntroductionCard = ({ config = {} }) => {
  const {
    pageTitle = "",
    pageDescription = "",
    theme = "#131922",
    showButton = false,
    enableBorder = false,
    customUrlPath
  } = config;
  const textColor = getTextColor(theme);
  const borderBottom = enableBorder ? "borderBottom" : "";
  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug({}, { ...qtConfig, config }, customUrlPath);

  return (
    <div
      styleName="author-page-wrapper"
      className="arrow-component full-width-with-padding"
      style={{ background: theme }}>
      <h2 styleName={`pageTitle ${textColor} ${borderBottom}`} data-test-id="page-title">
        {upperCase(pageTitle)}
      </h2>
      <div styleName={`pageDescription ${textColor}`} data-test-id="page-description">
        {pageDescription}
      </div>
      {showButton && (
        <LoadmoreButton
          template="customUrlPath"
          config={config}
          navigate={() => navigateTo(dispatch, url)}
          qtConfig={qtConfig}
        />
      )}
    </div>
  );
};

PageIntroductionCard.propTypes = {
  config: PropTypes.shape({ theme: PropTypes.string, pageTitle: PropTypes.string, pageDescription: PropTypes.string })
};
