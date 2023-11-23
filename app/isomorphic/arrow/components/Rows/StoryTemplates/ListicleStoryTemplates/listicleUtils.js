import get from "lodash.get";

export function getTitleElementsIndex(card) {
  const cardElements = get(card, ["story-elements"], []);
  return cardElements.findIndex((element) => element.type === "title");
}

export function isIntroCardPresent(cards) {
  return cards.some((card) => card["card-type"] === "introduction");
}

export function getFirstDescriptionElementsIndex(card) {
  // element index to place non inline bullets, when cards title is absent
  const cardElements = get(card, ["story-elements"], []);
  return cardElements.findIndex((element) => element.type !== "ad" && element.type !== "widget");
}
