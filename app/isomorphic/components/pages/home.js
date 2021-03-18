import { LazyCollection, LazyLoadImages, replaceAllStoriesInCollection, WithPreview } from "@quintype/components";
import { object, shape } from "prop-types";
import React, { useEffect } from "react";
import { getCollectionTemplate } from "../get-collection-template";

const useDfpSlot = ({ path, size, id }) => {
  useEffect(() => {
    const googletag = window.googletag || {};
    googletag.cmd = googletag.cmd || [];
    googletag.cmd.push(function() {
      googletag
        .defineSlot(path, size, id)
        .setTargeting("test", "lazyload")
        .addService(googletag.pubads());

      googletag.pubads().enableLazyLoad({
        fetchMarginPercent: 500,
        renderMarginPercent: 200,
        mobileScaling: 2.0
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
  }, [path, size, id]);
};

export const HomePage = props => {
  useDfpSlot({
    path: "/6355419/Travel/Europe/France/Paris",
    size: [300, 250],
    id: "banner-ad"
  });

  return (
    <div className="container">
      <LazyLoadImages>
        <div id="banner-ad" style={{ width: "300px", height: "250px" }} />
        <LazyCollection collection={props.data.collection} collectionTemplates={getCollectionTemplate} lazyAfter={2} />
      </LazyLoadImages>
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
