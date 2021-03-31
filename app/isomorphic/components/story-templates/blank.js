import React, { Fragment, useEffect } from "react";
import PT from "prop-types";
import { useSelector } from "react-redux";
import { get } from "lodash";
import { ResponsiveImage, StoryElement } from "@quintype/components";

import { getAdSlots } from "../ads/utils";

import "../ads/dfp-component/dfp-component.m.css";

function StoryCard(props) {
  return (
    <div>
      {props.card["story-elements"].map(element => (
        <StoryElement element={element} key={element.id} story={props.story} loadIframeOnClick />
      ))}
    </div>
  );
}

StoryCard.propTypes = {
  card: PT.object,
  story: PT.object
};

const BlankStoryTemplate = props => {
  const qtState = useSelector(state => get(state, ["qt"], {}));
  const adsConfig = get(qtState, ["config", "ads-config"], {});
  const enableAds = get(adsConfig, ["dfp_ads", "enable_ads"]);
  const adConfig = get(adsConfig, ["slots", "story-page-ads"], {});
  const loadAdsSynchronously = get(adsConfig, ["dfp_ads", "load_ads_synchronously"], null);

  useEffect(() => {
    if (enableAds) {
      const sectionSlug = get(props, ["story", "sections", 0, "slug"], "NA");
      getAdSlots({
        path: adConfig.adUnit,
        size: adConfig.sizes,
        id: `story-card-${props.story.id}-ad`,
        qtState,
        viewPortSizeMapping: adConfig.viewPortSizeMapping,
        storySectionSlug: sectionSlug,
        refreshAdUnit: true,
        loadAdsSynchronously,
        delayPeriod: 4000
      });
    }
  }, [props.story]);

  return (
    <div className="blank-story container">
      <figure className="blank-story-image qt-image-16x9">
        <ResponsiveImage
          slug={props.story["hero-image-s3-key"]}
          metadata={props.story["hero-image-metadata"]}
          aspectRatio={[16, 9]}
          defaultWidth={480}
          widths={[250, 480, 640]}
          imgParams={{ auto: ["format", "compress"] }}
        />
      </figure>
      <h1>{props.story.headline}</h1>
      <span className="blank-story-author">{props.story["author-name"]}</span>
      {props.story.cards.map((card, index) => (
        <Fragment key={index}>
          <StoryCard key={card.id} card={card} story={props.story} />
          {enableAds && index === 0 && (
            <div styleName="ad-slot ad-slot-size-300x250" id={`story-card-${props.story.id}-ad`} />
          )}
        </Fragment>
      ))}
      <div className="space-before-next-story" style={{ minHeight: 100 }} />
    </div>
  );
};

BlankStoryTemplate.propTypes = {
  card: PT.object,
  story: PT.object
};

function BlankStory(props) {
  return (
    <div className="story-grid">
      <BlankStoryTemplate story={props.story} />
    </div>
  );
}

BlankStory.propTypes = {
  story: PT.object
};

export { BlankStory };
