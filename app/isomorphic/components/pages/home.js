import React, { useEffect } from "react";
import { object, shape } from "prop-types";
import { LazyCollection, LazyLoadImages, replaceAllStoriesInCollection, WithPreview } from "@quintype/components";
import { getCollectionTemplate } from "../get-collection-template";
import { useDfpSlot } from "../utils";

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
