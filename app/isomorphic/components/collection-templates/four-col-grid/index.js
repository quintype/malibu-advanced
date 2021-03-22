// Implement more logic here

import React from "react";
import { array, object } from "prop-types";
import { StoryGrid } from "../../story-grid";
import { DfpComponent } from "../../ads/dfp-component";
import "./four-col-grid.m.css";

export function FourColGrid({ collection, stories }) {
  return (
    <div>
      <h2 styleName="heading">{collection.name}</h2>
      <StoryGrid stories={stories} />
      <DfpComponent adType="ad-slot-size-300x250" id="banner-ad-1" />
    </div>
  );
}

FourColGrid.propTypes = {
  collection: object,
  stories: array
};

FourColGrid.storyLimit = 8;
