import React from "react";
import get from "lodash.get";
import PropTypes, { string } from "prop-types";
import { useStateValue } from "../../SharedContext";
import { Link } from "@quintype/components";
import "./tags.m.css";
import { getTextColor } from "../../../utils/utils";

export const StoryTags = ({ tags = [], template = "", config, borderColor = "" }) => {
  const configData = useStateValue() || {};
  const textColor = getTextColor(configData.theme);
  const mountAt = get(config, ["mountAt"], "");
  const templateStyle = template === "roundCorners" ? "roundCorners" : "";
  return (
    <div className="arrow-component arr--story-tags">
      {tags.length > 0 &&
        tags.map((tag, index) => (
          <div styleName={`tags ${templateStyle} ${textColor}`} key={index} data-test-id="story-tag">
            <Link href={`${mountAt}/topic/` + encodeURIComponent(tag.slug)} aria-label="story-tag-name">
              {tag.name}
            </Link>
          </div>
        ))}
    </div>
  );
};

StoryTags.propTypes = {
  tags: PropTypes.array,
  borderColor: PropTypes.string,
  config: PropTypes.object,
  template: string
};
