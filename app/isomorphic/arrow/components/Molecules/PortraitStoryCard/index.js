import React from "react";
import PropTypes from "prop-types";

import { StoryCard } from "../StoryCard";
import { StorycardContent } from "../StorycardContent";
import { HeroImage } from "../../Atoms/HeroImage";
import { isEmpty } from "../../../utils/utils";
import { StateProvider } from "../../SharedContext";

import "./portrait-story-card.m.css";

const PortraitStoryCard = ({
  story,
  border = "",
  theme = "",
  headerLevel = "6",
  separator = "",
  config = {},
  borderColor = "",
}) => {
  if (isEmpty(story)) return null;

  return (
    <div styleName="wrapper">
      <StoryCard story={story} border={border} theme={theme} config={config} useImageAsBackground>
        <HeroImage story={story} aspectRatio={[[9, 16]]} />
        <StorycardContent
          story={story}
          config={config}
          separator={separator}
          borderColor={borderColor}
          headerLevel={headerLevel}
        />
      </StoryCard>
    </div>
  );
};

PortraitStoryCard.propTypes = {
  border: PropTypes.string,
  theme: PropTypes.string,
  headerLevel: PropTypes.string,
  separator: PropTypes.string,
  borderColor: PropTypes.string,
  config: PropTypes.object,
  story: PropTypes.object,
};

export default StateProvider(PortraitStoryCard);
