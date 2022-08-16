import React from "react";
import PropTypes from "prop-types";
import "./caption-attribution.m.css";
import { getTextColor, shapeStory } from "../../../utils/utils";
import { useStateValue } from "../../SharedContext";

export const CaptionAttribution = ({ story, element, config = {} }) => {
  if (!(story || element)) return null;
  const configData = useStateValue() || {};
  const textColor = getTextColor(configData.theme);

  const { "hero-image-caption": heroImageCaption = "", "hero-image-attribution": heroImageAttribution = "" } =
    story || {};
  const { title = "", "image-attribution": imageAttribution = "" } = element || {};

  const caption = heroImageCaption || title;
  const attribution = heroImageAttribution || imageAttribution;
  const updateStyle = caption ? "wrapper" : "";
  return (
    <div data-test-id="caption" className="arr--caption-attribution" styleName={`caption ${textColor}`}>
      <span dangerouslySetInnerHTML={{ __html: caption }} />
      {attribution && (
        <span
          data-test-id="attribution"
          styleName={`attribution ${textColor} ${updateStyle}`}
          dangerouslySetInnerHTML={{ __html: attribution }}
        />
      )}
    </div>
  );
};

CaptionAttribution.propTypes = {
  config: PropTypes.shape({ theme: PropTypes.string }),
  story: shapeStory,
  element: PropTypes.shape({
    "image-attribution": PropTypes.string,
    title: PropTypes.string
  })
};
