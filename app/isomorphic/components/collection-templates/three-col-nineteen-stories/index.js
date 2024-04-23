/* eslint-disable camelcase */
import React, { useEffect, useState } from "react";
import get from "lodash/get";
import { array, object, bool, string } from "prop-types";
import { useSelector } from "react-redux";
import { differenceInHours, differenceInMinutes } from "date-fns";
import { Link } from "@quintype/components";
import { Separator } from "./separator";
import { HeroImage } from "./heroImage";
import { DfpComponent } from "../../ads/dfp-component";
import "./three-col-nineteen-stories.m.css";

const PARTNER_CONTENT_STORY_TEMPLATE = "publication";

const getLabelToShow = (story) => {
  if (story["story-template"] === PARTNER_CONTENT_STORY_TEMPLATE) {
    return "Partner Content";
  }
  const label = get(story, ["metadata", "story-attributes", "label", "0"], null);
  return label;
};

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

const MainStory = ({ story, showHeroImage = true }) => {
  const headline = getHeadline(story);
  const label = getLabelToShow(story);
  const readTime = get(story, ["read-time"], null);
  return (
    <Link href={`/${story.slug}`}>
      <div styleName={`main-story ${showHeroImage ? "" : "hide-hero-image"}`}>
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
        {showHeroImage && <HeroImage story={story} headline={headline} aspectRatio={[4, 3]} />}
      </div>
    </Link>
  );
};

MainStory.propTypes = {
  story: object,
  showHeroImage: bool,
};

const HeadlineImage = ({ headline, showThumbnail, story }) => {
  const readTime = get(story, ["read-time"], null);
  const label = getLabelToShow(story);

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

const CommonStory = ({ story, showThumbnail, showBorder }) => {
  const headline = getHeadline(story);
  const sponsor = get(story, ["metadata", "sponsored-by"], null);
  const isPartneredContent = story["story-template"] === PARTNER_CONTENT_STORY_TEMPLATE || sponsor !== null;

  return (
    <div styleName={`common-story ${showBorder ? "" : "no-border"}`} key={story.id}>
      <Link href={`/${story.slug}`}>
        <HeadlineImage headline={headline} showThumbnail={showThumbnail || isPartneredContent} story={story} />
      </Link>
    </div>
  );
};

CommonStory.propTypes = {
  story: object,
  showThumbnail: bool,
  showBorder: bool,
};

const MainColumn = ({ stories, showHeroImage }) => {
  const [firstStory, ...remainingStories] = stories;

  return (
    <div styleName="first-column">
      <MainStory story={firstStory} showHeroImage={showHeroImage} />
      {remainingStories.map((story, index) => (
        <div key={story.id}>
          <CommonStory story={story} showThumbnail={true} showBorder={index !== remainingStories.length - 1} />
        </div>
      ))}
    </div>
  );
};

MainColumn.propTypes = {
  stories: array,
  showHeroImage: bool,
};

const TopComponentAd = () => {
  const adConfig = useSelector((state) => get(state, ["qt", "config", "ads-config", "slots", "top_component_ad"], {}));
  return (
    <div styleName="ad-wrapper">
      <div styleName="ad-label">Advertisement</div>
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

const SecondaryColumn = ({ stories, showAd }) => {
  return (
    <div styleName="second-column">
      {showAd && <TopComponentAd />}
      {stories.map((story, index) => (
        <div key={story.id}>
          <CommonStory story={story} showThumbnail={false} showBorder={index !== stories.length - 1} />
        </div>
      ))}
    </div>
  );
};

SecondaryColumn.propTypes = {
  stories: array,
  showAd: bool,
};

const ThirdColumn = ({ stories, photos_label, showAd }) => {
  return (
    <div styleName="third-column">
      {showAd && <TopComponentAd />}
      <div styleName="third-column-stories">
        <div styleName="left-stories">
          {stories.slice(0, 3).map((story, index) => (
            <div key={story.id}>
              <CommonStory story={story} showThumbnail={false} showBorder={index !== 2} />
            </div>
          ))}
        </div>
        <div>
          <div>
            <CommonStory story={stories[3]} showThumbnail={false} showBorder={false} />
          </div>
          <div styleName="text-with-line">{photos_label}</div>
          <div styleName="photos-container">
            {stories.slice(4, 6).map((story) => {
              const label = getLabelToShow(story);

              return (
                <div styleName="photo-story" key={story.id}>
                  <HeroImage story={story} headline={story.headline} aspectRatio={[4, 3]} styles="photo-card" />
                  {label && <p styleName="label">{label}</p>}
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
  photos_label: string,
  showAd: bool,
};

const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState("");

  // Determine device type based on window.innerWidth
  const determineDeviceType = () => {
    const width = window.innerWidth;
    if (width < 768) {
      setDeviceType("mobile");
    } else if (width < 1200) {
      setDeviceType("tablet");
    } else {
      setDeviceType("desktop");
    }
  };

  // Add event listener for window resize
  useEffect(() => {
    // Determine initial device type
    determineDeviceType();

    // Add event listener for window resize
    window.addEventListener("resize", determineDeviceType);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener("resize", determineDeviceType);
    };
  }, []);

  return deviceType;
};

export const ThreeColNineteenStories = ({ collection, stories }) => {
  const deviceType = useDeviceType();
  const { primary_in_first_column, photos_label, show_main_story_hero_image } = get(
    collection,
    ["associated-metadata"],
    {}
  );

  return (
    <div
      styleName={`three-col-nine-stories ${
        primary_in_first_column || deviceType === "mobile" ? "first-variation" : "second-variation"
      }`}
    >
      <MainColumn stories={stories.slice(0, 5)} showHeroImage={show_main_story_hero_image} />
      <SecondaryColumn stories={stories.slice(5, 13)} showAd={deviceType === "mobile"} />
      <ThirdColumn stories={stories.slice(13, 19)} showAd={deviceType !== "mobile"} photos_label={photos_label} />
    </div>
  );
};

ThreeColNineteenStories.propTypes = {
  collection: object,
  stories: array,
};

ThreeColNineteenStories.storyLimit = 19;
