import React from "react";
import PropTypes from "prop-types";
import { CollectionName } from "../../Atoms/CollectionName";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import {
  getTextColor,
  getTimeStamp,
  clientWidth,
  generateNavigateSlug,
  navigateTo,
  timestampToFormat
} from "../../../utils/utils";
import "../MagazineHeaderCard/magazine-cards.m.css";
import { StateProvider } from "../../SharedContext";
import { StoryCard } from "../../Molecules/StoryCard";
import { HeroImage } from "../../Atoms/HeroImage";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { Headline } from "../../Atoms/Headline";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { MagazineCoverImageCard } from "../../Atoms/MagazineCoverImage";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";

const MagazineWidget = ({ collection = {}, config = {} }) => {
  const { "created-at": createdAt, "collection-date": issueDate, summary, items, metadata = {} } = collection;
  const { theme = "", footerButton = "", border, localizationConfig = {}, navigate = true, magazineSlug = "" } = config;
  const textColor = getTextColor(theme);
  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));

  const updatedMagazineSlug =
    magazineSlug || get(metadata, ["entities", "collectionEntities", "magazine", 0, "slug"], "");
  const updatedConfig = { ...config, magazineSlug: updatedMagazineSlug };

  const url = generateNavigateSlug(collection, {
    ...qtConfig,
    ...updatedConfig
  });
  const sliceValue = 4;
  const isTablet = clientWidth("tablet");
  const timeStampConfig = {
    isUpperCase: true,
    disableMeridiem: true
  };
  const date = issueDate || createdAt;

  const storyCards = (items) => {
    return (
      <div styleName="story-cards">
        {items.slice(0, sliceValue).map((storyItems, index) => {
          const story = storyItems.story;
          const isMobile = clientWidth("mobile");
          const borderBottom = () => {
            const lastStoryIndex = 3;
            const lastTwoStoriesIndex = [2, 3];
            if (isMobile && !lastStoryIndex === index) {
              return "bottom";
            }
            if (!lastTwoStoriesIndex.includes(index)) {
              return "bottom";
            }
          };

          const borderSettings = border === "borderBottom" ? borderBottom() : "";
          return (
            <>
              <StoryCard story={story} border={borderSettings} isHorizontal config={config}>
                <HeroImage story={story} isHorizontal aspectRatio={[[4, 3]]} />
                <StorycardContent story={story} config={config}>
                  <Headline story={story} premiumStoryIconConfig={config} />
                  <AuthorWithTime config={localizationConfig} story={story} prefix="By" />
                </StorycardContent>
              </StoryCard>
            </>
          );
        })}
      </div>
    );
  };

  const bottomCard = () => {
    return (
      <div styleName="widget">
        {storyCards(items)}
        <LoadmoreButton
          collection={collection}
          template={footerButton}
          config={updatedConfig}
          navigate={() => navigateTo(dispatch, url)}
          qtConfig={qtConfig}
        />
      </div>
    );
  };
  return (
    <div
      className="full-width-with-padding arrow-component"
      style={{ backgroundColor: theme }}
      data-test-id="magazine-widget">
      <div className="arr-magazine-widget" styleName="magazine-header widget-button">
        <MagazineCoverImageCard collection={collection} config={updatedConfig} />
        <div styleName="content">
          <div styleName={`time ${textColor}`} data-test-id="widget-date">
            {getTimeStamp(date, timestampToFormat, timeStampConfig)}
          </div>
          <CollectionName collection={collection} config={config} navigate={navigate} />
          <div styleName={`summary ${textColor}`} data-test-id="widget-summary">
            {summary}
          </div>
          {!isTablet && bottomCard()}
        </div>
        {isTablet && bottomCard()}
      </div>
    </div>
  );
};

MagazineWidget.propTypes = {
  collection: PropTypes.shape({
    "created-at": PropTypes.number,
    summary: PropTypes.string,
    items: PropTypes.array
  }),
  config: PropTypes.shape({ theme: PropTypes.string, footerButton: PropTypes.string, border: PropTypes.string })
};

export default StateProvider(MagazineWidget);
