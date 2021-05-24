import React, { useState } from "react";
import PropTypes from "prop-types";
import get from "lodash/get";
import { getMoreAuthorStories, filterCollectionStories } from "./helpers";
import { useSelector } from "react-redux";

export const LoadMoreHoc = ({ Component, defaultLoadCount }) => {
  const WrappedComponent = ({ collection, config = {} }) => {
    const initialLoadCount = parseInt(get(config, ["initialLoadCount"], defaultLoadCount));
    const collectionStories = filterCollectionStories(collection.items);
    const initialCollectionItems = collectionStories.slice(0, initialLoadCount);
    const canShowLoadMoreInitially = initialCollectionItems.length >= initialLoadCount;
    const [isLoadMoreVisible, setIsLoadMoreVisible] = useState(canShowLoadMoreInitially);
    const [collectionItems, setCollectionItems] = useState(initialCollectionItems);
    const [isLoading, setIsLoading] = useState(false);
    const updatedCollection = { ...collection, items: collectionItems };

    const getMoreStories = async (offset, limit) => {
      const author = useSelector(state => get(state, ["qt", "data", "author"], {}));
      const pageType = useSelector(state => get(state, ["qt", "pageType"], ""));
      setIsLoading(true);
      let response;
      switch (pageType) {
        case "author-page":
          response = await getMoreAuthorStories({ author, offset, limit });
          break;
      }
      if (response.items.length) {
        setCollectionItems([...collectionItems, ...response.items]);
      } else {
        setIsLoadMoreVisible(false);
      }
      setIsLoading(false);
    };

    return (
      <Component
        collection={updatedCollection}
        config
        getMoreStories={getMoreStories}
        isLoadMoreVisible={isLoadMoreVisible}
        isLoading={isLoading}
      />
    );
  };
  WrappedComponent.propTypes = {
    collection: PropTypes.object.isRequired,
    config: PropTypes.object
  };
  return WrappedComponent;
};

LoadMoreHoc.propTypes = {
  component: PropTypes.element.isRequired,
  defaultLoadCount: PropTypes.number.isRequired
};
