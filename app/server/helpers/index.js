import path from "path";
import get from "lodash/get";
import { assetPath, readAsset } from "@quintype/framework/server/asset-helper";
import { ChunkExtractor } from "@loadable/server";

const statsFile = path.resolve("stats.json");

/**
 * Returns the css of the first arrow row. "layout" is specified in template-options.yml
 */
export function getArrowCriticalCss(params) {
  const layout = get(params, ["data", "collection", "items", 0, "associated-metadata", "layout"], null);
  switch (layout) {
    case "ArrowThreeColSevenStories":
      return assetPath("arrowThreeColSevenStoryChunk.css") ? readAsset("arrowThreeColSevenStoryChunk.css") : "";
    case "ArrowThreeColGrid":
      return assetPath("arrowThreeColGridChunk.css") ? readAsset("arrowThreeColGridChunk.css") : "";
    case "ArrowFourColGrid":
      return assetPath("arrowFourColGridChunk.css") ? readAsset("arrowFourColGridChunk.css") : "";
    default:
      return "";
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
