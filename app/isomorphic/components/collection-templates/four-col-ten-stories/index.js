import React from "react";
import { array, object } from "prop-types";

import { Headline, HeroImage, StoryCard, StoryCardWithBulletPoint } from "@quintype/arrow";

import "./four-col-ten-stories.m.css";

export function FourColTenStories({ collection, stories }) {
  const config = {
    showSection: true,
    showAuthor: false,
    showTime: false,
    showReadTime: false,
  };

  const border = {
    borderRadius: "20px",
  };

  return (
    <div styleName="four-col-ten-stories">
      <h2 styleName="header">{collection.name}</h2>
      <div styleName="container">
        <div styleName="main-story">
          <StoryCard
            story={stories[0]}
            bgImgContentOverlap
            aspectRatio={[
              [16, 9],
              [16, 9],
            ]}
          >
            <HeroImage
              story={stories[0]}
              aspectRatio={[
                [16, 9],
                [16, 9],
              ]}
              config={border}
            />
            <Headline story={stories[0]} headerLevel="4" />
          </StoryCard>
        </div>
        <div styleName="aside-container">
          {stories.slice(1, 6).map((el, id) => {
            return (
              <div key={id} styleName="bullet-wrapper">
                <StoryCardWithBulletPoint story={el} bulletValue={`○`} config={config} />
              </div>
            );
          })}
        </div>
      </div>
      <div styleName="container">
        {stories.slice(6).map((story, index) => {
          return (
            <div styleName="story-card" key={`index${index}`}>
              <StoryCard
                story={story}
                headerLevel="4"
                aspectRatio={[
                  [16, 9],
                  [16, 9],
                ]}
                isHorizontalMobile={true}
                isHorizontalWithImageLast={true}
                config={{}}
              >
                <>
                  <div styleName="story-card-image">
                    <HeroImage story={story} />
                  </div>
                  <div styleName="story-card-headline">
                    <Headline story={story} headerLevel="6" />
                  </div>
                </>
              </StoryCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}

FourColTenStories.propTypes = {
  collection: object,
  stories: array,
};

FourColTenStories.storyLimit = 10;
// FourColTenStories.nestedCollectionLimit = [1, 2];
