import React from "react";
import PropTypes from "prop-types";
import get from "lodash.get";
import { roundedCornerClass } from "../../../constants";
import { collectionToStories } from "@quintype/components";
import { CollectionName } from "../../Atoms/CollectionName";
import { HeroImage } from "../../Atoms/HeroImage";
import { StorycardContent } from "../../Molecules/StorycardContent";
import { StoryCard } from "../../Molecules/StoryCard";
import { StateProvider } from "../../SharedContext";
import { getSlot, generateNavigateSlug, navigateTo } from "../../../utils/utils";
import { LoadmoreButton } from "../../Atoms/Loadmore";

import "./three-col-six-stories.m.css";
import { useDispatch, useSelector } from "react-redux";

const ThreeColSixStories = ({ collection = {}, config = {} }) => {
  const itemsArray = collectionToStories(collection);
  if (!collectionToStories(collection).length) return null;

  const {
    collectionNameBorderColor = "",
    borderColor = "",
    border = "",
    theme = "",
    slotConfig = [],
    collectionNameTemplate = "",
    footerSlotConfig = {},
    footerButton = ""
  } = config;
  const { type = "story", component } = get(slotConfig, [0], {});
  const { footerSlot } = footerSlotConfig;

  const footerSlotComp = footerSlot ? footerSlot() : null;

  itemsArray.splice(1, 0, null);

  const items = type !== "story" ? itemsArray : collectionToStories(collection);

  const dispatch = useDispatch();
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));
  const enableRoundedCorners = get(qtConfig, ["pagebuilder-config", "general", "enableRoundedCorners"], false);
  const roundedCorners = enableRoundedCorners ? roundedCornerClass : "";

  const url = generateNavigateSlug(collection, qtConfig);

  const storySlot = () => {
    return (
      <StoryCard story={items[1]} headerLevel="5" theme={theme} border={border} isHorizontalMobile config={config}>
        <HeroImage story={items[1]} isHorizontalMobile aspectRatio={[[16, 9], [16, 9]]} />
        <StorycardContent
          theme={theme}
          headerLevel="5"
          story={items[1]}
          border={border}
          borderColor={borderColor}
          config={config}
          isHorizontalMobile
          collectionId={collection.id}
          roundedCorners={roundedCorners}
        />
      </StoryCard>
    );
  };

  return (
    <div
      className="full-width-with-padding arrow-component"
      data-test-id="three-col-six-stories"
      style={{ backgroundColor: theme || "initial" }}>
      <div styleName="wrapper">
        <CollectionName
          collection={collection}
          collectionNameTemplate={collectionNameTemplate}
          collectionNameBorderColor={collectionNameBorderColor}
        />
        <div styleName="storycards-row-one">
          <div styleName="card">
            <StoryCard
              story={items[0]}
              headerLevel="2"
              theme={theme}
              border={border}
              aspectRatio={[[16, 9], [16, 9]]}
              config={config}
              roundedCorners={roundedCorners}>
              <HeroImage story={items[0]} aspectRatio={[[16, 9], [16, 9]]} widths={[250, 480, 640, 1200]} />
              <StorycardContent
                story={items[0]}
                headerLevel="2"
                theme={theme}
                border={border}
                borderColor={borderColor}
                config={config}
                collectionId={collection.id}
                roundedCorners={roundedCorners}
              />
            </StoryCard>
          </div>
          <div>
            <div styleName="card">{getSlot(type, component, storySlot)}</div>
            <div styleName="card">
              <StoryCard
                story={items[2]}
                headerLevel="5"
                theme={theme}
                border={border}
                isHorizontalMobile
                config={config}>
                <HeroImage story={items[2]} isHorizontalMobile aspectRatio={[[16, 9], [16, 9]]} />
                <StorycardContent
                  theme={theme}
                  headerLevel="5"
                  story={items[2]}
                  border={border}
                  isHorizontalMobile
                  borderColor={borderColor}
                  config={config}
                  collectionId={collection.id}
                  roundedCorners={roundedCorners}
                />
              </StoryCard>
            </div>
          </div>
        </div>
        <div styleName="storycards-row-two">
          {items.slice(3, 6).map((story, index) => (
            <div styleName="card" key={index}>
              <StoryCard story={story} headerLevel="5" theme={theme} border={border} isHorizontalMobile config={config}>
                <HeroImage story={story} isHorizontalMobile aspectRatio={[[16, 9], [16, 9]]} />
                <StorycardContent
                  theme={theme}
                  headerLevel="5"
                  story={story}
                  border={border}
                  isHorizontalMobile
                  borderColor={borderColor}
                  config={config}
                  collectionId={collection.id}
                  roundedCorners={roundedCorners}
                />
              </StoryCard>
            </div>
          ))}
        </div>
        <LoadmoreButton
          template={footerButton}
          collection={collection}
          config={config}
          navigate={() => navigateTo(dispatch, url)}
          qtConfig={qtConfig}
        />
        {footerSlotComp}
      </div>
    </div>
  );
};
export default StateProvider(ThreeColSixStories);

ThreeColSixStories.propTypes = {
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
    collectionNameBorderColor: PropTypes.string
  })
};
