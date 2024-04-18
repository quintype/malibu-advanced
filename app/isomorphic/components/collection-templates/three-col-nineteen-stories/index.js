/* eslint-disable camelcase */
import React from "react";
import get from "lodash/get";
import { array, object, bool, string } from "prop-types";
import { useSelector } from "react-redux";
import { differenceInHours, differenceInMinutes } from "date-fns";
import { Link } from "@quintype/components";
import { Separator } from "./separator";
import { HeroImage } from "./heroImage";
import { DfpComponent } from "../../ads/dfp-component";
import "./three-col-nineteen-stories.m.css";

const getStoryDate = (timestamp) => {
  const hourDifference = differenceInHours(new Date(), new Date(timestamp));
  if (hourDifference > 2) {
    return null;
  }
  const minutesDifference = differenceInMinutes(new Date(), new Date(timestamp));
  if (minutesDifference < 5) {
    return "Just Now";
  } else if (minutesDifference < 60) {
    return `${minutesDifference} min`;
  } else {
    return `${hourDifference} ${hourDifference > 1 ? "hours" : "hour"}`;
  }
};

const getHeadline = (story) => {
  const headline = get(story, ["alternative", "home", "default", "headline"], story.headline);
  return headline || story.headline;
};

const MainStory = ({ story }) => {
  const headline = getHeadline(story);
  const label = get(story, ["metadata", "story-attributes", "label", "0"], null);
  const readTime = get(story, ["read-time"], null);
  return (
    <Link href={`/${story.slug}`}>
      <div styleName="main-story">
        {label && <p styleName="label">{label}</p>}
        <h2 styleName="main-story-headline">{headline}</h2>
        {story.subheadline && <p styleName="subheadline">{story.subheadline}</p>}
        <div styleName="time-container">
          {getStoryDate(story["updated-at"] || story["last-published-at"]) ? (
            <span styleName="publish-time">
              {getStoryDate(story["updated-at"] || story["last-published-at"])}
              <Separator type="dot" width="12px" height="12px" color="dark" />
            </span>
          ) : null}
          {readTime && <span>{readTime} MIN READ</span>}
        </div>
        <HeroImage story={story} headline={headline} aspectRatio={[4, 3]} />
      </div>
    </Link>
  );
};

MainStory.propTypes = {
  story: object,
};

const HeadlineImage = ({ headline, showThumbnail, story }) => {
  const readTime = get(story, ["read-time"], null);
  const label = get(story, ["metadata", "story-attributes", "label", "0"], null);

  const headlineStyleName = showThumbnail ? "show-thumbnail" : "hide-thumbnail"; // Full width if no image

  return (
    <div styleName="second-card">
      <div styleName={`left-column ${headlineStyleName}`}>
        {label && <p styleName="label">{label}</p>}
        <h2 styleName="headline">{headline}</h2>
        <div styleName="time-container">
          {getStoryDate(story["updated-at"] || story["last-published-at"]) ? (
            <span>
              {getStoryDate(story["updated-at"] || story["last-published-at"])}
              <Separator type="dot" width="12px" height="12px" color="dark" />
            </span>
          ) : null}
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
  const isPartneredContent = label && (label === "Partner Content" || label === "Sponser Content");
  return (
    <div styleName="common-story" key={story.id}>
      <Link href={`/${story.slug}`}>
        <HeadlineImage headline={headline} showThumbnail={showThumbnail || isPartneredContent} story={story} />
      </Link>
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
      {remainingStories.map((story) => (
        <div key={story.id}>
          <CommonStory story={story} showThumbnail={true} />
        </div>
      ))}
    </div>
  );
};

MainColumn.propTypes = {
  stories: array,
  isFirstVariation: bool,
};

const TopComponentAd = () => {
  const adConfig = useSelector((state) => get(state, ["qt", "config", "ads-config", "slots", "top_component_ad"], {}));
  return (
    <div styleName="wrapper">
      <span styleName="ad-label">Advertisement</span>
      <DfpComponent
        adStyleName="ad-slot-size-300x250"
        id={`ThreeColNineteenStories-ad`}
        path={adConfig.ad_unit}
        size={adConfig.sizes}
        viewPortSizeMapping={adConfig.view_port_size_mapping}
      />
    </div>
  );
};

const SecondaryColumn = ({ stories, isFirstVariation, showAd }) => {
  return (
    <div styleName={isFirstVariation ? "second-column" : "first-column"}>
      {showAd && <TopComponentAd />}
      {stories.map((story) => (
        <div key={story.id}>
          <CommonStory story={story} showThumbnail={false} />
        </div>
      ))}
    </div>
  );
};

SecondaryColumn.propTypes = {
  stories: array,
  isFirstVariation: bool,
  showAd: bool,
};

const ThirdColumn = ({ stories, photos_label, showAd }) => {
  return (
    <div styleName="third-column">
      {showAd && <TopComponentAd />}
      <div styleName="third-column-stories">
        <div>
          {stories.slice(0, 3).map((story) => (
            <div key={story.id}>
              <CommonStory story={story} showThumbnail={false} />
            </div>
          ))}
        </div>
        <div>
          <div>
            <CommonStory story={stories[3]} showThumbnail={false} />
          </div>
          <p styleName="photos-label">{photos_label}</p>
          <div styleName="photos-container">
            {stories.slice(4, 6).map((story) => {
              return (
                <div key={story.id}>
                  <HeroImage story={story} headline={story.headline} aspectRatio={[4, 3]} styles="photo-card" />
                  <h2 styleName="headline">{getHeadline(story)}</h2>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

ThirdColumn.propTypes = {
  stories: array,
  photos_label: array,
  showAd: bool,
};

export const ThreeColNineteenStories = ({ collection, stories }) => {
  const { primary_in_first_column, photos_label } = get(collection, ["associated-metadata"], {});

  return (
    <div styleName="three-col-nine-stories">
      <MainColumn isFirstVariation={primary_in_first_column} stories={stories.slice(0, 5)} />
      <SecondaryColumn isFirstVariation={primary_in_first_column} stories={stories.slice(5, 13)} showAd={false} />
      <ThirdColumn stories={stories.slice(13, 19)} photos_label={photos_label} showAd={true} />
    </div>
  );
};

ThreeColNineteenStories.propTypes = {
  collection: object,
  stories: array,
};

ThreeColNineteenStories.storyLimit = 19;
