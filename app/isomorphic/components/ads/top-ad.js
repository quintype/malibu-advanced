import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { get } from "lodash";

import { DfpComponent } from "./dfp-component";
import { appendGoogleTagServices } from "./utils";

export const TopAd = () => {
  const qtState = useSelector(state => get(state, ["qt"], {}));
  const enableAds = get(qtState, ["config", "ads-config", "dfp_ads", "enable_ads"], null);
  const loadAdsSynchronously = get(qtState, ["config", "ads-config", "dfp_ads", "load_ads_synchronously"], null);
  const currentPath = get(qtState, ["currentPath"], null);
  const pageType = get(qtState, ["pageType"], null);
  const collectionSlug = get(qtState, ["data", "collection", "slug"], null);
  const topAdConfig = get(qtState, ["config", "ads-config", "slots", "top-ad"], {});

  useEffect(() => {
    if (enableAds && !loadAdsSynchronously) {
      setTimeout(function() {
        appendGoogleTagServices();
      }, 3000);
    }
  }, []);

  useEffect(() => {
    console.log("foooooo", typeof window.googletag.cmd, window.googletag);
    if (window.googletag.cmd) {
      const googletag = window.googletag || {};
      googletag.cmd.push(function() {
        googletag.pubads().refresh();
      });
    }
  }, [currentPath]);

  return (
    <DfpComponent
      adStyleName="ad-slot-size-320x50"
      id={`${pageType}-banner-${collectionSlug}-ad`}
      path={topAdConfig.adUnit}
      size={topAdConfig.sizes}
      viewPortSizeMapping={topAdConfig.viewPortSizeMapping}
      type="top-ad"
    />
  );
};
