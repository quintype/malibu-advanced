import React, { Fragment } from "react";
import PT from "prop-types";
import { useSelector } from "react-redux";
import { get } from "lodash";

import { ResponsiveImage, StoryElement } from "@quintype/components";
import { DfpComponent } from "../ads/dfp-component";

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

function BlankStoryTemplate(props) {
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "story_page_ads"], {}));

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
          <DfpComponent
            adStyleName="ad-slot-size-300x250"
            id={`story-card-ad-${index}`}
            path={adConfig.ad_unit}
            size={adConfig.sizes}
            viewPortSizeMapping={adConfig.view_port_size_mapping}
          />
        </Fragment>
      ))}
      <div className="space-before-next-story" style={{ minHeight: 100 }} />
    </div>
  );
}

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
