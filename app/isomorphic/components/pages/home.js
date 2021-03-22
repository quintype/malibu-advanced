import React, { useEffect } from "react";
import { object, shape } from "prop-types";
import { LazyCollection, LazyLoadImages, replaceAllStoriesInCollection, WithPreview } from "@quintype/components";
import { getCollectionTemplate } from "../get-collection-template";
import { useDfpSlot } from "../utils";
import { DfpComponent } from "../ads/dfp-component";

export const HomePage = props => {
  useEffect(() => {
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
