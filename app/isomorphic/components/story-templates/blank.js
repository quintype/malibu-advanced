import React, { Fragment, useEffect } from "react";
import PT from "prop-types";
import { useSelector } from "react-redux";
import { get } from "lodash";
import { ResponsiveImage, StoryElement } from "@quintype/components";

import { useDfpSlot } from "../ads/utils";

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
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "story-page-ads"], {}));
  const qtState = useSelector(state => get(state, ["qt"], {}));

  useEffect(() => {
    setTimeout(() => {
      const sectionSlug = get(props, ["story", "sections", 0, "slug"], "NA");
      useDfpSlot({
        path: adConfig.adUnit,
        size: adConfig.sizes,
        id: `story-card-${props.story.id}-ad`,
        qtState,
        viewPortSizeMapping: adConfig.viewPortSizeMapping,
        storySectionSlug: sectionSlug,
        refreshAdUnit: true
      });
    }, 5000);
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
          {index === 0 && <div styleName="ad-slot ad-slot-size-300x250" id={`story-card-${props.story.id}-ad`} />}
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
