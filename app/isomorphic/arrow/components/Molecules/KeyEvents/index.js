import React, { useState } from "react";
import get from "lodash/get";
import PropTypes from "prop-types";
import { ClockIcon } from "../../Svgs/clock-icon";
import { getTextColor, getTimeStamp, timestampToFormat } from "../../../utils/utils";
import { LoadmoreButton } from "../../Atoms/Loadmore";
import { StateProvider } from "../../SharedContext";
import "./key-events.m.css";
import { useSelector } from "react-redux";

const KeyEventCards = (props) => {
  const { config, index, cardLength, card = {}, slug, loadCards, showLoadMore } = props;
  const { "card-added-at": cardAddedAt, "story-elements": storyElements = [], id } = card;
  const { theme, mountAt = "" } = config;
  const textColor = getTextColor(theme);
  const dark = "#333";
  const light = "#fff";
  const updateColor = textColor === "dark" ? dark : light;
  const lastElement = index === cardLength - 1;
  const borderLeft = lastElement ? "borderNone" : "";

  return (
    <>
      <div styleName={`time-wrapper ${textColor}`}>
        <ClockIcon color={updateColor} />
        {getTimeStamp(cardAddedAt, timestampToFormat, { showTime: true, isTimeFirst: true })}
      </div>
      <a href={`${mountAt}/${slug}#${id}`} aria-label="event-title">
        <div styleName={`event-title ${textColor} ${borderLeft}`}>
          {storyElements.map((element, index) => element.type === "title" && <h3 key={index}>{element.text}</h3>)}
          {showLoadMore && lastElement && loadCards && (
            <div
              styleName="fade-out"
              style={{
                backgroundImage: `linear-gradient(to bottom, transparent, ${theme})`,
              }}
            />
          )}
        </div>
      </a>
    </>
  );
};

KeyEventCards.propTypes = {
  card: PropTypes.shape({
    "card-added-at": PropTypes.number,
    "story-elements": PropTypes.array,
    id: PropTypes.string,
  }),
  config: PropTypes.object,
  slug: PropTypes.string,
  story: PropTypes.object,
  elements: PropTypes.array,
  index: PropTypes.number,
  cardLength: PropTypes.number,
  loadCards: PropTypes.bool,
  showLoadMore: PropTypes.bool,
};

const KeyEvents = ({ story = {}, config = {}, showLoadMore = true, publishedDetails = {} }) => {
  const keyEventsTitle = get(publishedDetails, ["localizedKeyEvents"], "Key Events") || "Key Events";
  const cards = get(story, ["cards"], []);
  const { theme, initialLoadCount = 4 } = config;
  const textColor = getTextColor(theme);
  const [initialCount, updatedCount] = useState(initialLoadCount);
  const cardsWithKeyEvents = cards.filter((card) => get(card.metadata, ["attributes", "key-event"]));
  const lastElement = cardsWithKeyEvents.length > initialCount;
  const qtConfig = useSelector((state) => get(state, ["qt", "config"], {}));

  const onClick = () => {
    updatedCount(initialCount + initialLoadCount);
  };

  if (cardsWithKeyEvents.length < 1) {
    return null;
  }

  const showAllCards = !showLoadMore ? cardsWithKeyEvents.slice(0, 4) : cardsWithKeyEvents.slice(0, initialCount);

  const keyEvents = showAllCards.map((card, index, source) => (
    <KeyEventCards
      cardLength={source.length}
      card={card}
      key={card.id}
      slug={story.slug}
      config={config}
      index={index}
      loadCards={lastElement}
      showLoadMore={showLoadMore}
    />
  ));

  return (
    <div className="arrow-component" style={{ background: theme }} styleName={`container ${textColor}`}>
      <h3>{keyEventsTitle}</h3>
      <div styleName="cards-wrapper">{keyEvents}</div>
      {showLoadMore && lastElement && (
        <LoadmoreButton onClick={onClick} template="SubsequentLoadCount" config={config} qtConfig={qtConfig} />
      )}
    </div>
  );
};

KeyEvents.propTypes = {
  story: PropTypes.object,
  config: PropTypes.object,
  showLoadMore: PropTypes.bool,
  publishedDetails: PropTypes.object,
};

export default StateProvider(KeyEvents);
