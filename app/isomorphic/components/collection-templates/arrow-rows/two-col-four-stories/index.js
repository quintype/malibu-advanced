import React from "react";
import TwoColFourStories from "../../../../arrow/components/Rows/TwoColFourStory";
import { object } from "prop-types";
import get from "lodash/get";

export const ArrowTwoColFourStories = ({ collection }) => {
  const associatedMetadata = get(collection, ["associated-metadata"], {});

  // based on background we need to determine if darkmode and set theme
  const backgroundColor = associatedMetadata.row_background_color || "#FFFFFF";
  const hideRowTitle = associatedMetadata.hide_row_title || false;
  const collectionNameBorderColor = associatedMetadata.collection_name_border_color || "#e43232";
  const hideSectionTag = associatedMetadata.hide_section_tag || false;
  const sectionBorderColor = associatedMetadata.section_border_color || "#e43232";
  const hideAuthor = associatedMetadata.hide_author || false;
  const hideTimestamp = associatedMetadata.hide_timestamp || false;
  const hideReadTime = associatedMetadata.hide_read_time || false;
  const hideButton = associatedMetadata.hide_button || false;
  const buttonText = associatedMetadata.button_text;

  const config = {
    theme: backgroundColor,
    collectionNameBorderColor: collectionNameBorderColor,
    borderColor: sectionBorderColor,
    border: "default",
    showSection: !hideSectionTag,
    showAuthor: !hideAuthor,
    showTime: !hideTimestamp,
    showRowTitle: !hideRowTitle,
    showButton: !hideButton,
    showReadTime: !hideReadTime,
    buttonText: buttonText,
    showLiveIcon: true,
  };
  return <TwoColFourStories collection={collection} config={config} />;
};

ArrowTwoColFourStories.propTypes = {
  collection: object,
};

ArrowTwoColFourStories.storyLimit = 4;
