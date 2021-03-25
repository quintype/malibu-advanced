// Implement more logic here

import React, { useEffect } from "react";
import { array, object } from "prop-types";

import { StoryGrid } from "../../story-grid";
import { DfpComponent } from "../../ads/dfp-component";

import "./four-col-grid.m.css";
// import { useDfpSlot } from "../../utils";
// import { useSelector } from "react-redux";
// import { get } from "lodash";

export function FourColGrid({ collection, stories }) {
  // const qtState = useSelector(state => get(state, ["qt"], {}));

  useEffect(() => {
    if (window.googletag) {
      const googletag = window.googletag || {};
      googletag.cmd.push(function() {
        googletag.pubads().clear();
      });
    }

    const googletag = window.googletag || {};
    googletag.cmd = googletag.cmd || [];
    googletag.cmd.push(function() {
      googletag
        .defineSlot(
          "/5463099287/BannerAd",
          [
            [320, 50],
            [728, 90]
          ],
          "banner-ad-1"
        )
        .setTargeting("pageType", "home-page")
        .addService(googletag.pubads());
      googletag.enableServices();
    });

    googletag.cmd.push(function() {
      googletag.display("banner-ad-1");
    });
  }, []);

  return (
    <div>
      <h2 styleName="heading">{collection.name}</h2>
      <StoryGrid stories={stories} />
      <DfpComponent
        adType="res-ad-slot-size-300x250"
        id="banner-ad-1"
        path="/5463099287/BannerAd"
        size={[
          [320, 50],
          [728, 90]
        ]}
      />
    </div>
  );
}

FourColGrid.propTypes = {
  collection: object,
  stories: array
};

FourColGrid.storyLimit = 8;
