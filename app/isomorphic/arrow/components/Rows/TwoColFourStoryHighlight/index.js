import React from "react";
import PropTypes from "prop-types";
import { collectionToStories } from "@quintype/components";
import { StateProvider } from "../../SharedContext";
import { generateNavigateSlug, getTextColor, navigateTo, rgbToHex } from "../../../utils/utils";
import { HeroImage } from "../../Atoms/HeroImage";
import { CollectionName } from "../../Atoms/CollectionName";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { StoryCard } from "../../Molecules/StoryCard";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { Headline } from "../../Atoms/Headline";
import { SectionTag } from "../../Atoms/SectionTag";
import { Subheadline } from "../../Atoms/Subheadline";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import "./two-col-four-story-highlight.m.css";

export const TwoColFourStoryHighlight = ({ collection, config = {} }) => {
  const items = collectionToStories(collection);
  if (!items.length) {
    return null;
  }

  const {
    showBorder = true,
    borderColor = "",
    collectionNameBorderColor = "",
    theme = "",
    collectionNameTemplate = "",
    showBullet = true,
    customBulletColor = "",
    localizationConfig = {},
    bulletColorType = "default",
  } = config;
  const textColor = getTextColor(theme);
  const [firstStory, ...restStories] = items;
  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig);
  const SectionTagBorderColor = rgbToHex(borderColor);

  return (
    <div
      className="full-width-with-padding arrow-component arr--two-col-four-story-highlight"
      data-test-id="two-col-four-story-highlight"
      style={{ backgroundColor: theme, color: textColor }}
      styleName={`componentWrapper ${showBullet ? "bulletStyle" : ""}`}
    >
      <div styleName="highlightWrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="storyHighlightWrapper">
          {restStories.slice(0, 3).map((story, index) => (
            <div styleName="bulletCardWrapper" key={index}>
              {showBullet && (
                <span
                  data-test-id="bullet"
                  styleName={`bullet ${bulletColorType === "default" ? textColor : ""}`}
                  style={{ color: customBulletColor }}
                />
              )}
              <StoryCard
                story={story}
                bgImgContentOverlap
                config={config}
                border={showBorder ? "bottom" : ""}
                theme={theme}
              >
                <StorycardContent story={story} borderColor={SectionTagBorderColor} />
              </StoryCard>
            </div>
          ))}
        </div>
        <LoadmoreButton
          template="NavigateToPage"
          collection={collection}
          config={config}
          navigate={() => navigateTo(dispatch, url)}
          qtConfig={qtConfig}
        />
      </div>
      <div styleName="coverCardWrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <StoryCard
          story={firstStory}
          bgImgContentOverlap
          config={config}
          border={showBorder ? "full" : ""}
          theme={theme}
        >
          <HeroImage story={firstStory} />
          <div style={{ backgroundColor: theme, color: textColor }}>
            <SectionTag story={firstStory} borderColor={SectionTagBorderColor} />
            <Headline story={firstStory} headerLevel={4} premiumStoryIconConfig={config} />
            <Subheadline story={firstStory} />
            <AuthorWithTime config={localizationConfig} story={firstStory} />
          </div>
        </StoryCard>
      </div>
    </div>
  );
};

export default StateProvider(TwoColFourStoryHighlight);

TwoColFourStoryHighlight.propTypes = {
  collection: PropTypes.object.isRequired,
  config: PropTypes.shape({
    theme: PropTypes.string,
    showBorder: PropTypes.bool,
    collectionNameTemplate: PropTypes.string,
    collectionNameBorderColor: PropTypes.string,
    borderColor: PropTypes.string,
    showBullet: PropTypes.bool,
    localizationConfig: PropTypes.object,
  }),
};
