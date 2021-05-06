import path from "path";
import get from "lodash/get";
import { ChunkExtractor } from "@loadable/server";

const statsFile = path.resolve("stats.json");

/**
 * Returns css of 1st arrow row. If 1st row isn't arrow, returns empty str
 * This can be used to add styles while server-side rendering
 * For this to work, separate CSS chunks need to be created for every arrow row that will be used in the app
 * Layout names here should match those in template-options.yml
 */
export function getArrowCriticalCss(
  state,
  { qtAssetHelpers = require("@quintype/framework/server/asset-helper") } = {}
) {
  const layout = get(state, ["qt", "data", "collection", "items", 0, "associated-metadata", "layout"], null);
  switch (layout) {
    case "ArrowElevenStories":
      return getAsset("arrowElevenStoriesCssChunk.css", qtAssetHelpers);
    case "ArrowFourColGrid":
      return getAsset("arrowFourColGridCssChunk.css", qtAssetHelpers);
    case "ArrowFourColTwelveStories":
      return getAsset("arrowFourColTwelveStoriesCssChunk.css", qtAssetHelpers);
    case "ArrowFullScreenSlider":
      return getAsset("arrowFullScreenSliderCssChunk.css", qtAssetHelpers);
    case "ArrowOneColStoryList":
      return getAsset("arrowOneColStoryListCssChunk.css", qtAssetHelpers);
    case "ArrowThreeColGrid":
      return getAsset("arrowThreeColGridCssChunk.css", qtAssetHelpers);
    case "ArrowThreeColSevenStories":
      return getAsset("arrowThreeColSevenStoryCssChunk.css", qtAssetHelpers);
    case "ArrowTwoColFourStories":
      return getAsset("arrowTwoColFourStoriesCssChunk.css", qtAssetHelpers);
    default:
      return "";
  }
}

function getAsset(asset, qtAssetHelpers) {
  const { assetPath, readAsset } = qtAssetHelpers;
  return assetPath(asset) ? readAsset(asset) : "";
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
