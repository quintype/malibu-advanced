import { collectionToStories } from "@quintype/components";
import get from "lodash.get";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ProgressiveHydration } from "../../../hydration-component";
import { generateNavigateSlug, getSlot, navigateTo } from "../../../utils/utils";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { CollectionName } from "../../Atoms/CollectionName";
import { Headline } from "../../Atoms/Headline";
import { HeroImage } from "../../Atoms/HeroImage";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { SectionTag } from "../../Atoms/SectionTag";
import { Subheadline } from "../../Atoms/Subheadline";
import { StoryCard } from "../../Molecules/StoryCard";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { StateProvider } from "../../SharedContext";
import "./one-col-story-list.m.css";
import { LoadMoreTarget } from "../../Atoms/LoadMoreTarget";

const loadMore = ({ isLoading, storyItems, getMoreStories, subsequentLoadCount = 8 }) => {
  if (isLoading) return;
  const limit = subsequentLoadCount;
  const offset = storyItems.length;
  getMoreStories(offset, limit);
};

const OneColStoryList = ({
  collection,
  config = {},
  getMoreStories,
  isLoadMoreVisible,
  isLoading,
  isolatedLoadMore,
}) => {
  const storyItems = collectionToStories(collection);
  if (!storyItems.length) return null;
  const {
    collectionNameBorderColor = "",
    borderColor = "",
    theme = "",
    border = "",
    slotConfig = [],
    collectionNameTemplate = "",
    footerSlotConfig = {},
    footerButton = "",
    localizationConfig = {},
    subsequentLoadCount = 8,
  } = config;

  const { footerSlot } = footerSlotConfig;
  const { type, component } = get(slotConfig, [0], {});

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));

  const getLoadMore = (opts) => {
    if (!isLoadMoreVisible) return null;
    if (isolatedLoadMore) {
      return (
        <LoadMoreTarget
          collection={collection}
          componentName={"OneColStoryList"}
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

  const footerSlotComp = footerSlot ? footerSlot() : null;
  const borderHandler = (story) => {
    switch (border) {
      case "bottom":
        return (
          <div styleName="one-col-border-bottom">
            <StoryCard
              story={story}
              theme={theme}
              headerLevel="6"
              isHorizontal
              border={border}
              aspectRatio={[[16, 9]]}
              borderColor={borderColor}
              prefix="By"
              config={config}
              collectionId={collection.id}
            />
          </div>
        );
      case "full":
        return (
          <div styleName="one-col-border-full">
            <StoryCard
              config={config}
              story={story}
              border={border}
              theme={theme}
              isHorizontal
              borderColor={borderColor}
            >
              <HeroImage story={story} isHorizontal aspectRatio={[[16, 9]]} />
              <div styleName="story-card-content-wrapper">
                <StorycardContent story={story} borderColor={borderColor} config={config}>
                  <SectionTag story={story} />
                  <Headline story={story} headerLevel="6" premiumStoryIconConfig={config} />
                  <Subheadline story={story} />
                  <AuthorWithTime config={localizationConfig} story={story} prefix="By" collectionId={collection.id} />
                </StorycardContent>
              </div>
            </StoryCard>
          </div>
        );
      default:
        return (
          <div styleName="one-col-border-default">
            <StoryCard
              story={story}
              theme={theme}
              headerLevel="6"
              isHorizontal
              border={border}
              aspectRatio={[[16, 9]]}
              borderColor={borderColor}
              prefix="By"
              config={config}
              collectionId={collection.id}
            />
          </div>
        );
    }
  };

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="one-col-story-list"
      style={{ backgroundColor: theme || "initial" }}
    >
      <div styleName="one-col-story-list-wrapper ">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="wrapper" style={{ backgroundColor: theme || "initial" }}>
          <div styleName="one-col-first-story">
            {storyItems.slice(0, 1).map((story, index) => {
              return <div key={`default-${index}`}>{borderHandler(story)}</div>;
            })}
          </div>
          <div styleName="one-col-story-list">
            {storyItems.slice(1).map((story, index) => {
              return <div key={`default-${index}`}>{borderHandler(story)}</div>;
            })}
          </div>
          <div styleName="one-col-ads">
            {getSlot(
              type,
              component,
              () => null,
              () => null
            )}
          </div>
        </div>
        <div styleName="footer-ad-wrapper">
          {getLoadMore({ isLoading, storyItems, getMoreStories, subsequentLoadCount })}
          <div styleName="ad-wrapper">{footerSlotComp}</div>
        </div>
      </div>
    </div>
  );
};
OneColStoryList.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    borderColor: PropTypes.string,
    theme: PropTypes.string,
    border: PropTypes.string,
    footerButton: PropTypes.string,
    // row title style
    collectionNameTemplate: PropTypes.string,
    // row title style colour
    collectionNameBorderColor: PropTypes.string,
    subsequentLoadCount: PropTypes.number,
  }),
  getMoreStories: PropTypes.func,
  isLoadMoreVisible: PropTypes.bool,
  isLoading: PropTypes.bool,
  isolatedLoadMore: PropTypes.bool,
};

OneColStoryList.defaultProps = {
  getMoreStories: () => {},
  isLoadMoreVisible: true,
  isLoading: false,
};

export default StateProvider(OneColStoryList);
