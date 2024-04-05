import React from "react";
import get from "lodash/get";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { withElementWrapper } from "../withElementWrapper";
import { updateContentLinks, shapeStory, shapeConfig, getTextColor } from "../../../../utils/utils";
import "./blurb.m.css";
import { useStateValue } from "../../../SharedContext";

const BlurbBase = ({ element, template = "", opts = {}, css = {}, story = {}, config = {}, render, ...restProps }) => {
  const { borderColor } = css;
  const languageDirection = useSelector((state) => get(state, ["qt", "config", "language", "direction"], "ltr"));
  const content = element.text;
  if (!content) return null;
  const initBorderDirection =
    template === "withBorder"
      ? { border: `2px solid ${borderColor || "unset"}` }
      : languageDirection === "rtl"
      ? { borderRight: `2px solid ${borderColor || "unset"}` }
      : { borderLeft: `2px solid ${borderColor || "unset"}` };

  const { isExternalLink = true } = opts;
  const text = (isExternalLink && updateContentLinks(content)) || content;
  const templateStyle = template ? `blurb-${template}` : "blurb";
  const configData = useStateValue() || {};
  const textInvertColor = getTextColor(configData.theme);
  return (
    <div
      className="arrow-component arr-custom-style arr--blurb-element"
      styleName={`${templateStyle} ${textInvertColor}`}
      data-test-id="blurb"
      style={initBorderDirection}
      dangerouslySetInnerHTML={{ __html: text }}
      {...restProps}
    />
  );
};

BlurbBase.propTypes = {
  element: PropTypes.shape({ text: PropTypes.string }),
  /** templates can be either default or withBorder */
  template: PropTypes.string,
  opts: PropTypes.shape({ isExternalLink: PropTypes.bool }),
  story: shapeStory,
  config: shapeConfig,
  render: PropTypes.func,
  css: PropTypes.object,
};

export const Blurb = withElementWrapper(BlurbBase);
