import React from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import get from "lodash/get";
import { collectionToStories } from "@quintype/components";
import { HeroImage } from "../../Atoms/HeroImage";
import { StoryCard } from "../../Molecules/StoryCard";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { CollectionName } from "../../Atoms/CollectionName";
import "./two-col-six-stories.m.css";
import { generateNavigateSlug, getSlot, getTextColor, navigateTo, rgbToHex } from "../../../utils/utils";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { StateProvider } from "../../SharedContext";
import { Headline } from "../../Atoms/Headline";
import { Subheadline } from "../../Atoms/Subheadline";
import { AuthorWithTime } from "../../Atoms/AuthorWithTimestamp";
import { SectionTag } from "../../Atoms/SectionTag";

const TwoColSixStories = ({ collection, config = {} }) => {
  const stories = collectionToStories(collection);

  const {
    collectionNameBorderColor = "",
    theme = "",
    slotConfig = [],
    collectionNameTemplate = "",
    border = "fullBorder",
    borderColor = "",
    localizationConfig = {},
  } = config;
  const { type = "story", component } = get(slotConfig, [0], {});
  const textColor = getTextColor(theme);
  const borderStyle = border === "fullBorder" ? "border" : "";
  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const url = generateNavigateSlug(collection, qtConfig);
  const sectionTagBorderColor = rgbToHex(borderColor);
  const languageDirection = get(qtConfig, ["language", "direction"], "ltr");
  const customClassName = languageDirection === "rtl" ? "rtl-twoColSixStories" : "ltr-twoColSixStories";
  const [firstStory, ...otherStories] = stories || [];

  const storySlot = () =>
    otherStories.slice(3, 5).map((story, index) => {
      return (
        <div styleName={`card ${borderStyle} ${textColor}`} key={index} className={`card ${customClassName}`}>
          <StoryCard story={story} theme={theme} headerLevel="4" isHorizontalWithImageLast config={config}>
            <HeroImage config={config} story={story} isHorizontalWithImageLast aspectRatio={[[16, 9]]} />
            <StorycardContent
              theme={theme}
              story={story}
              config={config}
              borderColor={sectionTagBorderColor}
              collectionId={collection.id}
            />
          </StoryCard>
        </div>
      );
    });

  const slot = getSlot(type, component, storySlot);
  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="two-col-six-stories"
      style={{ backgroundColor: theme || "initial" }}
    >
      <div styleName="two-col-six-stories" style={{ backgroundColor: theme || "initial" }}>
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
          headerLevel={2}
        />
        <div styleName="wrapper">
          <div styleName={`first-card ${borderStyle} ${textColor}`} className="first-card">
            <StoryCard story={firstStory} config={config}>
              <HeroImage config={config} story={firstStory} aspectRatio={[[16, 9]]} widths={[250, 480, 640, 1200]} />
              <StorycardContent story={firstStory} headerLevel="3" config={config}>
                <SectionTag story={firstStory} borderColor={sectionTagBorderColor} />
                <Headline premiumStoryIconConfig={config} story={firstStory} headerLevel={2} />
                <Subheadline story={firstStory} />
                <AuthorWithTime story={firstStory} config={localizationConfig} collectionId={collection.id} />
              </StorycardContent>
            </StoryCard>
          </div>
          <div styleName="other-cards" className="other-cards">
            <div className={`first-set ${customClassName}`}>
              {otherStories.slice(0, 3).map((story, index) => {
                return (
                  <div styleName={`card ${borderStyle} ${textColor}`} key={index} className="card">
                    <StoryCard
                      story={story}
                      theme={theme}
                      headerLevel="4"
                      isHorizontalWithImageLast
                      config={config}
                      widths={[250, 480, 640, 1200]}
                    >
                      <HeroImage config={config} story={story} isHorizontalWithImageLast aspectRatio={[[16, 9]]} />
                      <StorycardContent
                        theme={theme}
                        story={story}
                        config={config}
                        headerLevel={6}
                        borderColor={sectionTagBorderColor}
                        collectionId={collection.id}
                      />
                    </StoryCard>
                  </div>
                );
              })}
            </div>
            <div className="other-set">{slot}</div>
          </div>
        </div>
      </div>
      <LoadmoreButton
        collection={collection}
        config={config}
        navigate={() => navigateTo(dispatch, url)}
        qtConfig={qtConfig}
        template="NavigateToPage"
      />
    </div>
  );
};

TwoColSixStories.propTypes = {
  collection: PropTypes.object,
  config: PropTypes.object,
};

export default StateProvider(TwoColSixStories);
