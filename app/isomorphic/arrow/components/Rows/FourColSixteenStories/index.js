import React from "react";
import get from "lodash/get";
import PropTypes from "prop-types";
import {
  getTextColor,
  generateNavigateSlug,
  navigateTo,
  rgbToHex,
  getNumberOfStoriesToShow
} from "../../../utils/utils";
import { collectionToStories } from "@quintype/components";
import { StateProvider } from "../../SharedContext";
import { CollectionName } from "../../Atoms/CollectionName";
import { HeroImage } from "../../Atoms/HeroImage/index";
import { StoryCard } from "../../Molecules/StoryCard/index";
import { useDispatch, useSelector } from "react-redux";
import { Headline } from "../../Atoms/Headline";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { SectionTag } from "../../Atoms/SectionTag/index";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import "./four-col-sixteen-stories.m.css";

const getChildCollectionData = (collection, config, index) => {
  const stories = collectionToStories(collection);
  if (!stories.length) return null;

  const [firstStory, ...otherStories] = stories;
  const {
    collectionNameTemplate,
    borderColor = "",
    withSeparator = true,
    theme,
    footerButton = "",
    localizationConfig = {},
    collectionNameBorderColor = "",
    numberOfStoriesToShowInEachColumn = 4
  } = config;
  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const SectionTagBorderColor = rgbToHex(borderColor);
  const showNumberOfStoriesInEachColumn = getNumberOfStoriesToShow(numberOfStoriesToShowInEachColumn) - 1;

  if (numberOfStoriesToShowInEachColumn < 1) {
    return null;
  }

  return (
    <div styleName="contentWrapper" key={index}>
      <CollectionName
        collection={collection}
        headerLevel="3"
        collectionNameTemplate={collectionNameTemplate}
        collectionNameBorderColor={collectionNameBorderColor}
      />
      <div styleName={`cardWrapper ${withSeparator ? "separator" : ""}`}>
        <div styleName="storyCardWrapper" className="storyCardWrapper">
          <StoryCard
            story={firstStory}
            border={withSeparator ? "bottom" : ""}
            theme={theme}
            config={config}
            headerLevel="6">
            <HeroImage config={config} story={firstStory} aspectRatio={[[16, 9], [16, 9]]} />
            <SectionTag story={firstStory} borderColor={SectionTagBorderColor} />
            <Headline story={firstStory} premiumStoryIconConfig={config} />
            <AuthorWithTime config={localizationConfig} story={firstStory} hideAuthorImage={true} />
          </StoryCard>
          {otherStories.slice(0, showNumberOfStoriesInEachColumn).map((story, index) => {
            return (
              <StoryCard key={index} story={story} theme={theme} border={withSeparator ? "bottom" : ""} config={config}>
                <SectionTag story={story} borderColor={SectionTagBorderColor} />
                <Headline story={story} premiumStoryIconConfig={config} />
                <AuthorWithTime config={localizationConfig} story={story} hideAuthorImage={true} />
              </StoryCard>
            );
          })}
        </div>
      </div>
      <LoadmoreButton
        collection={collection}
        template={footerButton}
        config={config}
        navigate={() => navigateTo(dispatch, generateNavigateSlug(collection, qtConfig))}
        qtConfig={qtConfig}
      />
    </div>
  );
};

const FourColSixteenStories = ({ collection, config = {} }) => {
  const childCollections = get(collection, ["items"], []).filter((collections) => collections.type === "collection");
  if (childCollections.length < 4) return null;
  // if number of collection is less than 4 return null

  const { theme = "" } = config;
  const textColor = getTextColor(theme);
  return (
    <div
      className="full-width-with-padding arrow-component arr--four-col-sixteen-stories"
      data-test-id="four-col-sixteen-stories"
      styleName={`componentWrapper ${textColor}`}
      style={{ backgroundColor: theme, color: textColor }}>
      {childCollections.slice(0, 4).map((collection, index) => getChildCollectionData(collection, config, index))}
    </div>
  );
};

FourColSixteenStories.propTypes = {
  collection: PropTypes.object.isRequired,
  config: PropTypes.shape({
    theme: PropTypes.string
  })
};

export default StateProvider(FourColSixteenStories);
