import React from "react";
import PropTypes from "prop-types";
import { withElementWrapper } from "../withElementWrapper";
import { getTextColor, updateContentLinks, shapeStory, shapeConfig } from "../../../../utils/utils";

import "./summary.m.css";
import { useStateValue } from "../../../SharedContext";

const SummaryBase = ({
  element,
  template = "",
  opts = {},
  css = {},
  story = {},
  config = {},
  render,
  ...restProps
}) => {
  const configData = useStateValue() || {};
  const textInvertColor = getTextColor(configData.theme);
  const content = element.text;
  if (!content) return null;

  const { headerBgColor } = css;
  const { isExternalLink = true, headline = "Summary", hideHeadline = false } = opts;
  consy text = (isExternalLink && updateContentLinks(content)) || content;

  const supportedTemplates = ["header", "border"];
  const templateStyle = supportedTemplates.includes(template) ? `summary-${template}` : "summary";

  const contentBorder = hideHeadline ? `content-border` : "";
  const renderTemplate = template === "header" || template === "border";
  const updateHeaderColor = renderTemplate ? `${headerBgColor}` : "";
  const textColor = renderTemplate ? getTextColor(headerBgColor) : "";
  const updateContentColor = template === "header" ? "" : textInvertColor;

  return (
    <div
      className="arrow-component arr--summary-element arr-custom-style"
      styleName={templateStyle}
      data-test-id="summary"
      {...restProps}>
      {!hideHeadline && (
        <div styleName={`heading-wrapper ${textInvertColor}`} data-test-id="summary-headline">
          <div styleName={`headline ${textColor} ${textInvertColor}`} style={{ backgroundColor: updateHeaderColor }}>
            {headline}
          </div>
        </div>
      )}
      <div
        styleName={`content ${contentBorder} ${updateContentColor} ${textInvertColor}`}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  );
};

SummaryBase.propTypes = {
  element: PropTypes.shape({ text: PropTypes.string }),
  template: PropTypes.string,
  opts: PropTypes.shape({ isExternalLink: PropTypes.bool, headline: PropTypes.string, hideHeadline: PropTypes.bool }),
  story: shapeStory,
  config: shapeConfig,
  render: PropTypes.func,
  css: PropTypes.shape({ headerBgColor: PropTypes.string })
};

export const Summary = withElementWrapper(SummaryBase);
