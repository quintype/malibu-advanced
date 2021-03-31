// Implement more logic here

import React from "react";
import { array, object } from "prop-types";
import { useSelector } from "react-redux";
import { get } from "lodash";

import { StoryGrid } from "../../story-grid";
import { DfpComponent } from "../../ads/dfp-component";

import "./four-col-grid.m.css";

export function FourColGrid({ collection, stories }) {
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "listing_page_ads"], {}));

  return (
    <div>
      <h2 styleName="heading">{collection.name}</h2>
      <StoryGrid stories={stories} />
      <DfpComponent
        adStyleName="ad-slot-size-300x250"
        id={`fourcol-${collection.slug}-ad`}
        path={adConfig.ad_unit}
        size={adConfig.sizes}
        viewPortSizeMapping={adConfig.view_port_size_mapping}
      />
    </div>
  );
}

FourColGrid.propTypes = {
  collection: object,
  stories: array
};

FourColGrid.storyLimit = 8;
