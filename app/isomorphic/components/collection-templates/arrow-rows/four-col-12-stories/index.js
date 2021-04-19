import React from "react";
import { FourColTwelveStories } from "@quintype/arrow";
import { object } from "prop-types";
import "@quintype/arrow/FourColTwelveStories/styles.arrow.css";

export const ArrowFourColTwelveStories = ({collection}) => {

  const contextConfig = {
    theme: "#ffffff",
    isborder: true,
    showSection: true,
    showAuthorTime: true,
    showSubheadline: true
  };
  return (
     <FourColTwelveStories
      collection={collection}
      config={contextConfig}
      otherTextData={{
        text: "और खबरें",
        textColor: "#f58220",
      }}
    />
  )
}

ArrowFourColTwelveStories.propTypes = {
  collection: object
}

ArrowFourColTwelveStories.storyLimit = 12;
