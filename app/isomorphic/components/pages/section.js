import React, { useState } from "react";
import { string, shape, object } from "prop-types";
import get from "lodash/get";
import { collectionToStories, LazyCollection } from "@quintype/components";
import { useSelector } from "react-redux";
import { OneColStoryList } from "@quintype/arrow";

import { getCollectionTemplate } from "../get-collection-template";
import { DfpComponent } from "../ads/dfp-component";
import { getLoadMoreStories } from "../utils";

const SectionPage = props => {
  const adConfig = useSelector(state => get(state, ["qt", "config", "ads-config", "slots", "listing_page_ads"], {}));
  const [storiesToRender, setStoriesToRender] = useState(8);
  const [sectionPageStories, setStories] = useState(props.data.collection.items);

  const getMoreStories = async (offset, limit) => {
    const loadMoreStories = await getLoadMoreStories({
      offset: offset,
      limit: limit,
      slug: props.data.section.id,
      query: "section-id"
    });
    setStories(sectionPageStories.slice(0, storiesToRender).concat(loadMoreStories));
    setStoriesToRender(storiesToRender + offset);
  };

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

  const collection = {
    items: !childCollections.length ? sectionPageStories.slice(0, storiesToRender) : props.data.collection.items
  };

  const pageTitle =
    props.pageType === "collection-page"
      ? props.data.collection.name
      : `Section - ${props.data.section["display-name"] || props.data.section.name}`;

  return (
    <div className="container">
      <h1>{pageTitle}</h1>
      <OneColStoryList
        collection={collection}
        config={{ buttonText: "Load More", footerButton: "SubsequentLoadCount" }}
        isLoadMoreVisible={!childCollections.length && sectionPageStories.length > storiesToRender}
        getMoreStories={getMoreStories}
      />
      <DfpComponent
        adStyleName="ad-slot-size-300x250"
        id="section-page-ad"
        path={adConfig.ad_unit}
        size={adConfig.sizes}
        viewPortSizeMapping={adConfig.view_port_size_mapping}
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
