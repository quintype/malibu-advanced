import React from "react";
import { object, shape } from "prop-types";
import { LazyCollection, LazyLoadImages, replaceAllStoriesInCollection, WithPreview } from "@quintype/components";

import { getCollectionTemplate } from "../get-collection-template";

export const HomePage = props => {
  console.log("HOME COLLECTION:", props.data.collection);
  return(
  <div className="container">
    <h1> VEENA 2</h1>
    <LazyLoadImages>
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
