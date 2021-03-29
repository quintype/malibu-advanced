import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { get } from "lodash";

import { DfpComponent } from "./dfp-component";
import { appendGoogleTagServices } from "./utils";

export const TopAd = () => {
  const qtState = useSelector(state => get(state, ["qt"], {}));
  const enableAds = get(qtState, ["config", "ads-config", "dfp_ads", "enable_ads"]);
  const loadAdsSynchronously = get(qtState, ["config", "ads-config", "dfp_ads", "load_ads_synchronously"]);
  const currentPath = get(qtState, ["currentPath"]);
  const pageType = get(qtState, ["pageType"]);
  const collectionSlug = get(qtState, ["data", "collection", "slug"]);
  const topAdConfig = get(qtState, ["config", "ads-config", "slots", "top-ad"], {});

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
      path={topAdConfig.adUnit}
      size={topAdConfig.sizes}
      viewPortSizeMapping={topAdConfig.viewPortSizeMapping}
      type="top-ad"
    />
  );
};
