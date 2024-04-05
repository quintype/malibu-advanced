import React from "react";
import PropTypes from "prop-types";
import get from "lodash.get";

import { collectionToStories } from "@quintype/components";
import { CollectionName } from "../../Atoms/CollectionName";
import { HeroImage } from "../../Atoms/HeroImage";
import { StoryCard } from "../../Molecules/StoryCard";
import { StateProvider } from "../../SharedContext";
import { getTextColor, generateNavigateSlug, navigateTo, getTheme } from "../../../utils/utils";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { SectionTag } from "../../Atoms/SectionTag";
import { Headline } from "../../Atoms/Headline";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { ProgressiveHydration } from "../../../hydration-component";
import { LoadMoreTarget } from "../../Atoms/LoadMoreTarget";
import { roundedCornerClass } from "../../../constants";

import "./six-col-six-stories.m.css";
import { useDispatch, useSelector } from "react-redux";

const loadMore = ({ isLoading, stories, getMoreStories, subsequentLoadCount = 6 }) => {
  if (isLoading) return;
  const limit = subsequentLoadCount;
  const offset = stories.length;
  getMoreStories(offset, limit);
};

const SixColSixStories = ({
  collection = {},
  config = {},
  getMoreStories,
  isLoadMoreVisible,
  isLoading,
  isolatedLoadMore,
}) => {
  const stories = collectionToStories(collection);
  if (!stories.length) return null;

  const {
    collectionNameBorderColor = "",
    borderColor = "",
    theme = "",
    collectionNameTemplate = "",
    footerButton = "",
    border = "",
    localizationConfig = {},
    subsequentLoadCount = 6,
  } = config;

  const layout = "sixColSixStories";
  const textColor = getTextColor(theme);
  let borderStyle = "";
  let isAroundBorder = false;
  if (border === "fullBorder") {
    borderStyle = "vertical-border";
  } else if (border === "aroundBorder") {
    borderStyle = "around-border";
    isAroundBorder = true;
  }
  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const enableDarkModePreview =
    theme === "#1d1d1d" || get(qtConfig, ["pagebuilder-config", "enableDarkModePreview"], false);

  const enableRoundedCorners = get(qtConfig, ["pagebuilder-config", "general", "enableRoundedCorners"], false);
  const roundedCorners = enableRoundedCorners && isAroundBorder ? roundedCornerClass : "";

  const getLoadMore = (opts) => {
    if (!isLoadMoreVisible) return null;

    if (isolatedLoadMore) {
      return (
        <LoadMoreTarget
          collection={collection}
          componentName={"SixColSixStories"}
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

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="six-col-six-stories"
      style={{ backgroundColor: theme || "initial" }}
    >
      <div styleName="wrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
          headerLevel="2"
        />
        <div styleName={`row-wrapper ${isAroundBorder ? "around-border-wrapper" : ""}`}>
          {stories.map((story, index) => (
            <div
              key={`six-col-six-stories-${index}`}
              className={roundedCorners}
              styleName={`card-wrapper ${borderStyle} ${textColor}`}
              style={{ backgroundColor: getTheme(config, layout, enableDarkModePreview) || "initial" }}
            >
              <StoryCard story={story} theme={getTheme(config, layout, enableDarkModePreview)} config={config}>
                <HeroImage
                  story={story}
                  aspectRatio={[
                    [16, 9],
                    [16, 9],
                  ]}
                />
                <div styleName="content-wrapper">
                  <SectionTag
                    story={story}
                    borderColor={borderColor}
                    layout={layout}
                    enableDarkModePreview={enableDarkModePreview}
                  />
                  <Headline
                    story={story}
                    headerLevel="6"
                    premiumStoryIconConfig={config}
                    layout={layout}
                    enableDarkModePreview={enableDarkModePreview}
                  />
                </div>
                <AuthorWithTime
                  config={localizationConfig}
                  story={story}
                  collectionId={collection.id}
                  layout={layout}
                  enableDarkModePreview={enableDarkModePreview}
                />
              </StoryCard>
            </div>
          ))}
        </div>
        {getLoadMore({ isLoading, stories, getMoreStories, subsequentLoadCount })}
      </div>
    </div>
  );
};
export default StateProvider(SixColSixStories);

SixColSixStories.propTypes = {
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
};

SixColSixStories.defaultProps = {
  getMoreStories: () => {},
  isLoadMoreVisible: true,
  isLoading: false,
};
