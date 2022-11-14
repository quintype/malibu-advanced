import React from "react";
import PropTypes from "prop-types";
import { withElementWrapper } from "../withElementWrapper";
import "./quote.m.css";
import { shapeStory, shapeConfig, getTextColor } from "../../../../utils/utils";
import { useStateValue } from "../../../SharedContext";

const QuoteBase = ({ element, template = "", css = {}, story = {}, config = {}, render, ...restProps }) => {
  const configData = useStateValue() || {};
  const textInvertColor = getTextColor(configData.theme);
  const { content, attribution } = element.metadata;
  if (!content) return null;
  const { borderColor } = css;
  const updateBorderColor = template === "borderLeft" && `4px solid ${borderColor}`;
  const templateStyle = template ? `quote-${template}` : "quote";

  return (
    <div className="arrow-component arr--quote-element" data-test-id="quote" styleName={templateStyle} {...restProps}>
      {template === "borderTopSmall" && (
        <div styleName="line" style={borderColor && { backgroundColor: borderColor }} />
      )}
      <p
        styleName={`text ${textInvertColor}`}
        style={borderColor && { borderLeft: updateBorderColor }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      <p data-test-id="quote-attribution" styleName={`attribution ${textInvertColor}`}>
        {attribution}
      </p>
    </div>
  );
};

QuoteBase.propTypes = {
  element: PropTypes.shape({ metadata: PropTypes.shape({ content: PropTypes.string, attribution: PropTypes.string }) }),
  /** template can be default, borderTopSmall and borderLeft  */
  template: PropTypes.string,
  story: shapeStory,
  config: shapeConfig,
  render: PropTypes.func,
  css: PropTypes.object,
};

export const Quote = withElementWrapper(QuoteBase);
