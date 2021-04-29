import path from "path";
import get from "lodash/get";
import { assetPath, readAsset } from "@quintype/framework/server/asset-helper";
import { ChunkExtractor } from "@loadable/server";
import { PAGE_TYPE } from "../../isomorphic/constants";

const statsFile = path.resolve("stats.json");

export function getArrowCriticalCss(pageType) {
  const { HOME_PAGE } = PAGE_TYPE;
  switch (pageType) {
    case HOME_PAGE:
      return assetPath("arrowHomePageStyles.css") ? readAsset("arrowHomePageStyles.css") : "";
  }
}

export const getConfig = state => {
  return {
    gtmId: get(state, ["qt", "config", "publisher-attributes", "google_tag_manager", "id"], ""),
    isGtmEnable: get(state, ["qt", "config", "publisher-attributes", "google_tag_manager", "is_enable"], false),
    gaId: get(state, ["qt", "config", "publisher-attributes", "google_analytics", "id"], ""),
    isGaEnable: get(state, ["qt", "config", "publisher-attributes", "google_analytics", "is_enable"], false),
    cdnImage: get(state, ["qt", "config", "cdn-image"], ""),
    isOnesignalEnable: get(state, ["qt", "config", "publisher-attributes", "onesignal", "is_enable"], false),
    enableAds: get(state, ["qt", "config", "ads-config", "dfp_ads", "enable_ads"]),
    loadAdsSynchronously: get(state, ["qt", "config", "ads-config", "dfp_ads", "load_ads_synchronously"])
  };
};

export const extractor = new ChunkExtractor({ statsFile, entrypoints: ["topbar", "navbar", "footer"] });
export const getCriticalCss = async () => {
  const criticalCss = await extractor.getCssString();
  return criticalCss.trim();
};
