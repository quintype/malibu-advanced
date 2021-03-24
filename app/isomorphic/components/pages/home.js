import React from "react";
import { object, shape } from "prop-types";
import { LazyCollection, LazyLoadImages, replaceAllStoriesInCollection, WithPreview } from "@quintype/components";

import { getCollectionTemplate } from "../get-collection-template";
import { DfpComponent } from "../ads/dfp-component";

export const HomePage = props => (
  <div className="container">
    <LazyLoadImages>
      <DfpComponent
        adType="res-ad-slot-size-300x250"
        id="banner-ad"
        path="/6355419/Travel/Europe/France/Paris"
        size={[300, 250]}
      />
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
