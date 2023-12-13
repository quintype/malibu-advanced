import React from "react";
import ThreeColFourteenStory from "../../../../arrow/components/Rows/ThreeColFourteenStory";
import { object } from "prop-types";
import get from "lodash.get";
import { collectionToStories } from "@quintype/components";

export const ArrowThreeColFourteenStories = ({ collection }) => {
  const items = collectionToStories(collection);

  if (items.length < 1) {
    return null;
  }

  const associatedMetadata = get(collection, ["associated-metadata"], {});

  if (associatedMetadata.alternative_collection_title) {
    collection.name = associatedMetadata.alternative_collection_title;
  }

  const backgroundColor = associatedMetadata.row_background_color || "#FFFFFF";
  const hideRowTitle = associatedMetadata.hide_row_title || false;
  const collectionNameBorderColor = associatedMetadata.collection_name_border_color || "##005D92";
  const hideSectionTag = associatedMetadata.hide_section_tag || false;
  const sectionBorderColor = associatedMetadata.section_border_color || "#005D92";
  const hideAuthor = associatedMetadata.hide_author || false;
  const hideTimestamp = associatedMetadata.hide_timestamp || false;
  const hideReadTime = associatedMetadata.hide_read_time || false;
  const hideButton = associatedMetadata.hide_button || false;
  const buttonText = associatedMetadata.button_text;

  const config = {
    collectionNameBorderColor: collectionNameBorderColor,
    borderColor: sectionBorderColor,
    theme: backgroundColor,
    border: "fullBorder",
    collectionNameTemplate: "borderLeft",
    sectionTagTemplate: "borderLeft",
    showSection: !hideSectionTag,
    showAuthor: !hideAuthor,
    showTime: !hideTimestamp,
    showRowTitle: !hideRowTitle,
    buttonText: buttonText,
    showButton: !hideButton,
    showReadTime: !hideReadTime,
    showLiveIcon: true,
    showSubheadline: true,
  };
  return <ThreeColFourteenStory collection={collection} config={config} />;
};

ArrowThreeColFourteenStories.propTypes = {
  collection: object,
};

ArrowThreeColFourteenStories.storyLimit = 14;
