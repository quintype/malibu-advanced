import React from "react";
import PropTypes from "prop-types";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { StoryCard } from "../../Molecules/StoryCard";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { Headline } from "../../Atoms/Headline";
import { BulletPoint } from "../../Atoms/BulletPoint";
import "./story-card-with-bullet-point.m.css";

export const StoryCardWithBulletPoint = ({ story, config, bulletValue, collectionId }) => {
  const { theme = "", localizationConfig = {} } = config;
  return (
    <div styleName="card-with-bullet-wrapper">
      <BulletPoint bulletValue={bulletValue} />
      <StoryCard story={story} bgImgContentOverlap config={config} theme={theme}>
        <StorycardContent>
          <Headline story={story} headerLevel="6" premiumStoryIconConfig={config} />
          <AuthorWithTime config={localizationConfig} story={story} collectionId={collectionId} />
        </StorycardContent>
      </StoryCard>
    </div>
  );
};

StoryCardWithBulletPoint.propTypes = {
  story: PropTypes.object.isRequired,
  config: PropTypes.shape({
    theme: PropTypes.string,
    localizationConfig: PropTypes.object
  }),
  bulletValue: PropTypes.string,
  collectionId: PropTypes.number
};
