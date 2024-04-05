import React, { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import get from "lodash/get";
import { useDispatch, useSelector } from "react-redux";
import { collectionToStories } from "@quintype/components";

import { CollectionName } from "../../Atoms/CollectionName";
import { Headline } from "../../Atoms/Headline";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { StoryCard } from "../../Molecules/StoryCard";
import { HeroImage } from "../../Atoms/HeroImage";
import { getTextColor, generateNavigateSlug, navigateTo, getSlot } from "../../../utils/utils";
import { StateProvider } from "../../SharedContext";
import { Loading } from "../../Svgs/Loading/loading";

import "./astrology-collection.m.css";

const AstrologyCollection = ({ collection, config = {} }) => {
  const {
    collectionNameBorderColor = "",
    theme = "",
    border = "",
    collectionNameTemplate = "",
    footerButton = "",
    slotConfig = []
  } = config;

  const [subCollectionStories, handleApiData] = useState([]);
  const [cachedStories, updateCachedStories] = useState({});
  const [active, handleActive] = useState(0);
  const [loading, handleLoading] = useState(true);

  const { type = "story", component } = get(slotConfig, [0], {});
  const isAdWidgetEnabled = type === "ad" || type === "widget";
  const adWidgetSlot = isAdWidgetEnabled ? getSlot(type, component) : null;

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
        let res = await axios.get(`/api/v1/collections/${id}?limit=12`);

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

  const items = subCollectionStories.slice(0, 12);
  const textColor = getTextColor(theme);

  const openChildCollectionItems = (event, index, slug) => {
    event.stopPropagation();
    fetchSubCollectionData(slug);
    let activeIndex = active === index ? 0 : index;
    handleActive(activeIndex);
  };

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="astrology-collection"
      style={{ backgroundColor: theme || "initial" }}>
      <div styleName="wrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        {collection.summary && (
          <div styleName={`collection-summary ${textColor}`} data-test-id="astrology-collection-summary">
            {collection.summary}
          </div>
        )}
        <div styleName="tab" data-test-id="collection-tab">
          <ul styleName="child-collections">
            {getFilteredCollection.map((subCollections, index) => {
              return (
                <li
                  key={`tab-${index}`}
                  styleName={`child-collection ${textColor} ${index === active ? "open-subchild" : ""}`}
                  onClick={(event) => openChildCollectionItems(event, index, subCollections.id)}
                  data-test-id={subCollections.name}>
                  {subCollections.name}
                </li>
              );
            })}
          </ul>
        </div>
        <div styleName={isAdWidgetEnabled ? `main-wrapper` : "main-wrapper-container"}>
          <div>
            {loading ? (
              <Loading />
            ) : (
              <div styleName="subCollection-stories">
                {items.length === 0 && <p styleName={`nomore-stories ${textColor}`}>No more stories to load.</p>}
                {items.map((story, index) => (
                  <div styleName="card" key={`card-${index}`}>
                    <StoryCard story={story} border={border} theme={theme} config={config} isCircularImage={true}>
                      <HeroImage story={story} aspectRatio={[[1, 1]]} isCircularImage={true} />
                      <Headline story={story} headerLevel={6} premiumStoryIconConfig={config} />
                    </StoryCard>
                  </div>
                ))}
              </div>
            )}
          </div>
          {isAdWidgetEnabled && <div styleName="ads"> {adWidgetSlot}</div>}
        </div>

        {items.length >= 12 && (
          <LoadmoreButton
            collection={getFilteredCollection[active]}
            template={footerButton}
            config={config}
            navigate={() => navigateTo(dispatch, url)}
            qtConfig={qtConfig}
          />
        )}
      </div>
    </div>
  );
};

export default StateProvider(AstrologyCollection);

AstrologyCollection.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    //   background color of the row
    theme: PropTypes.string,
    border: PropTypes.string,
    collectionNameTemplate: PropTypes.string,
    footerButton: PropTypes.string,
    collectionNameBorderColor: PropTypes.string
  })
};

AstrologyCollection.defaultProps = {
  theme: "#ffffff",
  slotConfig: "story",
  border: ""
};
