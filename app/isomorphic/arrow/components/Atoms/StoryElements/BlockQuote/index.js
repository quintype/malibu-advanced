import React from "react";
import get from "lodash.get";
import PropTypes from "prop-types";
import { clientWidth, getTextColor, shapeConfig, shapeStory } from "../../../../utils/utils";
import { withElementWrapper } from "../withElementWrapper";
import { CurveIcon } from "./Svg/curve";
import { EdgeIcon } from "./Svg/edge";
import "./block-quote.m.css";
import { useStateValue } from "../../../SharedContext";

const SelectionOfIcon = (iconType, template, blockQuoteColor, quoteColor) => {
  const isMobile = clientWidth("mobile");
  const dimension = isMobile ? "48px" : "64px";

  if (template === "withBackground") {
    if (iconType === "edgeIcon") {
      return <EdgeIcon width={dimension} height={dimension} color={quoteColor} opacity=".4" />;
    }
    return <CurveIcon width={dimension} height={dimension} color={quoteColor} opacity=".4" />;
  }

  if (template !== "withBackground") {
    if (iconType === "edgeIcon") {
      return <EdgeIcon width={dimension} height={dimension} color={blockQuoteColor} />;
    }
    return <CurveIcon width={dimension} height={dimension} color={blockQuoteColor} />;
  }
};

export const BlockQuoteBase = ({ element, template, css = {}, story = {}, config = {}, render, ...restProps }) => {
  const { content, attribution } = get(element, ["metadata"]);
  if (!content) return null;

  const { blockQuoteColor, backgroundShade, iconType } = css;
  const templateStyle = template ? `blockquote-${template}` : "blockquote";
  const isBackground = template === "withBackground";
  const textColor = isBackground ? getTextColor(backgroundShade) : "";
  const theme = isBackground && backgroundShade ? { backgroundColor: backgroundShade } : {};
  const configData = useStateValue() || {};
  const textInvertColor = getTextColor(isBackground ? theme.backgroundColor : configData.theme);

  const updateStructure = () => {
    return template === "withBorder" ? (
      <div styleName="icon-border">
        <div styleName="icon">{SelectionOfIcon(iconType, template, blockQuoteColor, textColor)}</div>
        <div styleName="border" style={{ backgroundColor: blockQuoteColor || "initial" }} />
      </div>
    ) : (
      <div styleName="icon">{SelectionOfIcon(iconType, template, blockQuoteColor, textColor)}</div>
    );
  };

  return (
    <div
      className="arrow-component arr--block-quote"
      data-test-id="blockquote"
      styleName={`${templateStyle} ${textColor}`}
      style={theme}
      {...restProps}>
      <div styleName="quote-wrapper">
        {updateStructure()}
        <div styleName="wrapper" style={{ borderColor: blockQuoteColor || "unset" }}>
          <div styleName={`content ${textInvertColor}`} dangerouslySetInnerHTML={{ __html: content }} />
          <div styleName={`attribution ${textInvertColor}`} dangerouslySetInnerHTML={{ __html: attribution }} />
        </div>
      </div>
    </div>
  );
};

BlockQuoteBase.propTypes = {
  element: PropTypes.shape({
    metadata: PropTypes.shape({ content: PropTypes.string, attribution: PropTypes.string })
  }),
  template: PropTypes.string,
  story: shapeStory,
  config: shapeConfig,
  render: PropTypes.func,
  css: PropTypes.object
};

export const BlockQuote = withElementWrapper(BlockQuoteBase);
