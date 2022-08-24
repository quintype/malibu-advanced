import React, { Fragment, useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import get from "lodash/get";
import { CollectionName } from "../../Atoms/CollectionName";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { StoryCard } from "../../Molecules/StoryCard";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { HeroImage } from "../../Atoms/HeroImage";
import { getTextColor, getSlot, generateNavigateSlug, navigateTo } from "../../../utils/utils";
import { StateProvider } from "../../SharedContext";
import { Loading } from "../../Svgs/Loading/loading";
import { collectionToStories } from "@quintype/components";

import "./collection-filter.m.css";
import { useDispatch, useSelector } from "react-redux";

const CollectionFilter = ({ collection, config = {} }) => {
  const {
    collectionNameBorderColor = "",
    borderColor = "",
    theme = "",
    slotConfig = [],
    border = "",
    collectionNameTemplate = "",
    footerSlotConfig = {},
    footerButton = ""
  } = config;
  const { type = "story", component } = get(slotConfig, [0], {});
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
        const res = await axios.get(`/api/v1/collections/${id}`);
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
    const activeIndex = active === index ? 0 : index;
    handleActive(activeIndex);
  };

  const getVerticalCard = (story, index) => (
    <div styleName="card" key={index}>
      <StoryCard
        story={story}
        isHorizontalMobile
        theme={theme}
        border={border}
        borderColor={borderColor}
        config={config}>
        <HeroImage story={story} isHorizontalMobile />
        <StorycardContent story={story} border={border} borderColor={borderColor} config={config} />
      </StoryCard>
    </div>
  );

  const getHorizontalCard = (story, index) => (
    <div styleName="card" key={index}>
      <StoryCard story={story} isHorizontal theme={theme} border={border} borderColor={borderColor} config={config}>
        <HeroImage story={story} isHorizontal aspectRatio={[[1, 1]]} />
        <StorycardContent story={story} isHorizontal border={border} borderColor={borderColor} config={config} />
      </StoryCard>
    </div>
  );

  const storySlot = (items) => {
    return (
      <div>
        {items.slice(6, 9).map((story, index) => {
          return (
            <div styleName="card" key={index}>
              <StoryCard
                story={story}
                isHorizontal
                theme={theme}
                border={border}
                borderColor={borderColor}
                config={config}>
                <HeroImage story={story} isHorizontal aspectRatio={[[1, 1]]} />
                <StorycardContent story={story} border={border} borderColor={borderColor} config={config} />
              </StoryCard>
            </div>
          );
        })}
      </div>
    );
  };

  const footerSlotComp = footerSlot ? footerSlot() : null;
  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="collection-filter"
      style={{ backgroundColor: theme, color: textColor }}>
      <div styleName="wrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="collection-filter">
          <div styleName="child-collections">
            {getFilteredCollection.map((subCollections, index) => {
              return (
                <div key={index} styleName={`child-collection-wrapper ${index === active ? "open-subchild" : ""}`}>
                  <div
                    styleName={`child-collection ${textColor}`}
                    onClick={(event) => openChildCollectionItems(event, index, subCollections.id)}>
                    {subCollections.name}
                  </div>
                  <span styleName={`navigator ${textColor}`} />
                </div>
              );
            })}
          </div>
          <span styleName={`divider ${textColor}`} />
          <div styleName="subCollection-wrapper">
            {loading ? (
              <Loading />
            ) : (
              <div styleName="subCollection-stories">
                <div styleName="cards">
                  {items.slice(0, 1).map((story, index) => {
                    return (
                      <div styleName="card" key={index}>
                        <StoryCard story={story} border={border} theme={theme} config={config}>
                          <HeroImage story={story} aspectRatio={[[16, 9]]} />
                          <StorycardContent story={story} border={border} borderColor={borderColor} config={config} />
                        </StoryCard>
                      </div>
                    );
                  })}
                  {items.slice(1, 4).map((story, index) => {
                    return <Fragment key={index}>{getVerticalCard(story, index)}</Fragment>;
                  })}
                </div>

                <div styleName="last-column">
                  {items.slice(4, 6).map((story, index) => {
                    return <Fragment key={index}>{getHorizontalCard(story, index)}</Fragment>;
                  })}
                  {getSlot(type, component, () => storySlot(items))}
                </div>
              </div>
            )}
          </div>
        </div>
        <LoadmoreButton
          collection={getFilteredCollection[active]}
          template={footerButton}
          config={config}
          navigate={() => navigateTo(dispatch, url)}
          qtConfig={qtConfig}
        />
        {footerSlotComp}
      </div>
    </div>
  );
};

export default StateProvider(CollectionFilter);

CollectionFilter.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    //  section tag border color
    borderColor: PropTypes.string,
    //   background color of the row
    theme: PropTypes.string,
    border: PropTypes.string,
    // configure ad slot widget and story
    slotConfig: PropTypes.array,
    collectionNameTemplate: PropTypes.string,
    footerSlotConfig: PropTypes.object,
    footerButton: PropTypes.string,
    collectionNameBorderColor: PropTypes.string
  })
};

CollectionFilter.defaultProps = {
  theme: "#ffffff",
  slotConfig: "story",
  border: ""
};
