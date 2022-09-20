import { collectionToStories } from "@quintype/components";
import get from "lodash/get";
import PropTypes from "prop-types";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { ProgressiveHydration } from "../../../hydration-component";
import { generateNavigateSlug, getSlot, getTextColor, navigateTo } from "../../../utils/utils";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { CollectionName } from "../../Atoms/CollectionName";
import { Headline } from "../../Atoms/Headline";
import { HeroImage } from "../../Atoms/HeroImage";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { LoadMoreTarget } from "../../Atoms/LoadMoreTarget";
import { SectionTag } from "../../Atoms/SectionTag";
import { StoryCard } from "../../Molecules/StoryCard";
import { StateProvider } from "../../SharedContext";
import "./three-col-flex-stories.m.css";

const FlexCard = ({ story = {}, config = {} }) => {
  const { borderColor = "", border = "", theme = "", localizationConfig = {} } = config;
  return (
    <div styleName="card">
      <StoryCard story={story} isHorizontal theme={theme} border={border} borderColor={borderColor} config={config}>
        <HeroImage
         story={story}
         aspectRatio={[
           [9, 5],
           [9, 5],
          ]}
        />
        <div styleName="card-content" className="small-card-container">
          <SectionTag story={story} borderColor={borderColor} />
          <Headline story={story} headerLevel="6" premiumStoryIconConfig={config} />
          <AuthorWithTime config={localizationConfig} story={story} prefix="By" />
        </div>
      </StoryCard>
    </div>
  );
};

const loadMore = ({ isLoading, stories, getMoreStories, subsequentLoadCount = 3 }) => {
  if (isLoading) return;
  const limit = subsequentLoadCount;
  const offset = stories.length;
  getMoreStories(offset, limit);
};

const ThreeColFlexStories = ({
  collection = {},
  config = {},
  getMoreStories,
  isLoadMoreVisible,
  isLoading,
  isolatedLoadMore,
  hideFirstCard,
}) => {
  const collectionItems = collectionToStories(collection);
  if (collectionItems.length < 1) {
    return null;
  }

  const {
    collectionNameBorderColor = "",
    theme = "",
    slotConfig = [],
    collectionNameTemplate = "",
    footerButton = "",
    subsequentLoadCount = 3,
  } = config;
  const { type = "story", component } = get(slotConfig, [0], {});
  const isAdWidgetEnabled = type === "ad" || type === "widget";
  const adWidgetSlot = isAdWidgetEnabled ? getSlot(type, component) : null;

  const textColor = getTextColor(theme);

  const stories = type !== "story" ? collectionItems : collectionToStories(collection);

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));

  const getLoadMore = (opts) => {
    if (!isLoadMoreVisible) return null;

    if (isolatedLoadMore) {
      return (
        <LoadMoreTarget
          collection={collection}
          componentName={"ThreeColFlexStories"}
          offset={stories.length}
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
      data-test-id="three-col-flex-stories"
      style={{ backgroundColor: theme, color: textColor }}
    >
      <div styleName="wrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
          headerLevel="2"
        />
        {isAdWidgetEnabled && !hideFirstCard ? (
          <>
            <div styleName="row-with-ad">
              <div styleName="card-with-ad">
                {stories.slice(0, 4).map((story) => (
                  <FlexCard story={story} config={config} key={story.id} />
                ))}
              </div>
              <div styleName="ad-wrapper">{adWidgetSlot}</div>
            </div>
            <div styleName="card-row">
              {stories.slice(4).map((story) => (
                <FlexCard story={story} config={config} key={story.id} />
              ))}
            </div>
          </>
        ) : (
          <div styleName="card-row">
            {stories.map((story) => (
              <FlexCard story={story} config={config} key={story.id} />
            ))}
          </div>
        )}
        {getLoadMore({ isLoading, stories, getMoreStories, subsequentLoadCount })}
      </div>
    </div>
  );
};
export default StateProvider(ThreeColFlexStories);

ThreeColFlexStories.propTypes = {
  /**  collection is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  /** The config for the Row */
  config: PropTypes.shape({
    borderColor: PropTypes.string,
    theme: PropTypes.string,
    border: PropTypes.string,
    slotConfig: PropTypes.array,
    footerButton: PropTypes.string,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
    subsequentLoadCount: PropTypes.number,
  }),
  getMoreStories: PropTypes.func,
  isLoadMoreVisible: PropTypes.bool,
  isLoading: PropTypes.bool,
  isolatedLoadMore: PropTypes.bool,
  hideFirstCard: PropTypes.bool,
};

FlexCard.propTypes = {
  story: PropTypes.object.isRequired,
  config: PropTypes.shape({
    borderColor: PropTypes.string,
    theme: PropTypes.string,
    border: PropTypes.string,
    localizationConfig: PropTypes.object,
  }),
};

ThreeColFlexStories.defaultProps = {
  getMoreStories: () => {},
  isLoadMoreVisible: true,
  isLoading: false,
  hideFirstCard: false,
};
