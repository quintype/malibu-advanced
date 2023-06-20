import get from "lodash.get";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { isEmpty, getCollectionData, getTextColor } from "../../../utils/utils";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { CollectionName } from "../../Atoms/CollectionName";
import { Headline } from "../../Atoms/Headline";
import { HeroImage } from "../../Atoms/HeroImage";
import { SectionTag } from "../../Atoms/SectionTag";
import { StoryCard } from "../../Molecules/StoryCard";
import { StateProvider } from "../../SharedContext";
import KeyEvents from "../../Molecules/KeyEvents";
import "./aside-collection.m.css";

const StoryCollection = ({ data, slotData, horizontal, config, opts }) => {
  const { title = "", collectionSlug = "" } = slotData || config;
  const { theme = "" } = config;
  const heading = title || "Related Stories";
  const isHorizontal = horizontal ? "horizontal-wrapper" : "";
  const mountAt = get(config, ["mountAtPrefix"], "");
  const [storyList, updateStoryList] = useState([]);
  const [collectionData, updateCollectionData] = useState([]);
  const updateStoryListItems = async (slug) => {
    const collectionDataResponse = await getCollectionData(slug, mountAt);
    updateCollectionData(collectionDataResponse);
    const storyItems = collectionDataResponse.items;
    updateStoryList(storyItems);
  };

  useEffect(() => {
    if (collectionSlug) {
      updateStoryListItems(collectionSlug);
    }
  }, [collectionSlug]);

  useEffect(() => {
    if (!collectionSlug && data) {
      const storyItems = data.items || data;
      updateStoryList(storyItems);
    }
  }, [data, collectionSlug]);

  const textColor = getTextColor(theme);

  return (
    <>
      <CollectionName customCollectionName={heading} textColor collection={collectionData} />
      <div styleName="stories">
        {storyList && storyList.length > 0 ? (
          storyList.slice(0, 4).map((item) => {
            const story = item.story || item;
            return (
              <div styleName="story" key={story.id}>
                <StoryCard story={story} isHorizontal theme={theme} config={config}>
                  <div styleName="story-hero-image">
                    <HeroImage
                      story={story}
                      aspectRatio={[[16, 9]]}
                      queryParam={{ utm_source: "website", utm_medium: "related-stories" }}
                      initialAltImage={true}
                    />
                  </div>
                  <div>
                    {isHorizontal && <SectionTag story={story} />}
                    <Headline story={story} queryParam={{ utm_source: "website", utm_medium: "related-stories" }} />
                    <div styleName="story-byline">
                      <AuthorWithTime config={{ ...opts, isRelatedCollection: true }} story={story} />
                    </div>
                  </div>
                </StoryCard>
              </div>
            );
          })
        ) : (
          <div data-test-id="no-stories" styleName={`info ${textColor}`}>
            No stories found.
          </div>
        )}
      </div>
    </>
  );
};

StoryCollection.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  config: PropTypes.object,
  horizontal: PropTypes.bool,
  slotData: PropTypes.object,
  opts: PropTypes.object
};

const AsideCollection = ({
  data = {},
  config = {},
  horizontal = false,
  slots = [],
  sticky = false,
  keyEventsData = {},
  enableKeyEvents = false,
  adComponent,
  widgetComp,
  storyId,
  opts = {}
}) => {
  if (isEmpty(data)) return null;

  const { theme } = config;
  const isHorizontal = horizontal ? "horizontal-wrapper" : "";
  if (horizontal) {
    return (
      <div
        className="arrow-component arr--aside-collection"
        styleName={`wrapper ${isHorizontal}`}
        style={{ backgroundColor: theme || "initial" }}
        data-test-id="aside-collection"
        data-nosnippet
        id={`aside-collection-${storyId}`}>
        <StoryCollection data={data} horizontal={horizontal} config={config} opts={opts} theme1={theme} />
      </div>
    );
  }
  const isSticky = sticky ? "sticky" : "";
  const asideSlot = (type, slot, index) => {
    const targetId = slot.targetId ? `widget-${slot.targetId}-${storyId}` : `widget-${index}_${storyId}`;
    switch (type) {
      case "ad":
        return (
          <div styleName="ad-slot" className="aside-collection-ad-slot">
            {adComponent({ ...slot, id: `ad-${index}_${storyId}` })}
          </div>
        );
      case "widget":
        return (
          <div styleName="ad-slot" className="aside-collection-ad-slot">
            {widgetComp({ ...slot, id: targetId })}
          </div>
        );

      case "collection":
        return (
          <div id={`aside-collection-${index}_${storyId}`}>
            <StoryCollection slotData={slot} data={data} horizontal={horizontal} config={config} opts={opts} />
          </div>
        );
    }
  };

  return (
    <div
      className="arrow-component arr--aside-collection"
      styleName={["wrapper", isHorizontal, isSticky].join(" ")}
      style={{ backgroundColor: theme || "initial" }}
      data-nosnippet
      data-test-id="aside-collection">
      {enableKeyEvents && (
        <KeyEvents
          story={keyEventsData.story}
          showLoadMore={keyEventsData.showLoadMore}
          config={keyEventsData.config}
          publishedDetails={opts}
        />
      )}
      {slots.map((slot, index) => asideSlot(slot.type, slot, index))}
    </div>
  );
};

AsideCollection.propTypes = {
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  config: PropTypes.object,
  opts: PropTypes.object,
  horizontal: PropTypes.bool,
  slots: PropTypes.array,
  adComponent: PropTypes.func,
  widgetComp: PropTypes.func,
  sticky: PropTypes.bool,
  keyEventsData: PropTypes.shape({
    story: PropTypes.object,
    config: PropTypes.object,
    showLoadMore: PropTypes.boolean
  }),
  enableKeyEvents: PropTypes.boolean,
  storyId: PropTypes.string
};

export default StateProvider(AsideCollection);
export { StoryCollection };
