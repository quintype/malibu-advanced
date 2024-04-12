/* eslint-disable camelcase */
import React from "react";
import get from "lodash/get";
import { array, object, bool, string } from "prop-types";
import { Link } from "@quintype/components";
import { Separator } from "./separator";
import { HeroImage } from "./heroImage";
import "./three-col-nineteen-stories.m.css";

const getHeadline = (story) => {
  const headline = get(story, ["alternative", "home", "default", "headline"], story.headline);
  return headline || story.headline;
};

const MainStory = ({ story }) => {
  const headline = getHeadline(story);
  const readTime = get(story, ["read-time"], null);
  return (
    <div>
      <Link href={`/${story.slug}`}>
        <h2 styleName="main-story-headline">{headline}</h2>
        <p styleName="subheadline">{story.subheadline}</p>
        <div styleName="time-container">
          <span>Just Now</span>
          <Separator type="dot" width="10px" height="10px" color="dark" />
          {readTime && <span>{readTime} MIN READ</span>}
        </div>
        <HeroImage story={story} headline={headline} aspectRatio={[4, 3]} />
      </Link>
    </div>
  );
};

MainStory.propTypes = {
  story: object,
};

const HeadlineImage = ({ headline, showThumbnail, story }) => {
  const readTime = get(story, ["read-time"], null);

  const headlineStyleName = showThumbnail ? "show-thumbnail" : "hide-thumbnail"; // Full width if no image

  return (
    <div styleName="second-card">
      <div styleName={`left-column ${headlineStyleName}`}>
        <h2>{headline}</h2>
        <div styleName="time-container">
          <span>Just Now</span>
          <Separator type={"dot"} width="10px" height="10px" color="dark" />
          {readTime && <span>{readTime} MIN READ</span>}
        </div>
      </div>
      {showThumbnail && (
        <div styleName="hero-image">
          <HeroImage story={story} headline={headline} aspectRatio={[4, 3]} />
        </div>
      )}
    </div>
  );
};

HeadlineImage.propTypes = {
  headline: string,
  showThumbnail: bool,
  story: object,
};

const CommonStory = ({ story, showThumbnail }) => {
  const label = get(story, ["metadata", "story-attributes", "label", "0"], null);
  const headline = getHeadline(story);

  return (
    <div styleName="common-story" key={story.id}>
      <Link href={`/${story.slug}`}>
        {label && <p styleName="label">{label}</p>}
        <HeadlineImage headline={headline} showThumbnail={showThumbnail} story={story} />
      </Link>
      <Separator type={"line"} width="100%" color="dark" />
    </div>
  );
};

CommonStory.propTypes = {
  story: object,
  showThumbnail: bool,
};

const MainColumn = ({ stories, isFirstVariation }) => {
  const [firstStory, ...remainingStories] = stories;

  return (
    <div styleName={isFirstVariation ? "first-column" : "second-column"}>
      <MainStory story={firstStory} />
      <Separator type={"line"} width="100%" height="10px" color="dark" />
      {remainingStories.map((story) => (
        <CommonStory key={story.id} story={story} showThumbnail={true} />
      ))}
    </div>
  );
};

MainColumn.propTypes = {
  stories: array,
  isFirstVariation: bool,
};

const SecondaryColumn = ({ stories, isFirstVariation }) => {
  return (
    <div styleName={isFirstVariation ? "second-column" : "first-column"}>
      {stories.map((story) => (
        <CommonStory key={story.id} story={story} showThumbnail={false} />
      ))}
    </div>
  );
};

SecondaryColumn.propTypes = {
  stories: array,
  isFirstVariation: bool,
};

const ThirdColumn = ({ stories, photos_label }) => {
  console.log("Third Column: ", stories.length);
  return (
    <div styleName="third-column">
      {stories.slice(0, 4).map((story) => (
        <CommonStory key={story.id} story={story} showThumbnail={false} />
      ))}
      <div>
        <p styleName="photos-label">{photos_label}</p>
        <div style={{ display: "flex", gap: "1rem" }}>
          {stories.slice(4, 6).map((story) => {
            return (
              <div key={story.id} style={{ maxWidth: "50%" }}>
                <HeroImage story={story} headline={story.headline} aspectRatio={[4, 3]} />
                <h2>{getHeadline(story)}</h2>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

ThirdColumn.propTypes = {
  stories: array,
  photos_label: array,
};

export const ThreeColNineteenStories = ({ collection, stories }) => {
  const { primary_in_first_column, photos_label } = get(collection, ["associated-metadata"], {});
  return (
    <div styleName="three-col-nine-stories">
      <MainColumn isFirstVariation={primary_in_first_column} stories={stories.slice(0, 5)} />
      <SecondaryColumn isFirstVariation={primary_in_first_column} stories={stories.slice(5, 13)} />
      <ThirdColumn stories={stories.slice(13, 19)} photos_label={photos_label} />
    </div>
  );
};

ThreeColNineteenStories.propTypes = {
  collection: object,
  stories: array,
};

ThreeColNineteenStories.storyLimit = 19;
