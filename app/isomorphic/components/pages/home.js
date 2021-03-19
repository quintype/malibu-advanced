import { LazyCollection, LazyLoadImages, replaceAllStoriesInCollection, WithPreview } from "@quintype/components";
import { object, shape } from "prop-types";
import React, { useEffect } from "react";
import { getCollectionTemplate } from "../get-collection-template";

const useDfpSlot = ({ path, size, id }) => {
  const googletag = window.googletag || {};
  googletag.cmd = googletag.cmd || [];
  googletag.cmd.push(function() {
    googletag
      .defineSlot(path, size, id)
      .setTargeting("test", "lazyload")
      .addService(googletag.pubads());

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

  googletag.cmd.push(function() {
    googletag.display(id);
  });

  function updateSlotStatus(slotId, state) {
    var elem = document.getElementById(slotId + "-" + state);
    elem.className = "activated";
    elem.innerText = "Yes";
  }
};

export const HomePage = props => {
  useEffect(() => {
    var gads = document.createElement("script");
    var useSSL = document.location.protocol === "https:";
    gads.src = (useSSL ? "https:" : "http:") + "//www.googletagservices.com/tag/js/gpt.js";
    var node = document.getElementsByTagName("script")[0];
    gads.setAttribute("async", "");
    node.parentNode.insertBefore(gads, node);

    setTimeout(function() {
      useDfpSlot({
        path: "/6355419/Travel/Europe/France/Paris",
        size: [300, 250],
        id: "banner-ad"
      });

      useDfpSlot({
        path: "/6355419/Travel/Europe/France/Paris",
        size: [300, 250],
        id: "banner-ad-1"
      });
    }, 3000);
  }, []);

  return (
    <div className="container">
      <LazyLoadImages>
        <div id="banner-ad" style={{ width: "300px", height: "250px" }}></div>
        <LazyCollection collection={props.data.collection} collectionTemplates={getCollectionTemplate} lazyAfter={2} />
      </LazyLoadImages>
      <div id="banner-ad-1" style={{ width: "300px", height: "250px" }} />
    </div>
  );
};

HomePage.propTypes = {
  data: shape({
    collection: object
  })
};

export const HomePagePreview = WithPreview(HomePage, (data, story) =>
  Object.assign({}, data, {
    collection: replaceAllStoriesInCollection(data.collection, story)
  })
);
