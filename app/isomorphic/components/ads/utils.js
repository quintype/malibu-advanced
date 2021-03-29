import { get } from "lodash";

const getStorySectionSlug = (state, pageType) => {
  if (pageType === "story-page") {
    return get(state, ["data", "story", "sections", 0, "slug"]);
  } else if (pageType === "section-page") {
    return get(state, ["data", "section", "slug"]);
  }
  return "NA";
};

const getStorySectionId = (state, pageType) => {
  if (pageType === "story-page") {
    return get(state, ["data", "story", "sections", 0, "id"]);
  } else if (pageType === "section-page") {
    return get(state, ["data", "section", "id"]);
  }
  return "NA";
};

const getStoryId = (state, pageType) => {
  if (pageType === "story-page") {
    return get(state, ["data", "story", "id"]) || "NA";
  }
  return "NA";
};

const getSectionList = (state, pageType) => {
  if (pageType === "story-page") {
    const sections = get(state, ["data", "story", "sections"], []);
    const sectionList = sections.map(item => item.name);
    return sectionList;
  }

  return [];
};

const getTagList = (state, pageType) => {
  if (pageType === "story-page") {
    const tags = get(state, ["data", "story", "tags"], []);
    const tagList = tags.length > 0 ? tags.map(item => item.name) : [];
    return tagList;
  }

  return [];
};

export const useDfpSlot = ({ path, size, id, qtState, type = "" }) => {
  const publisherAttributes = get(qtState, ["config", "publisher-attributes"], {});
  const googletag = window.googletag || {};

  const pageType = get(qtState, ["pageType"], "");
  const environment = get(publisherAttributes, ["env"], "");
  const sectionSlug = getStorySectionSlug(qtState, pageType);
  const sectionId = getStorySectionId(qtState, pageType);
  const storyId = getStoryId(qtState, pageType);
  const sectionList = getSectionList(qtState, pageType);
  const tagList = getTagList(qtState, pageType);
  const enableLazyLoadAds = get(publisherAttributes, ["dfp_ads", "enable_lazy_load_ads"], true);
  const fetchMarginPercent = get(publisherAttributes, ["dfp_ads", "fetch_margin_percent"], 0);
  const renderMarginPercent = get(publisherAttributes, ["dfp_ads", "render_margin_percent"], 0);
  const mobileScaling = get(publisherAttributes, ["dfp_ads", "mobile_scaling"], 0);

  let mobileSize = [300, 250];
  if (type === "top-ad") {
    mobileSize = [320, 50];
  }

  googletag.cmd = googletag.cmd || [];

  googletag.cmd.push(function() {
    const responsiveAdSlot = googletag.defineSlot(path, size, id);

    if (responsiveAdSlot) {
      responsiveAdSlot
        .addService(googletag.pubads())
        .setTargeting("pageType", pageType)
        .setTargeting("environment", environment)
        .setTargeting("sectionSlug", sectionSlug)
        .setTargeting("sectionId", sectionId)
        .setTargeting("storyId", storyId)
        .setTargeting("sectionList", sectionList)
        .setTargeting("tagList", tagList);

      const mapping = googletag
        .sizeMapping()
        .addSize([1024, 0], [[728, 90]])
        .addSize([0, 0], mobileSize)
        .build();

      responsiveAdSlot.defineSizeMapping(mapping);
    }

    // Lazy loading
    if (enableLazyLoadAds) {
      const updateSlotStatus = (slotId, state) => {
        var elem = document.getElementById(slotId + "-" + state);
        if (elem) {
          elem.className = "activated";
          elem.innerText = "Yes";
        }
      };

      googletag.pubads().enableLazyLoad({
        fetchMarginPercent, // Fetch slots within specified viewports
        renderMarginPercent, // Render slots within specified viewports
        mobileScaling // Multiplies the specified value with the above values for mobile
      });

      googletag.pubads().addEventListener("slotRequested", function(event) {
        updateSlotStatus(event.slot.getSlotElementId(), "fetched");
      });

      googletag.pubads().addEventListener("slotOnload", function(event) {
        updateSlotStatus(event.slot.getSlotElementId(), "rendered");
      });
    }

    googletag.enableServices();
  });

  googletag.cmd.push(function() {
    googletag.display(id);
  });
};

export const appendGoogleTagServices = () => {
  const script = document.createElement("script");
  const isSSL = document.location.protocol === "https:";
  script.src = (isSSL ? "https:" : "http:") + "//www.googletagservices.com/tag/js/gpt.js";
  const node = document.getElementsByTagName("script")[0];
  script.setAttribute("async", "");
  node.parentNode.insertBefore(script, node);
};
