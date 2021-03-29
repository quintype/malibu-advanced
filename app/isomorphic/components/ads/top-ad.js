import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { get } from "lodash";

import { DfpComponent } from "./dfp-component";
import { appendGoogleTagServices } from "./utils";

export const TopAd = () => {
  const enableAds = useSelector(state =>
    get(state, ["qt", "config", "publisher-attributes", "dfp_ads", "enable_ads"], true)
  );
  const loadAdsSynchronously = useSelector(state =>
    get(state, ["qt", "config", "publisher-attributes", "dfp_ads", "load_ads_synchronously"], false)
  );
  const currentPath = useSelector(state => get(state, ["qt", "currentPath"], "/"));
  const pageType = useSelector(state => get(state, ["qt", "pageType"], "home-page"));
  const collectionSlug = useSelector(state => get(state, ["qt", "data", "collection", "slug"], "home"));

  useEffect(() => {
    if (enableAds && !loadAdsSynchronously) {
      setTimeout(function() {
        appendGoogleTagServices();
      }, 3000);
    }
  }, []);

  useEffect(() => {
    if (window.googletag) {
      const googletag = window.googletag || {};
      googletag.destroySlots();
    }
  }, [currentPath]);

  return (
    <DfpComponent
      adStyleName="ad-slot-size-320x50"
      id={`${pageType}-banner-${collectionSlug}-ad`}
      path="/5463099287/BannerAd"
      size={[
        [320, 50],
        [728, 90]
      ]}
      type="top-ad"
    />
  );
};
