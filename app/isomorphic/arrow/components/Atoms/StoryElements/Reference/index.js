import React from "react";
import PropTypes from "prop-types";
import { withElementWrapper } from "../withElementWrapper";
import { useStateValue } from "../../../SharedContext";
import { getTextColor, shapeConfig } from "../../../../utils/utils";
import { Link } from "@quintype/components";
import "./reference.m.css";

const ReferenceBase = ({ element, config = {}, opts = {}, ...restProps }) => {
  if (!element) return null;

  const configData = useStateValue() || {};
  const textInvertColor = getTextColor(configData.theme);

  const eleArr = element["story-elements"] && element["story-elements"].map((ref) => ref.metadata);
  const { showHeadline = true, headlineText } = opts;

  return (
    <div className="arrow-component arr--reference-element" {...restProps}>
      {eleArr &&
        eleArr.map((metadata, index) => {
          const { name = "", description = "", url } = metadata;
          return (
            <div styleName={`wrapper ${textInvertColor}`} key={index}>
              <Link href={url} aria-label="reference-headline">
                {showHeadline && (
                  <div styleName="name" data-test-id="ref-headline">
                    {headlineText || name}
                  </div>
                )}
                <div styleName="description">{description}</div>
              </Link>
            </div>
          );
        })}
    </div>
  );
};

ReferenceBase.propTypes = {
  element: PropTypes.shape({
    "story-elements": PropTypes.arrayOf(
      PropTypes.shape({
        metadata: PropTypes.shape({ name: PropTypes.string, description: PropTypes.string, url: PropTypes.string })
      })
    )
  }),
  opts: PropTypes.shape({ hideHeadline: PropTypes.bool }),
  config: shapeConfig
};

export const Reference = withElementWrapper(ReferenceBase);
