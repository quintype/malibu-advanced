import React from "react";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import PropTypes from "prop-types";

import { collectionToStories } from "@quintype/components";

import { CollectionName } from "../../Atoms/CollectionName";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { generateNavigateSlug, getTextColor, navigateTo } from "../../../utils/utils";
import { StateProvider } from "../../SharedContext";
import { ProgressiveHydration } from "../../../hydration-component";
import { LoadMoreTarget } from "../../Atoms/LoadMoreTarget";
import PortraitStoryCard from "../../Molecules/PortraitStoryCard";

import "./four-col-portrait-stories.m.css";

const loadMore = ({ isLoading, storyItems, getMoreStories, subsequentLoadCount = 4 }) => {
  if (isLoading) return; // prevent multiple clicks/calls
  const limit = subsequentLoadCount;
  const offset = storyItems.length;
  getMoreStories(offset, limit);
};

const FourColPortraitStories = ({
  collection,
  config = {},
  getMoreStories,
  isLoadMoreVisible,
  isLoading,
  isolatedLoadMore
}) => {
  const storyItems = collectionToStories(collection);

  if (!storyItems.length) return null;

  const {
    collectionNameBorderColor = "",
    borderColor = "",
    theme = "",
    border = "",
    collectionNameTemplate = "",
    footerSlotConfig = {},
    footerButton = "",
    customCollectionName,
    navigate = true,
    subsequentLoadCount = 4
  } = config;

  const { footerSlot } = footerSlotConfig;
  const footerSlotComp = typeof footerSlot === "function" ? footerSlot() : null;
  const textColor = getTextColor(theme);

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));

  const getLoadMore = (opts) => {
    if (!isLoadMoreVisible) return null;

    if (isolatedLoadMore) {
      return (
        <LoadMoreTarget
          collection={collection}
          componentName={"FourColPortraitStories"}
          offset={storyItems.length}
          limit={subsequentLoadCount}
        />
      );
    }

    const url = generateNavigateSlug(collection, qtConfig);
    return (
      <ProgressiveHydration>
        <LoadmoreButton
          config={config}
          collection={collection}
          template={footerButton}
          onClick={() => loadMore(opts)}
          navigate={() => navigateTo(dispatch, url)}
          qtConfig={qtConfig}
        />
      </ProgressiveHydration>
    );
  };

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="four-col-portrait-stories"
      style={{ backgroundColor: theme, color: textColor }}>
      <div styleName="four-col-portrait">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
          customCollectionName={customCollectionName}
          navigate={navigate}
        />
        <div styleName="wrapper">
          {storyItems.map((story, index) => {
            return (
              <PortraitStoryCard
                story={story}
                border={border}
                theme={theme}
                config={Object.assign({ showSection: false, showAuthor: false, showReadTime: false }, config)}
                borderColor={borderColor}
                key={`story-card-${index}`}
              />
            );
          })}
        </div>
        {getLoadMore({ isLoading, storyItems, getMoreStories, subsequentLoadCount })}
        {footerSlotComp}
      </div>
    </div>
  );
};

FourColPortraitStories.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    borderColor: PropTypes.string,
    theme: PropTypes.string,
    border: PropTypes.bool,
    collectionNameTemplate: PropTypes.string,
    footerButton: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
    subsequentLoadCount: PropTypes.number
  }),
  getMoreStories: PropTypes.func,
  isLoadMoreVisible: PropTypes.bool,
  isLoading: PropTypes.bool,
  isolatedLoadMore: PropTypes.bool
};

FourColPortraitStories.defaultProps = {
  getMoreStories: () => {},
  isLoadMoreVisible: true,
  isLoading: false
};

export default StateProvider(FourColPortraitStories);
