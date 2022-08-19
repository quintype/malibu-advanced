import React from "react";
import { StoryCard } from "../../Molecules/StoryCard";
import { CollectionName } from "../../Atoms/CollectionName";
import { generateNavigateSlug, getTextColor, navigateTo } from "../../../utils/utils";
import { collectionToStories } from "@quintype/components";
import { HeroImage } from "../../Atoms/HeroImage";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { Headline } from "../../Atoms/Headline";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { SectionTag } from "../../Atoms/SectionTag";
import PropTypes from "prop-types";
import { StateProvider } from "../../SharedContext";
import "./list-component.m.css";
import { Subheadline } from "../../Atoms/Subheadline";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash.get";

const ListComponent = ({ collection, config = {}, getMoreStories, limit, hideButton, authorPrefix = "By" }) => {
  const storyItems = collectionToStories(collection);
  if (storyItems.length < 1) {
    return null;
  }
  const {
    collectionNameBorderColor = "",
    borderColor = "",
    theme = "",
    border = "",
    collectionNameTemplate = "",
    footerButton = "",
    localizationConfig = {}
  } = config;

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig);

  const borderHandler = (story) => {
    switch (border) {
      case "bottom":
        return (
          <div styleName="one-col-border-bottom">
            <StoryCard
              story={story}
              theme={theme}
              headerLevel="4"
              isHorizontal
              border={border}
              aspectRatio={[[16, 9]]}
              borderColor={borderColor}
              prefix={authorPrefix}
              config={config}
            />
          </div>
        );
      case "full":
        return (
          <div styleName="one-col-border-full">
            <StoryCard
              story={story}
              border={border}
              theme={theme}
              isHorizontal
              borderColor={borderColor}
              config={config}>
              <HeroImage story={story} isHorizontal aspectRatio={[[16, 9]]} />
              <div styleName="story-card-content-wrapper">
                <StorycardContent story={story} borderColor={borderColor} config={config}>
                  <SectionTag story={story} />
                  <Headline story={story} headerLevel="4" premiumStoryIconConfig={config} />
                  <Subheadline story={story} />
                  <AuthorWithTime config={localizationConfig} story={story} prefix={authorPrefix} />
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
              headerLevel="4"
              isHorizontal
              border={border}
              aspectRatio={[[16, 9]]}
              borderColor={borderColor}
              prefix={authorPrefix}
              config={config}
            />
          </div>
        );
    }
  };

  const textColor = getTextColor(theme);

  return (
    <div className="full-width-with-padding arrow-component" style={{ backgroundColor: theme, color: textColor }}>
      <div styleName="list-wrapper ">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="wrapper" style={{ backgroundColor: theme, color: textColor }}>
          <div styleName="list">
            {storyItems.slice(0, limit).map((story, index) => {
              return <div key={`default-${index}`}>{borderHandler(story)}</div>;
            })}
          </div>
        </div>
        {!hideButton && (
          <div>
            {getMoreStories ? (
              <LoadmoreButton
                onClick={getMoreStories}
                template={footerButton}
                config={config}
                navigate={() => navigateTo(dispatch, url)}
                qtConfig={qtConfig}
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
ListComponent.propTypes = {
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
    collectionNameBorderColor: PropTypes.string
  }),
  getMoreStories: PropTypes.object.isRequired,
  limit: PropTypes.number,
  hideButton: PropTypes.bool,
  authorPrefix: PropTypes.string
};

export default StateProvider(ListComponent);
