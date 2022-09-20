import React from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import { withElementWrapper } from "../withElementWrapper";
import { updateContentLinks, shapeStory, shapeConfig, getTextColor } from "../../../../utils/utils";
import "./text.m.css";
import { useStateValue } from "../../../SharedContext";

const TextBase = ({ element = {}, opts = {}, css = {}, story = {}, config = {}, ...restProps }) => {
  const content = element.text;
  if (!content) return null;
  const configData = useStateValue() || {};
  const textInvertColor = getTextColor(configData.theme);
  const { textColor } = css;
  const { isExternalLink = true } = opts;
  const text = (isExternalLink && updateContentLinks(content)) || content;
  const isPromotionalMessage = get(element, ["metadata", "promotional-message"], false);
  const updatedStyle = isPromotionalMessage ? "promotionalMessage" : "textElement";

  return (
    <div
      className="arrow-component arr--text-element"
      styleName={`${updatedStyle} ${textInvertColor}`}
      style={!isPromotionalMessage ? { color: textColor } : {}}
      data-test-id={isPromotionalMessage ? "promotional-message" : "text"}
      dangerouslySetInnerHTML={{ __html: text }}
      id="text-element"
      {...restProps}
    />
  );
};

TextBase.propTypes = {
  element: PropTypes.shape({ text: PropTypes.string }),
  opts: PropTypes.shape({ isExternalLink: PropTypes.bool }),
  css: PropTypes.shape({ hyperlinkColor: PropTypes.string, textColor: PropTypes.string }),
  story: shapeStory,
  config: shapeConfig,
};

export const Text = withElementWrapper(TextBase);
