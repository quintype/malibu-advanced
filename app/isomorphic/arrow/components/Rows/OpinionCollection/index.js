import React from "react";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import PropTypes from "prop-types";
import { collectionToStories } from "@quintype/components";
import { Author } from "../../Atoms/Author";
import { Headline } from "../../Atoms/Headline";
import AuthorImage from "../../Atoms/AuthorImage";
import { LoadMoreTarget } from "../../Atoms/LoadMoreTarget";
import { CollectionName } from "../../Atoms/CollectionName";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { StateProvider } from "../../SharedContext";
import { ProgressiveHydration } from "../../../hydration-component";
import { generateNavigateSlug, getSlot, getTextColor, navigateTo } from "../../../utils/utils";
import "./opinion-collection.m.css";

const loadMore = ({ isLoading, renderStories, getMoreStories, subsequentLoadCount = 3 }) => {
  if (isLoading) return;
  const limit = subsequentLoadCount;
  const offset = renderStories.length;
  getMoreStories(offset, limit);
};

const OpinionCollection = ({ collection, config, getMoreStories, isLoadMoreVisible, isLoading, isolatedLoadMore }) => {
  const stories = collectionToStories(collection);
  if (!stories.length) return null;
  const {
    theme = "",
    footerButton = "",
    border = "fullBorder",
    collectionNameBorderColor = "",
    collectionNameTemplate = "",
    slotConfig = [],
    subsequentLoadCount = 3,
    localizationConfig = {}
  } = config;
  const { type = "story", component = null } = get(slotConfig, [0], {});

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));

  const textColor = getTextColor(theme);
  const borderStyle = border === "fullBorder" ? "border" : "";
  const slot = type === "ad" ? getSlot(type, component) : null;
  const adStyle = slot ? "custom-grid" : "";

  const getLoadMore = (opts) => {
    if (!isLoadMoreVisible) return null;

    if (isolatedLoadMore) {
      return (
        <LoadMoreTarget
          collection={collection}
          componentName={"OpinionCollection"}
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

  const getAuthorCard = (story) => {
    const authorData = get(story, ["authors", "0"]);
    return (
      <div data-test-id="story-card" styleName="cardWrapper">
        <div styleName="container">
          <Author story={story} hideAuthorImage />
          <Headline story={story} />
          <AuthorWithTime
            story={story}
            config={{ ...config, ...localizationConfig, disableMeridiem: true, showAuthor: false }}
            collectionId={collection.id}
          />
        </div>
        <AuthorImage author={authorData} template="smallerCircle" config={config} />
      </div>
    );
  };

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="opinion-collection"
      style={{ backgroundColor: theme || "initial" }}>
      <div styleName="opinion-collection" style={{ backgroundColor: theme || "initial" }}>
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
          headerLevel={2}
        />
        <div
          styleName={`content-wrapper ${borderStyle} ${textColor} ${adStyle}`}
          className={`content-wrapper ${borderStyle} ${textColor}`}>
          {slot ? (
            <>
              <div className="wrapper-with-ads" styleName="wrapper-with-ads">
                {stories.slice(0, 4).map((story) => getAuthorCard(story))}
              </div>
              <div styleName="ad-slot">{slot}</div>
            </>
          ) : (
            stories.map((story) => getAuthorCard(story))
          )}
        </div>
        {getLoadMore({ isLoading, stories, getMoreStories, subsequentLoadCount })}
      </div>
    </div>
  );
};

OpinionCollection.propTypes = {
  collection: PropTypes.object,
  config: PropTypes.shape({
    collectionNameBorderColor: PropTypes.string,
    theme: PropTypes.string,
    collectionNameTemplate: PropTypes.string,
    footerButton: PropTypes.string,
    border: PropTypes.string,
    slotConfig: PropTypes.array,
    subsequentLoadCount: PropTypes.number,
    localizationConfig: PropTypes.object
  }),
  getMoreStories: PropTypes.func,
  isLoading: PropTypes.bool,
  isLoadMoreVisible: PropTypes.bool,
  isolatedLoadMore: PropTypes.bool
};

OpinionCollection.defaultProps = {
  getMoreStories: () => {},
  isLoadMoreVisible: true,
  isLoading: false,
  collection: {},
  config: {},
  hideFirstCard: false
};

export default StateProvider(OpinionCollection);
