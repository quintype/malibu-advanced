import { LazyCollection, LazyLoadImages, replaceAllStoriesInCollection, WithPreview } from "@quintype/components";
import { object, shape } from "prop-types";
import React, { useEffect } from "react";
import { getCollectionTemplate } from "../get-collection-template";
import { useDfpSlot } from "../ads/dfp-slot";
import { DfpComponent } from "../ads/dfp-component";

export const HomePage = props => {
  useEffect(() => {
    setTimeout(function() {
      var gads = document.createElement("script");
      var useSSL = document.location.protocol === "https:";
      gads.src = (useSSL ? "https:" : "http:") + "//www.googletagservices.com/tag/js/gpt.js";
      var node = document.getElementsByTagName("script")[0];
      gads.setAttribute("async", "");
      node.parentNode.insertBefore(gads, node);
    }, 2000);

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
    }, 4000);
  }, []);

  return (
    <div className="container">
      <LazyLoadImages>
        <DfpComponent adType="ad-slot-size-250x250" id="banner-ad" />
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
