import React from "react";
import PropTypes from "prop-types";
import { withElementWrapper } from "../withElementWrapper";
import { useStateValue } from "../../../SharedContext";
import { getTextColor } from "../../../../utils/utils";
import "./big-fact.m.css";

const BigFactBase = ({ element, story, config, ...restProps }) => {
  const configData = useStateValue() || {};
  const textInvertColor = getTextColor(configData.theme);
  const { content, attribution } = element.metadata;

  return (
    <div
      className="arrow-component arr--bigfact-element"
      data-test-id="bigfact"
      styleName={`bigfact-element ${textInvertColor}`}
      {...restProps}>
      <div styleName="content">{content}</div>
      <div styleName={`attribution ${textInvertColor}`} data-test-id="attribution">
        {attribution}
      </div>
    </div>
  );
};

BigFactBase.propTypes = {
  element: PropTypes.shape({ metadata: PropTypes.shape({ content: PropTypes.string, attribution: PropTypes.string }) }),
  story: PropTypes.object,
  config: PropTypes.object
};

export const BigFact = withElementWrapper(BigFactBase);
