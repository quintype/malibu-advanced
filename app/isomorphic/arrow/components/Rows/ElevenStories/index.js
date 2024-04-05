import React, { Fragment } from "react";
import PropTypes from "prop-types";
import get from "lodash.get";
import { collectionToStories } from "@quintype/components";
import { StoryCard } from "../../Molecules/StoryCard";
import { Headline } from "../../Atoms/Headline";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { SectionTag } from "../../Atoms/SectionTag/index";
import { getTextColor, getSlot, rgbToHex, navigateTo, generateNavigateSlug } from "../../../utils/utils";
import { CollectionName } from "../../Atoms/CollectionName";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { StateProvider } from "../../SharedContext";

import "./11-stories.m.css";
import { Subheadline } from "../../Atoms/Subheadline";
import { useDispatch, useSelector } from "react-redux";

const ElevenStories = ({ collection, config = {} }) => {
  const storyItems = collectionToStories(collection);
  if (storyItems.length < 1) {
    return null;
  }

  const {
    collectionNameBorderColor = "",
    borderColor = "",
    theme = "",
    slotConfig = [],
    withseparator = true,
    collectionNameTemplate = "",
    footerSlotConfig = {},
    footerButton = "",
    localizationConfig = {},
  } = config;
  const { type = "story", component } = get(slotConfig, [0], {});
  const { footerSlot } = footerSlotConfig;

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig);

  const textColor = getTextColor(theme);
  const SectionTagborderColor = rgbToHex(borderColor);
  const borderValue = withseparator ? "bottom" : "";
  const getChildCollectionData = () => {
    const filterCollection = get(collection, ["items"], []).find((collections) => collections.type === "collection");
    return (
      <div styleName="child-collection-wrapper">
        <CollectionName collection={filterCollection} collectionNameTemplate={collectionNameTemplate} headerLevel="5" />
        {storyItems.slice(0, 1).map((story, index) => {
          return (
            <div styleName="first-story-card" key={`story-${index}`}>
              <StoryCard story={story} theme={theme} headerLevel="4" border={borderValue} config={config}>
                <SectionTag story={story} borderColor={SectionTagborderColor} />
                <Headline story={story} premiumStoryIconConfig={config} />
                <AuthorWithTime
                  config={localizationConfig}
                  story={story}
                  hideAuthorImage={false}
                  collectionId={collection.id}
                />
                <Subheadline story={story} />
              </StoryCard>
            </div>
          );
        })}
        {storyItems.slice(1, 4).map((story, index) => {
          return (
            <div styleName="story-card" key={`story-${index}`}>
              <StoryCard story={story} theme={theme} border={borderValue} config={config}>
                <SectionTag story={story} borderColor={SectionTagborderColor} />
                <Headline story={story} premiumStoryIconConfig={config} />
                <AuthorWithTime
                  config={localizationConfig}
                  story={story}
                  hideAuthorImage={false}
                  collectionId={collection.id}
                />
              </StoryCard>
            </div>
          );
        })}
        {storyItems.slice(4, 5).map((story, index) => {
          return (
            <div styleName="story-card" key={`story-${index}`}>
              <StoryCard story={story} theme={theme} config={config}>
                <SectionTag story={story} borderColor={SectionTagborderColor} />
                <Headline story={story} premiumStoryIconConfig={config} />
                <AuthorWithTime
                  config={localizationConfig}
                  story={story}
                  hideAuthorImage={false}
                  collectionId={collection.id}
                />
              </StoryCard>
            </div>
          );
        })}
      </div>
    );
  };

  const getLastSlotStoryData = () => {
    return (
      <div styleName="column-three">
        {storyItems.slice(6, 7).map((story, index) => {
          return (
            <div styleName="first-story-card" key={`story-${index}`}>
              <StoryCard story={story} theme={theme} border={borderValue} config={config}>
                <SectionTag story={story} borderColor={SectionTagborderColor} />
                <Headline story={story} premiumStoryIconConfig={config} />
                <AuthorWithTime
                  config={localizationConfig}
                  story={story}
                  hideAuthorImage={false}
                  collectionId={collection.id}
                />
                <Subheadline story={story} clazzName="arr-hidden-mob" />
              </StoryCard>
            </div>
          );
        })}
        {storyItems.slice(7, 10).map((story, index) => {
          return (
            <div styleName="story-card" key={`story-${index}`}>
              <StoryCard story={story} theme={theme} border={borderValue} config={config}>
                <SectionTag story={story} borderColor={SectionTagborderColor} />
                <Headline story={story} premiumStoryIconConfig={config} />
                <AuthorWithTime
                  config={localizationConfig}
                  story={story}
                  hideAuthorImage={false}
                  collectionId={collection.id}
                />
              </StoryCard>
            </div>
          );
        })}
        {storyItems.slice(10, 11).map((story, index) => {
          return (
            <div styleName="story-card" key={`story-${index}`}>
              <StoryCard story={story} theme={theme} config={config}>
                <SectionTag story={story} borderColor={SectionTagborderColor} />
                <Headline story={story} premiumStoryIconConfig={config} />
                <AuthorWithTime
                  config={localizationConfig}
                  story={story}
                  hideAuthorImage={false}
                  collectionId={collection.id}
                />
              </StoryCard>
            </div>
          );
        })}
      </div>
    );
  };

  const slot = getSlot(type, component, getLastSlotStoryData, getChildCollectionData);
  const footerSlotComp = footerSlot ? footerSlot() : null;

  const getColumn = () => {
    return (
      <>
        <div styleName={withseparator ? "wrapper-with-divider" : "wrapper"}>
          <div styleName="column-one">
            {storyItems.slice(2, 3).map((story, index) => {
              return (
                <div styleName="story-card" key={`story-${index}`}>
                  <StoryCard
                    story={story}
                    theme={theme}
                    border={borderValue}
                    isHorizontalMobile
                    borderColor={SectionTagborderColor}
                    config={config}
                    aspectRatio={[
                      [16, 9],
                      [16, 9],
                    ]}
                    hideAuthorImage={false}
                    headerLevel="5"
                    collectionId={collection.id}
                  />
                </div>
              );
            })}
            {storyItems.slice(3, 5).map((story, index) => {
              return (
                <Fragment key={`story-col-${index}-${get(story, ["id"], "0")}`}>
                  <div styleName="story-card" key={`story-${index}`}>
                    <StoryCard story={story} theme={theme} border={borderValue} config={config}>
                      <SectionTag story={story} borderColor={SectionTagborderColor} />
                      <Headline story={story} premiumStoryIconConfig={config} />
                      <AuthorWithTime
                        config={localizationConfig}
                        story={story}
                        hideAuthorImage={false}
                        collectionId={collection.id}
                      />
                    </StoryCard>
                  </div>
                </Fragment>
              );
            })}
            {storyItems.slice(5, 6).map((story, index) => {
              return (
                <Fragment key={`story-col2-${index}-${get(story, ["id"], "0")}`}>
                  <div styleName="story-card" key={`story-${index}`}>
                    <StoryCard story={story} theme={theme} config={config}>
                      <SectionTag story={story} borderColor={SectionTagborderColor} />
                      <Headline story={story} premiumStoryIconConfig={config} />
                      <AuthorWithTime
                        config={localizationConfig}
                        story={story}
                        hideAuthorImage={false}
                        collectionId={collection.id}
                      />
                    </StoryCard>
                  </div>
                </Fragment>
              );
            })}
          </div>
          {withseparator && <div styleName={`divider ${textColor}`} />}
          <div styleName="column-two">
            {storyItems.slice(0, 1).map((story, index) => {
              return (
                <div styleName="story-card" key={`story-${index}`}>
                  <StoryCard
                    story={story}
                    theme={theme}
                    borderColor={SectionTagborderColor}
                    centerAlign
                    border={borderValue}
                    headerLevel="3"
                    aspectRatio={[
                      [16, 9],
                      [16, 9],
                    ]}
                    hideAuthorImage={false}
                    config={config}
                    collectionId={collection.id}
                  />
                </div>
              );
            })}
            {storyItems.slice(1, 2).map((story, index) => {
              return (
                <div styleName="story-card" key={`story-${index}`}>
                  <StoryCard
                    story={story}
                    isHorizontal
                    theme={theme}
                    borderColor={SectionTagborderColor}
                    hideAuthorImage={false}
                    headerLevel="5"
                    aspectRatio={[
                      [16, 9],
                      [16, 9],
                    ]}
                    config={config}
                    collectionId={collection.id}
                  />
                </div>
              );
            })}
          </div>
          {withseparator && <div styleName={`divider ${textColor}`} />}
          {slot}
        </div>
      </>
    );
  };
  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="eleven-stories"
      style={{ backgroundColor: theme || "initial" }}
    >
      <div styleName="eleven-stories">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        {getColumn()}
        <LoadmoreButton
          collection={collection}
          template={footerButton}
          config={config}
          navigate={() => navigateTo(dispatch, url)}
          qtConfig={qtConfig}
        />
        {footerSlotComp}
      </div>
    </div>
  );
};

ElevenStories.propTypes = {
  /**  stories is the array of objects which is returning by API  */
  collection: PropTypes.object.isRequired,
  config: PropTypes.shape({
    borderColor: PropTypes.string,
    footerButton: PropTypes.string,
    theme: PropTypes.string,
    border: PropTypes.string,
    slotConfig: PropTypes.array,
    withseparator: PropTypes.bool,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
  }),
};

export default StateProvider(ElevenStories);
