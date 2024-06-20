import React from "react";
import FourColPortraitStories from "../../../../arrow/components/Rows/FourColPortraitStories";
import { object } from "prop-types";
import { collectionToStories } from "@quintype/components";
import get from "lodash.get";

export const ArrowFourColPortraitStories = ({ collection }) => {
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
    border: "",
    collectionNameTemplate: "borderLeft",
    sectionTagTemplate: "borderLeft",
    showSection: !hideSectionTag,
    showAuthor: !hideAuthor,
    showTime: !hideTimestamp,
    showRowTitle: !hideRowTitle,
    buttonText: buttonText,
    showButton: !hideButton,
    showReadTime: !hideReadTime,
  };
  return <FourColPortraitStories collection={collection} config={config} />;
};

ArrowFourColPortraitStories.propTypes = {
  collection: object,
};

ArrowFourColPortraitStories.storyLimit = 4;
