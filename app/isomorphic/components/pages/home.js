import React from "react";
import { object, shape } from "prop-types";
import { LazyCollection, LazyLoadImages, replaceAllStoriesInCollection, WithPreview } from "@quintype/components";

import { getCollectionTemplate } from "../get-collection-template";
import { TopAd } from "../ads/top-ad";

export const HomePage = props => (
  <div className="container">
    <TopAd id="home-banner-ad" />
    <LazyLoadImages>
      <LazyCollection collection={props.data.collection} collectionTemplates={getCollectionTemplate} lazyAfter={2} />
    </LazyLoadImages>
  </div>
);

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
