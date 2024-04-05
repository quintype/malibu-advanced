import React from "react";
import get from "lodash/get";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { HeroImage } from "../../Atoms/HeroImage";
import { StateProvider } from "../../SharedContext";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { collectionToStories } from "@quintype/components";
import { CollectionName } from "../../Atoms/CollectionName";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { generateNavigateSlug, getSlot, navigateTo, rgbToHex } from "../../../utils/utils";
import { ProgressiveHydration } from "../../../hydration-component";
import { LoadMoreTarget } from "../../Atoms/LoadMoreTarget";
import "./four-col-five-stories.m.css";

const loadMore = ({ isLoading, renderStories, getMoreStories, subsequentLoadCount = 4 }) => {
  if (isLoading) return;
  const limit = subsequentLoadCount;
  const offset = renderStories.length + 1;
  getMoreStories(offset, limit);
};

const FourColFiveStories = ({
  collection,
  config,
  getMoreStories,
  isLoadMoreVisible,
  isLoading,
  isolatedLoadMore,
  hideFirstCard
}) => {
  const stories = collectionToStories(collection);
  if (!stories.length) return null;

  const {
    collectionNameBorderColor = "",
    theme = "",
    slotConfig = [],
    collectionNameTemplate = "",
    footerButton = "",
    borderColor = "",
    subsequentLoadCount = 4,
    showSubheadline = false
  } = config;
  const { type = "story", component } = get(slotConfig, [0], {});
  const sectionTagBorderColor = rgbToHex(borderColor);
  const adWidgetSlot = type === "ad" || type === "widget" ? getSlot(type, component) : null;

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));

  const [firstStory, ...otherStories] = stories || [];

  const storyCard = (story) => (
    <>
      <HeroImage config={config} story={story} aspectRatio={[[16, 9]]} />
      <StorycardContent
        theme={theme}
        story={story}
        config={config}
        headerLevel={6}
        borderColor={sectionTagBorderColor}
        showSubheadline={showSubheadline}
        collectionId={collection.id}
      />
    </>
  );

  const otherCards = (story, index) => (
    <div styleName="card" data-test-id="story-card" key={`four-col-five-story-${index}-${get(story, ["id"], "0")}`}>
      {storyCard(story)}
    </div>
  );

  const getLoadMore = (opts) => {
    if (!isLoadMoreVisible) return null;

    if (isolatedLoadMore) {
      return (
        <LoadMoreTarget
          collection={collection}
          componentName={"FourColFiveStories"}
          offset={stories.length}
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

  const renderStories = hideFirstCard ? stories : otherStories;

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="four-col-five-stories"
      style={{ backgroundColor: theme || "initial" }}>
      <div styleName="four-col-five-stories">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
          headerLevel={2}
        />
        <div styleName="wrapper">
          {!hideFirstCard && (
            <div className="first-card" styleName="first-card" data-test-id="story-card">
              {storyCard(firstStory)}
            </div>
          )}
          <div className="other-cards" styleName="other-cards">
            {renderStories.slice(0, 3).map((story, index) => otherCards(story, index))}
            {adWidgetSlot}
            {renderStories.slice(3).map((story, index) => otherCards(story, index))}
          </div>
        </div>
        {getLoadMore({ isLoading, renderStories, getMoreStories, subsequentLoadCount })}
      </div>
    </div>
  );
};

FourColFiveStories.propTypes = {
  collection: PropTypes.object,
  config: PropTypes.shape({
    collectionNameBorderColor: PropTypes.string,
    theme: PropTypes.string,
    slotConfig: PropTypes.array,
    collectionNameTemplate: PropTypes.string,
    footerButton: PropTypes.string,
    borderColor: PropTypes.string,
    subsequentLoadCount: PropTypes.number,
    showSubheadline: PropTypes.bool
  }),
  getMoreStories: PropTypes.func,
  isLoading: PropTypes.bool,
  hideFirstCard: PropTypes.bool,
  isLoadMoreVisible: PropTypes.bool,
  isolatedLoadMore: PropTypes.bool
};

FourColFiveStories.defaultProps = {
  getMoreStories: () => {},
  isLoadMoreVisible: true,
  isLoading: false,
  collection: {},
  config: {},
  hideFirstCard: false
};

export default StateProvider(FourColFiveStories);
