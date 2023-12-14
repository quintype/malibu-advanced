import React, { Fragment } from "react";
import { StoryCard } from "../../Molecules/StoryCard";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { HeroImage } from "../../Atoms/HeroImage";
import get from "lodash.get";
import { CollectionName } from "../../Atoms/CollectionName";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { generateNavigateSlug, navigateTo } from "../../../utils/utils";
import { collectionToStories } from "@quintype/components";
import PropTypes from "prop-types";
import { StateProvider } from "../../SharedContext";
import "./four-col.m.css";
import { ProgressiveHydration } from "../../../hydration-component";
import { useDispatch, useSelector } from "react-redux";
import { LoadMoreTarget } from "../../Atoms/LoadMoreTarget";

const loadMore = ({ isLoading, storyItems, getMoreStories, subsequentLoadCount = 4 }) => {
  if (isLoading) return; // prevent multiple clicks/calls
  const limit = subsequentLoadCount;
  const offset = storyItems.length;
  getMoreStories(offset, limit);
};

const FourColGrid = ({ collection, config = {}, getMoreStories, isLoadMoreVisible, isLoading, isolatedLoadMore }) => {
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
  const storyItems = collectionToStories(collection);

  if (!storyItems.length) return null;

  const { footerSlot } = footerSlotConfig;
  const footerSlotComp = footerSlot ? footerSlot() : null;

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));

  const getLoadMore = (opts) => {
    if (!isLoadMoreVisible) return null;

    if (isolatedLoadMore) {
      return (
        <LoadMoreTarget
          collection={collection}
          componentName={"FourColGrid"}
          offset={storyItems.length}
          limit={subsequentLoadCount}
          theme={theme}
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
      data-test-id="four-col-grid"
      style={{ backgroundColor: theme || "initial" }}>
      <div styleName="four-col-grid">
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
              <Fragment key={`story-4col-${index}-${get(story, ["id"], "0")}`}>
                <div styleName="story-card-wrapper" key={`default-${index}`}>
                  <StoryCard story={story} border={border} theme={theme} isHorizontalMobile config={config}>
                    <HeroImage aspectRatio={[[16, 9]]} story={story} isHorizontalMobile />
                    <StorycardContent
                      theme={theme}
                      border={border}
                      borderColor={borderColor}
                      story={story}
                      isHorizontalMobile
                      config={config}
                      collectionId={collection.id}
                    />
                  </StoryCard>
                </div>
              </Fragment>
            );
          })}
        </div>
        {getLoadMore({ isLoading, storyItems, getMoreStories, subsequentLoadCount })}
        {footerSlotComp}
      </div>
    </div>
  );
};

FourColGrid.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    borderColor: PropTypes.string,
    theme: PropTypes.string,
    border: PropTypes.bool,
    slotConfig: PropTypes.array,
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

FourColGrid.defaultProps = {
  getMoreStories: () => {},
  isLoadMoreVisible: true,
  isLoading: false
};

export default StateProvider(FourColGrid);
