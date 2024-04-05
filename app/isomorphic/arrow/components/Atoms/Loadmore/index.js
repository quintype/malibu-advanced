import React from "react";
import { LinkBase } from "@quintype/components";
import PropTypes from "prop-types";
import { getTextColor, generateNavigateSlug } from "../../../utils/utils";
import "./load-more.m.css";

export const LoadmoreButton = ({
  config = {},
  collection,
  template = "SubsequentLoadCount",
  onClick,
  navigate,
  qtConfig,
}) => {
  const { showButton = true, buttonText = "Read More", theme = "", customUrlPath = "" } = config;
  if (!showButton) return null;

  const textColor = getTextColor(theme);
  const slug = customUrlPath ? `/${customUrlPath}` : generateNavigateSlug(collection, { ...qtConfig, ...config });

  return template === "SubsequentLoadCount" ? (
    <div className="arr--button" styleName={`button ${textColor} default`} onClick={onClick} data-test-id="load-more">
      {buttonText}
    </div>
  ) : (
    <LinkBase href={slug} navigateTo={navigate} data-test-id="load-more" aria-label="load-more">
      <div className="arr--button" styleName={`button ${textColor} default`}>
        {buttonText}
      </div>
    </LinkBase>
  );
};

LoadmoreButton.propTypes = {
  collection: PropTypes.object,
  template: PropTypes.string,
  config: PropTypes.object,
  onClick: PropTypes.func,
  navigate: PropTypes.func,
  qtConfig: PropTypes.object,
};
