import { get } from "lodash";

export const isValidEmail = email => {
  const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  if (!re.test(email)) return false;
  if (email.length > 150 || email.length < 6) return false;
  return true;
};

const getStorySectionName = (state, pageType) => {
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

export const useDfpSlot = ({ path, size, id, qtState }) => {
  const publisherAttributes = get(qtState, ["config", "publisher-attributes"]) || {};
  const googletag = window.googletag || {};
  const pageType = get(qtState, ["pageType"]) || "";
  const environment = get(publisherAttributes, ["env"], "");
  const sectionName = getStorySectionName(qtState, pageType);
  const sectionId = getStorySectionId(qtState, pageType);
  const StoryId = getStoryId(qtState, pageType);
  const sectionList = getSectionList(qtState, pageType);
  const tagList = getTagList(qtState, pageType);
  const enableLazyLoadAds = get(publisherAttributes, ["dfp_ads", "enable_lazy_load_ads"], true);
  const fetchMarginPercent = get(publisherAttributes, ["dfp_ads", "fetch_margin_percent"], 0);
  const renderMarginPercent = get(publisherAttributes, ["dfp_ads", "render_margin_percent"], 0);
  const mobileScaling = get(publisherAttributes, ["dfp_ads", "mobile_scaling"], 0);

  let mobileSize = [300, 250];
  if (id === "top-ad") {
    mobileSize = [320, 50];
  }

  googletag.cmd = googletag.cmd || [];
  googletag.cmd.push(function() {
    var responsiveAdSlot = googletag
      .defineSlot(path, size, id)
      .setTargeting("pageType", pageType)
      .setTargeting("environment", environment)
      .setTargeting("sectionName", sectionName)
      .setTargeting("sectionId", sectionId)
      .setTargeting("storyId", StoryId)
      .setTargeting("sectionList", sectionList)
      .setTargeting("tagList", tagList)

      .addService(googletag.pubads());

    var mapping = googletag
      .sizeMapping()
      .addSize([1024, 0], [[728, 90]])
      .addSize([0, 0], mobileSize)
      .build();

    responsiveAdSlot.defineSizeMapping(mapping);

    // Lazy loading
    if(enableLazyLoadAds) {
      googletag.pubads().enableLazyLoad({
      fetchMarginPercent,  // Fetch slots within specified viewports
      renderMarginPercent,   // Render slots within specified viewports
      mobileScaling // Multiplies the specified value with the above values for mobile
    });

    googletag.pubads().addEventListener("slotRequested", function(event) {
      updateSlotStatus(event.slot.getSlotElementId(), "fetched");
    });

    googletag.pubads().addEventListener("slotOnload", function(event) {
      updateSlotStatus(event.slot.getSlotElementId(), "rendered");
    });

    function updateSlotStatus(slotId, state) {
      var elem = document.getElementById(slotId + "-" + state);
      if (elem) {
        elem.className = "activated";
        elem.innerText = "Yes";
      }
    }
  }

    googletag.enableServices();
  });

  googletag.cmd.push(function() {
    googletag.display(id);
  });

};
