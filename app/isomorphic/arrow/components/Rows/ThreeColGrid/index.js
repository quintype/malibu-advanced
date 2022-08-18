import React, { Fragment } from "react";
import get from "lodash.get";
import { StoryCard } from "../../Molecules/StoryCard";
import { HeroImage } from "../../Atoms/HeroImage";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { CollectionName } from "../../Atoms/CollectionName";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { getTextColor, getSlot, navigateTo, generateNavigateSlug } from "../../../utils/utils";
import { collectionToStories } from "@quintype/components";
import PropTypes from "prop-types";
import { StateProvider } from "../../SharedContext";
import "./three-col.m.css";
import { ProgressiveHydration } from "../../../hydration-component";
import { useDispatch, useSelector } from "react-redux";
import { LoadMoreTarget } from "../../Atoms/LoadMoreTarget";

const loadMore = ({ isLoading, storyItems, getMoreStories, subsequentLoadCount = 3 }) => {
  if (isLoading) return;
  const limit = subsequentLoadCount;
  const offset = storyItems.length;
  getMoreStories(offset, limit);
};

const ThreeColGrid = ({ collection, config = {}, getMoreStories, isLoadMoreVisible, isLoading, isolatedLoadMore }) => {
  const {
    collectionNameBorderColor = "",
    borderColor = "",
    theme = "",
    slotConfig = [],
    border = "",
    collectionNameTemplate = "",
    footerSlotConfig = {},
    footerButton = "",
    subsequentLoadCount = 3
  } = config;
  const storyItems = collectionToStories(collection);
  if (!storyItems.length) return null;

  const textColor = getTextColor(theme);
  const { footerSlot } = footerSlotConfig;
  const footerSlotComp = footerSlot ? footerSlot() : null;
  const { type = "", component } = get(slotConfig, [0], {});
  const adWidgetSlot = type === "ad" || type === "widget" ? getSlot(type, component) : null;

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));

  const getLoadMore = (opts) => {
    if (!isLoadMoreVisible) return null;

    if (isolatedLoadMore) {
      return (
        <LoadMoreTarget
          collection={collection}
          componentName={"ThreeColGrid"}
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

  const storyCard = (story) => {
    return (
      <div styleName="cards">
        <StoryCard story={story} border={border} theme={theme} isHorizontalMobile config={config}>
          <HeroImage aspectRatio={[[16, 9]]} story={story} isHorizontalMobile />
          <StorycardContent
            theme={theme}
            border={border}
            story={story}
            isHorizontalMobile
            borderColor={borderColor}
            config={config}
          />
        </StoryCard>
      </div>
    );
  };

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="three-col-grid"
      style={{ backgroundColor: theme, color: textColor }}>
      <div styleName="three-col-grid">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="wrapper">
          {storyItems.slice(0, 2).map((story, index) => {
            return <Fragment key={`story-3col1-${index}-${get(story, ["id"], "0")}`}>{storyCard(story)}</Fragment>;
          })}
          {storyItems.length < 2 && <div />}
          {adWidgetSlot}
          {storyItems.slice(2).map((story, index) => {
            return <Fragment key={`story-3col1-${index}-${get(story, ["id"], "0")}`}>{storyCard(story)}</Fragment>;
          })}
        </div>
        {getLoadMore({ isLoading, storyItems, getMoreStories, subsequentLoadCount })}
        {footerSlotComp}
      </div>
    </div>
  );
};

ThreeColGrid.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    theme: PropTypes.string,
    border: PropTypes.bool,
    slotConfig: PropTypes.array,
    footerButton: PropTypes.string,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
    subsequentLoadCount: PropTypes.number
  }),
  getMoreStories: PropTypes.func,
  isLoadMoreVisible: PropTypes.bool,
  isLoading: PropTypes.bool,
  isolatedLoadMore: PropTypes.bool
};

ThreeColGrid.defaultProps = {
  getMoreStories: () => {},
  isLoadMoreVisible: true,
  isLoading: false
};

export default StateProvider(ThreeColGrid);
