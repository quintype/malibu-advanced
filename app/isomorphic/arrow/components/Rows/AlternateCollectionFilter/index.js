import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import get from "lodash.get";
import { useDispatch, useSelector } from "react-redux";
import { collectionToStories } from "@quintype/components";

import { CollectionName } from "../../Atoms/CollectionName";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { StoryCard } from "../../Molecules/StoryCard";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { HeroImage } from "../../Atoms/HeroImage";
import { getTextColor, generateNavigateSlug, navigateTo } from "../../../utils/utils";
import { StateProvider } from "../../SharedContext";
import { Loading } from "../../Svgs/Loading/loading";

import "./alternate-collection-filter.m.css";

const AlternateCollectionFilter = ({ collection, config = {} }) => {
  const {
    collectionNameBorderColor = "",
    borderColor = "",
    theme = "",
    border = "",
    collectionNameTemplate = "",
    footerSlotConfig = {},
    footerButton = "",
    showButton = true
  } = config;
  const { footerSlot } = footerSlotConfig;

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
        let res = await axios.get(`/api/v1/collections/${id}?limit=7`);
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

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(getFilteredCollection[active], qtConfig);

  const items = subCollectionStories.slice(0, 9);
  const textColor = getTextColor(theme);

  const openChildCollectionItems = (event, index, slug) => {
    event.stopPropagation();
    fetchSubCollectionData(slug);
    let activeIndex = active === index ? 0 : index;
    handleActive(activeIndex);
  };

  const footerSlotComp = footerSlot ? footerSlot() : null;

  const getCustomStyleName = textColor === "light" ? "light-wrapper" : "";

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="collection-filter"
      style={{ backgroundColor: theme || "initial" }}>
      <div styleName={`wrapper ${getCustomStyleName}`}>
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="collection-filter">
          <div styleName="child-collections">
            {getFilteredCollection.map((subCollections, index) => {
              return (
                <div
                  key={index}
                  className={`child-collection-wrapper ${index === active ? "open-subchild" : ""}`}
                  styleName={`child-collection-wrapper ${index === active ? "open-subchild" : ""}`}>
                  <div
                    styleName={`child-collection ${textColor}`}
                    onClick={(event) => openChildCollectionItems(event, index, subCollections.id)}>
                    {subCollections.name}
                  </div>
                  <span className={`navigator ${textColor}`} styleName={`navigator ${textColor}`} />
                </div>
              );
            })}
          </div>
          <span styleName={`divider ${textColor}`} className={`divider ${textColor}`} />
          <div styleName="subCollection-wrapper">
            {loading ? (
              <Loading />
            ) : (
              <div styleName="subCollection-stories">
                <div styleName="cards">
                  {items.slice(0, 6).map((story, index) => (
                    <div styleName="card" key={index}>
                      <StoryCard story={story} border={border} theme={theme} config={config}>
                        <HeroImage story={story} aspectRatio={[[16, 9]]} />
                        <StorycardContent story={story} border={border} borderColor={borderColor} config={config} />
                      </StoryCard>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {items.length > 6 && (
          <LoadmoreButton
            collection={getFilteredCollection[active]}
            template={footerButton}
            config={config}
            navigate={() => navigateTo(dispatch, url)}
            qtConfig={qtConfig}
          />
        )}
        <div styleName={`${showButton ? "" : "no-button-wrapper"}`}>{footerSlotComp}</div>
      </div>
    </div>
  );
};

export default StateProvider(AlternateCollectionFilter);

AlternateCollectionFilter.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    //  section tag border color
    borderColor: PropTypes.string,
    //   background color of the row
    theme: PropTypes.string,
    border: PropTypes.string,
    collectionNameTemplate: PropTypes.string,
    footerSlotConfig: PropTypes.object,
    footerButton: PropTypes.string,
    collectionNameBorderColor: PropTypes.string
  })
};

AlternateCollectionFilter.defaultProps = {
  theme: "#ffffff",
  slotConfig: "story",
  border: ""
};
