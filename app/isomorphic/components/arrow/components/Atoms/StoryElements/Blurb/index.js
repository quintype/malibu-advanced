import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { withElementWrapper } from "../withElementWrapper";
import { updateContentLinks, shapeStory, shapeConfig, getTextColor } from "../../../../utils/utils";
import "./blurb.m.css";
import { useStateValue } from "../../../SharedContext";

const BlurbBase = ({ element, template = "", opts = {}, css = {}, story = {}, config = {}, render, ...restProps }) => {
  const content = element.text;
  const { borderColor } = css;
  const initBorderDirection =
    template === "withBorder" ? { border: `solid 2px ${borderColor}` } : { borderLeft: `solid 2px ${borderColor}` };
  const [borderDirection, setBorderDirection] = useState(initBorderDirection);
  if (!content) return null;

  useEffect(() => {
    const htmlElement = document.getElementsByTagName("HTML");
    if (htmlElement && htmlElement.length) {
      if (htmlElement[0].dir.toLowerCase() === "rtl" && template !== "withBorder") {
        setBorderDirection({ borderRight: `solid 2px ${borderColor}` });
      }
    }
  }, []);

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
      style={borderColor && borderDirection}
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
