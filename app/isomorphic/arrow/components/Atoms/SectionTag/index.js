import React from "react";
import get from "lodash.get";
import { Link } from "@quintype/components";
import { useStateValue } from "../../SharedContext";
import PropTypes from "prop-types";
import { getTextColor, rgbToHex } from "../../../utils/utils";
import "./section.m.css";

export const SectionTag = ({ story, template = "", borderColor = "", isLightTheme }) => {
  const config = useStateValue() || {};
  const isSection = get(config, ["showSection"], true);
  const templateFromRowContext = get(config, ["sectionTagTemplate"]);
  const section = get(story, ["sections", 0], "");
  const supportedTemplates = ["borderBottomSml", "borderLeft", "solid"];
  const getUrl = section ? section["section-url"] : "/";
  const colorToApplyContrast = template === "solid" || templateFromRowContext === "solid" ? borderColor : config.theme;
  const textColor = isLightTheme ? "light" : getTextColor(colorToApplyContrast);

  const sectionTagBorderColor = rgbToHex(borderColor);
  let templateStyle = supportedTemplates.includes(template) ? `section section-${template}` : "section";
  if (templateFromRowContext) {
    templateStyle = supportedTemplates.includes(templateFromRowContext)
      ? `section section-${templateFromRowContext}`
      : "section";
  }

  if (!isSection) return null;
  return (
    <Link href={getUrl} className="arrow-component arr--section-name" aria-label="section-name">
      <div
        data-test-id="sectionTag"
        className="section-tag arrow-component"
        styleName={`${textColor} ${templateStyle}`}
        style={{
          backgroundColor: templateStyle.includes("section-solid") ? sectionTagBorderColor : ""
        }}>
        {templateStyle.includes("section-borderLeft") && (
          <span styleName="border-left" style={{ color: sectionTagBorderColor }}></span>
        )}
        {section["display-name"] || section["name"]}
        <div
          styleName="border-bottom"
          style={{ backgroundColor: `${template === "solid" ? "" : sectionTagBorderColor}` }}></div>
      </div>
    </Link>
  );
};
SectionTag.propTypes = {
  /** The Story Object from the API response */
  story: PropTypes.object.isRequired,
  /** The style template for section tag */
  template: PropTypes.oneOf(["", "borderBottomSml", "borderLeft", "solid"]),
  borderColor: PropTypes.string,
  solidBorderColor: PropTypes.string,
  isLightTheme: PropTypes.bool
};

SectionTag.defaultProps = {
  template: "",
  isLightTheme: false
};
