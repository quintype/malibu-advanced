import React from "react";
import PropTypes from "prop-types";
import PortraitStoryCard from "./PortraitStoryCard";
import "./portrait.m.css";
import { AdPlaceholder } from "../../atoms/Ad-placeholder";
import get from "lodash/get";

export const CollectionTitle = ({ collection }) => {
  return (
    <div styleName="title-with-ad">
      <p>{collection.name}</p>
      <AdPlaceholder width={100} height={35} />
    </div>
  );
};

CollectionTitle.propTypes = {
  collection: PropTypes.object.isRequired,
};

export const PortraitList = ({ stories }) => {
  return (
    <div styleName="portrait-list">
      {stories.map((story, index) => {
        return <PortraitStoryCard key={index} story={story} />;
      })}
    </div>
  );
};
PortraitList.propTypes = {
  stories: PropTypes.object,
};

export default function PortraitStories({ collection, stories }) {
  const associatedMetadata = get(collection, ["associated-metadata"], {});
  const showRowTitle = associatedMetadata.show_row_title || null;
  console.log("ROW TITLE 222:", collection, showRowTitle);

  return (
    <div styleName="wrapper">
      <CollectionTitle collection={collection} />
      <PortraitList stories={stories} />
    </div>
  );
}

PortraitStories.propTypes = {
  collection: PropTypes.object.isRequired,
  stories: PropTypes.array.isRequired,
};

PortraitStories.storyLimit = 6;
