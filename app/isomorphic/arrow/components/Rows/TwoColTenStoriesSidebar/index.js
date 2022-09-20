import React from "react";
import PropTypes from "prop-types";
import { collectionToStories } from "@quintype/components";
import { StateProvider } from "../../SharedContext";
import { generateNavigateSlug, getTextColor, navigateTo, getSlot } from "../../../utils/utils";
import { HeroImage } from "../../Atoms/HeroImage";
import { CollectionName } from "../../Atoms/CollectionName";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { StoryCard } from "../../Molecules/StoryCard";
import { StoryCardWithBulletPoint } from "../../Molecules/StoryCardWithBulletPoint";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import "./two-col-ten-stories-sidebar.m.css";

export const TwoColTenStoriesSidebar = ({ collection, config = {} }) => {
  const childCollections = get(collection, ["items"], []).filter((collections) => collections.type === "collection");
  if (childCollections.length < 2) return null;
  // if number of collection is less than 2 return null

  const firstCollectionStories = collectionToStories(childCollections[0]);
  const sidebarCollectionStories = collectionToStories(childCollections[1]);

  if (!firstCollectionStories.length && !sidebarCollectionStories.length) return null;

  const {
    border = "",
    borderColor = "",
    collectionNameBorderColor = "",
    theme = "",
    slotConfig = [],
    collectionNameTemplate = "",
  } = config;
  const textColor = getTextColor(theme);
  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const firstCardBorderStyle = border === "bottom" ? "first-card-border-box" : "";
  const { type = "story", component } = get(slotConfig, [0], {});
  const isAdWidgetEnabled = type === "ad" || type === "widget";
  const adWidgetSlot = isAdWidgetEnabled ? getSlot(type, component) : null;
  let storyCounter = 0;

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="two-col-ten-stories-sidebar"
      style={{ backgroundColor: theme, color: textColor }}
      styleName="component-wrapper"
    >
      <div styleName="collection-wrapper">
        <CollectionName
          collection={childCollections[0]}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
          headerLevel="2"
        />
        <div styleName="story-cards">
          <div styleName="first-card">
            <StoryCard
              story={firstCollectionStories[0]}
              theme={theme}
              headerLevel="3"
              bgImgContentOverlap
              aspectRatio={[
                [16, 9],
                [16, 9],
              ]}
              config={config}
            >
              <HeroImage
                story={firstCollectionStories[0]}
                aspectRatio={[
                  [16, 9],
                  [16, 9],
                ]}
              />
              <StorycardContent
                styleName={firstCardBorderStyle}
                story={firstCollectionStories[0]}
                headerLevel="3"
                theme={theme}
                isHorizontal
                borderColor={borderColor}
                config={config}
              />
            </StoryCard>
          </div>
          {firstCollectionStories.slice(1, 5).map((story, index) => {
            return (
              <div styleName="card" key={index}>
                <StoryCard
                  story={story}
                  theme={theme}
                  headerLevel="4"
                  isHorizontal
                  border={border}
                  aspectRatio={[
                    [16, 9],
                    [16, 9],
                  ]}
                  config={config}
                >
                  <HeroImage
                    story={story}
                    isHorizontal
                    aspectRatio={[
                      [16, 9],
                      [16, 9],
                    ]}
                  />
                  <StorycardContent
                    theme={theme}
                    story={story}
                    isHorizontal
                    borderColor={borderColor}
                    config={config}
                  />
                </StoryCard>
              </div>
            );
          })}
        </div>
        <LoadmoreButton
          template="NavigateToPage"
          collection={childCollections[0]}
          config={config}
          navigate={() => navigateTo(dispatch, generateNavigateSlug(childCollections[0], qtConfig))}
          qtConfig={qtConfig}
        />
      </div>
      <div styleName="sidebar-collection-wrapper">
        <CollectionName
          collection={childCollections[1]}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
          headerLevel="2"
        />
        <div styleName="sidebar-cards-container">
          <div>
            {sidebarCollectionStories.slice(0, 4).map((story) => (
              <div styleName="card" key={story.id}>
                <StoryCardWithBulletPoint story={story} bulletValue={`${++storyCounter}`} config={config} />
              </div>
            ))}
          </div>
          <div>
            <div styleName="card">
              <StoryCardWithBulletPoint
                story={sidebarCollectionStories[4]}
                bulletValue={`${++storyCounter}`}
                config={config}
              />
            </div>
            {adWidgetSlot ? (
              <div>{adWidgetSlot}</div>
            ) : (
              sidebarCollectionStories.slice(5, 8).map((story) => (
                <div styleName="card" key={story.id}>
                  <StoryCardWithBulletPoint story={story} bulletValue={`${++storyCounter}`} config={config} />
                </div>
              ))
            )}
          </div>
        </div>
        <LoadmoreButton
          template="NavigateToPage"
          collection={childCollections[1]}
          config={config}
          navigate={() => navigateTo(dispatch, generateNavigateSlug(childCollections[1], qtConfig))}
          qtConfig={qtConfig}
        />
      </div>
    </div>
  );
};

export default StateProvider(TwoColTenStoriesSidebar);

TwoColTenStoriesSidebar.propTypes = {
  collection: PropTypes.object.isRequired,
  config: PropTypes.shape({
    theme: PropTypes.string,
    showBorder: PropTypes.bool,
    collectionNameTemplate: PropTypes.string,
    slotConfig: PropTypes.array,
    collectionNameBorderColor: PropTypes.string,
    borderColor: PropTypes.string,
    localizationConfig: PropTypes.object,
  }),
};
