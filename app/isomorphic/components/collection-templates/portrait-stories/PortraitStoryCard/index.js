import React from "react";
import PropTypes from "prop-types";
import { ResponsiveHeroImage } from "@quintype/components";
import { removeHtmlTags } from "../../../utils";
import get from "lodash/get";
import { SvgIconHandler } from "../../../atoms/svg-icon-hadler";
import "./portrait-story-card.m.css";

export const HeroImage = ({ story, aspectRatio, defaultWidth, widths }) => {
  const imageCaption = get(story, ["hero-image-caption"], "");
  const imageAltText = imageCaption ? removeHtmlTags(imageCaption) : get(story, ["headline"], "");
  return (
    <ResponsiveHeroImage
      story={story}
      aspectRatio={[9, 16]}
      defaultWidth={defaultWidth}
      widths={widths}
      imgParams={{ auto: ["format", "compress"], fit: "max" }}
      alt={imageAltText}
    />
  );
};
HeroImage.propTypes = {
  story: PropTypes.object.isRequired,
  aspectRatio: PropTypes.array,
  defaultWidth: PropTypes.number,
  widths: PropTypes.array,
};

HeroImage.defaultProps = {
  aspectRatio: [9, 16],
  defaultWidth: 480,
  widths: [250, 480, 640],
};

export const StorycardContent = ({ story }) => {
  return <p styleName="head-line">{story.headline}</p>;
};

StorycardContent.propTypes = {
  story: PropTypes.object.isRequired,
};

const PortraitStoryCard = ({ story }) => {
  return (
    <>
      <div styleName="card">
        <SvgIconHandler styleName="portrait-icon" type="portrait-icon" width="24px" height="24px" />
        <HeroImage story={story} aspectRatio={[9, 16]} />
        <StorycardContent story={story} />
      </div>
    </>
  );
};

PortraitStoryCard.propTypes = {
  config: PropTypes.object,
  story: PropTypes.object,
};

export default PortraitStoryCard;
