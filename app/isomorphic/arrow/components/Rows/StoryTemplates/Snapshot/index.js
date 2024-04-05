import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import { Link } from "@quintype/components";

import { StateProvider } from "../../../SharedContext";

import "./snapshot.m.css";

import { SectionTag } from "../../../Atoms/SectionTag";
import { StoryHeadline } from "../../../Atoms/StoryHeadline";
import { AuthorCard } from "../../../Atoms/AuthorCard";
import { HeroImage } from "../../../Atoms/HeroImage";
import { PublishDetails } from "../../../Atoms/PublishDetail";
import { getTextColor } from "../../../../utils/utils";

const Snapshot = ({ story = {}, config = {} }) => {
  const { theme = "", publishedDetails = {}, premiumStoryIconConfig = {}, authorDetails = {}, buttonText } = config;

  const textColor = getTextColor(config.theme);
  const timezone = useSelector((state) => get(state, ["qt", "data", "timezone"], null));

  const findFirstElement = () => {
    let storyElement = {};
    story.cards &&
      story.cards.find((card) => {
        const storyElements = card["story-elements"];
        return storyElements.find((elem) => {
          if (elem.type === "text" || elem.type === "title") {
            storyElement = elem;
            return true;
          }
          return false;
        });
      });
    return storyElement;
  };

  const firstElement = findFirstElement() || {};
  const truncate = (string = "", limit = 60, ellipsis = true) => {
    const putEllipsis = ellipsis ? " ..." : "";
    return typeof string === "string" && string.length > limit ? string.substring(0, limit) + putEllipsis : string;
  };
  return (
    <div
      data-test-id="snapshot-template"
      className="arrow-component arr--content-wrapper arr--snapshot-story"
      style={{ backgroundColor: theme }}
      styleName={`wrapper ${textColor}`}
    >
      <HeroImage story={story} aspectRatio={[[16, 9]]} />
      <SectionTag story={story} />
      <StoryHeadline story={story} premiumStoryIconConfig={premiumStoryIconConfig} />
      {authorDetails && <AuthorCard story={story} template={authorDetails.template} opts={authorDetails.opts} />}
      <PublishDetails story={story} opts={publishedDetails} template="story" timezone={timezone} />
      {!isEmpty(firstElement) && (
        <div styleName="read-more-card">
          <div key={firstElement.id} styleName={`read-more-overlay`}>
            <bdi
              styleName={`${textColor}`}
              dangerouslySetInnerHTML={{ __html: truncate(firstElement.text, 400, true) }}
            />
            <div
              styleName="content-overlay"
              style={{
                backgroundImage: `linear-gradient(180deg,hsla(0,0%,100%,0), ${config.theme})`,
              }}
            />
          </div>
        </div>
      )}
      <div styleName={`read-more-btn ${textColor}`}>
        <Link href={story.url} rel="noopener noreferrer" aria-label="read-button" styleName="hyperlink-button">
          {buttonText || "Read More"}
        </Link>
      </div>
    </div>
  );
};

Snapshot.propTypes = {
  story: PropTypes.object,
  config: PropTypes.shape({
    templateType: PropTypes.string,
    authorCard: PropTypes.object,
    asideCollection: PropTypes.object,
  }),
  firstChild: PropTypes.node,
  secondChild: PropTypes.node,
  storyElementsConfig: PropTypes.object,
  adComponent: PropTypes.func,
  widgetComp: PropTypes.func,
};

export default StateProvider(Snapshot);
