import { get } from "lodash";

export const isValidEmail = email => {
  const re = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;
  if (!re.test(email)) return false;
  if (email.length > 150 || email.length < 6) return false;
  return true;
};

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

export const useDfpSlot = ({ path, size, id, qtState }) => {
  const googletag = window.googletag || {};

  const pageType = get(qtState, ["pageType"]) || "";
  const environment = get(qtState, ["config", "publisher-attributes", "env"], "");

  const sectionSlug = getStorySectionSlug(qtState, pageType);
  const sectionId = getStorySectionId(qtState, pageType);
  const StoryId = getStoryId(qtState, pageType);
  const sectionList = getSectionList(qtState, pageType);
  const tagList = getTagList(qtState, pageType);

  let mobileSize = [300, 250];
  if (path === "/5463099287/BannerAd") {
    mobileSize = [320, 50];
  }

  googletag.cmd = googletag.cmd || [];

  googletag.cmd.push(function() {
    googletag.pubads().refresh();
  });

  googletag.cmd.push(function() {
    const responsiveAdSlot = googletag
      .defineSlot(path, size, id)
      .setTargeting("pageType", pageType)
      .setTargeting("pageType", pageType)
      .setTargeting("environment", environment)
      .setTargeting("sectionSlug", sectionSlug)
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
    googletag.pubads().enableLazyLoad({
      fetchMarginPercent: 0,
      renderMarginPercent: 0,
      mobileScaling: 0
    });

    googletag.pubads().addEventListener("slotRequested", function(event) {
      updateSlotStatus(event.slot.getSlotElementId(), "fetched");
    });

    googletag.pubads().addEventListener("slotOnload", function(event) {
      updateSlotStatus(event.slot.getSlotElementId(), "rendered");
    });

    googletag.enableServices();
  });

  function updateSlotStatus(slotId, state) {
    var elem = document.getElementById(slotId + "-" + state);
    if (elem) {
      elem.className = "activated";
      elem.innerText = "Yes";
    }
  }

  googletag.cmd.push(function() {
    googletag.display(id);
  });
};
