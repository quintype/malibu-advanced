import React from "react";
import { string, shape, object } from "prop-types";
import get from "lodash/get";
import { collectionToStories, LazyCollection } from "@quintype/components";
import { useSelector } from "react-redux";

import { StoryGrid } from "../story-grid";
import { getCollectionTemplate } from "../get-collection-template";
import { DfpComponent } from "../ads/dfp-component";

const SectionPage = props => {
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "listing-page-ads"], {}));

  const stories =
    (props.data.collection && props.data.collection.items && collectionToStories(props.data.collection)) || [];

  const noStoriesFound =
    props.pageType === "collection-page" ? "No Collection Stories Found" : "No Section Stories Found";

  if (stories.length === 0) {
    return <h1>{noStoriesFound}</h1>;
  }

  const childCollections = (get(props, ["data", "collection", "items"]) || []).filter(
    item => item.type === "collection" && item.items.length > 0
  );
  const pageTitle =
    props.pageType === "collection-page"
      ? props.data.collection.name
      : `Section - ${props.data.section["display-name"] || props.data.section.name}`;

  return (
    <div className="container">
      <h1>{pageTitle}</h1>
      <StoryGrid stories={stories} />
      <DfpComponent
        adStyleName="ad-slot-size-300x250"
        id="section-page-ad"
        path={adConfig.adUnit}
        size={adConfig.sizes}
        viewPortSizeMapping={adConfig.viewPortSizeMapping}
      />
      <LazyCollection collection={{ items: childCollections }} collectionTemplates={getCollectionTemplate} />
    </div>
  );
};

SectionPage.propTypes = {
  pageType: string,
  data: shape({
    collection: object,
    section: string
  })
};

export { SectionPage };
