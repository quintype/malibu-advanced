import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import get from "lodash.get";
import { collectionToStories } from "@quintype/components";

import { CollectionName } from "../../Atoms/CollectionName";
import { getTextColor } from "../../../utils/utils";
import { StateProvider } from "../../SharedContext";
import { Loading } from "../../Svgs/Loading/loading";
import { Headline } from "../../Atoms/Headline";

import "./listicles.m.css";

const Listicles = ({ collection, config = {} }) => {
  const {
    collectionNameBorderColor = "",
    theme = "",
    collectionNameTemplate = "",
    slotConfig = null,
    localizedNumbers = null,
  } = config;

  const [subCollectionStories, handleApiData] = useState([]);
  const [cachedStories, updateCachedStories] = useState({});
  const [active, handleActive] = useState(0);
  const [loading, handleLoading] = useState(true);

  const getFilteredCollection = get(collection, ["items"], []).filter(
    (collections) => collections.type === "collection"
  );

  if (getFilteredCollection.length < 1) {
    return null;
  }

  const filteredCollectionids = getFilteredCollection.map((subCol) => subCol.id);

  const memoizeStories = (id, data) => {
    updateCachedStories((cachedStories) => ({ ...cachedStories, [id]: data }));
  };

  async function fetchSubCollectionData(id = filteredCollectionids[0]) {
    handleLoading(true);
    try {
      let data = {};
      if (!(id in cachedStories)) {
        const res = await axios.get(`/api/v1/collections/${id}?limit=9`);
        data = res.data;
      } else data = cachedStories[id];
      memoizeStories(id, data);

      const childCollectionItems = collectionToStories(data);
      handleLoading(false);
      handleApiData(childCollectionItems);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("API call failed", error);
    }
  }

  useEffect((id) => {
    fetchSubCollectionData(id);
  }, []);

  const items = subCollectionStories.slice(0, 9);
  const textColor = getTextColor(theme);

  const openChildCollectionItems = (event, index, slug) => {
    event.stopPropagation();
    fetchSubCollectionData(slug);
    const activeIndex = active === index ? 0 : index;
    handleActive(activeIndex);
  };

  const getCustomStyleName = textColor === "light" ? "light-wrapper" : "";

  const generateOpinions = () => {
    if (slotConfig) {
      return (
        <div styleName="six-opinions-container">
          {getOpinions(6)}
          <div>{slotConfig()}</div>
        </div>
      );
    }

    return getOpinions();
  };

  const getOpinions = (numberOfStories = 9) => {
    return (
      <div styleName="opinions-wrapper">
        {items.slice(0, numberOfStories).map((story, index) => (
          <div styleName="opinion-wrapper" key={index}>
            {localizedNumbers && localizedNumbers.length > 0 ? (
              <div styleName="opinion-counter">{localizedNumbers[index]}</div>
            ) : (
              <div styleName="opinion-counter">{index + 1}</div>
            )}
            <Headline story={story} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="collection-filter"
      style={{ backgroundColor: theme, color: textColor }}>
      <div styleName={`wrapper ${getCustomStyleName}`}>
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="child-collections" className="child-collections">
          {getFilteredCollection.map((subCollections, index) => {
            return (
              <div
                key={index}
                className={index === active ? "open-subchild" : ""}
                styleName={`child-collection-wrapper ${index === active ? "open-subchild" : ""}`}>
                <div
                  styleName={`child-collection ${textColor}`}
                  onClick={(event) => openChildCollectionItems(event, index, subCollections.id)}>
                  {subCollections.name}
                </div>
              </div>
            );
          })}
        </div>

        <div>{loading ? <Loading /> : generateOpinions()}</div>
      </div>
    </div>
  );
};

export default StateProvider(Listicles);

Listicles.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    //   background color of the row
    theme: PropTypes.string,
    // configure ad slot widget and story
    slotConfig: PropTypes.func,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string
  })
};

Listicles.defaultProps = {
  theme: "#ffffff",
  slotConfig: "story",
  border: ""
};
