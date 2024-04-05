import React from "react";
import { Headline } from "../../Atoms/Headline/index";
import { Subheadline } from "../../Atoms/Subheadline/index";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { HeroImage } from "../../Atoms/HeroImage/index";
import { SectionTag } from "../../Atoms/SectionTag/index";
import { isEmpty } from "../../../utils/utils";

import PropTypes from "prop-types";

import "./slider-horizontal-card.m.css";

export const SliderHorizontalCard = ({
  story,
  border = "",
  theme = "",
  headerLevel,
  borderColor = "",
  config = {}
}) => {
  if (!story || isEmpty(story)) return <div />;
  const borderStyle = border === "full" ? "border" : "";
  const { localizationConfig = {} } = config;
  return (
    <div styleName={`horizontal ${borderStyle}`} style={{ backgroundColor: theme || "initial" }}>
      <HeroImage config={config} story={story} aspectRatio={[[4, 3], [16, 9]]} />
      <div className="arr--content" styleName="content">
        <SectionTag story={story} borderColor={borderColor} />
        <Headline story={story} headerLevel={headerLevel} premiumStoryIconConfig={config} />
        <Subheadline story={story} />
        <AuthorWithTime config={localizationConfig} story={story} isBottom prefix="By" />
      </div>
    </div>
  );
};

SliderHorizontalCard.propTypes = {
  story: PropTypes.object.isRequired,
  border: PropTypes.string,
  theme: PropTypes.string,
  headerLevel: PropTypes.string,
  borderColor: PropTypes.string,
  config: PropTypes.object
};
