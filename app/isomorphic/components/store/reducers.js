import { OPEN_HAMBURGER_MENU, OPEN_SEARCHBAR, MEMBER_UPDATED } from "./actions";

function hamburgerMenuReducer(state = false, action) {
  switch (action.type) {
    case OPEN_HAMBURGER_MENU:
      return action.isHamburgerMenuOpen;
    default:
      return state;
  }
}

function searchBarReducer(state = false, action) {
  switch (action.type) {
    case OPEN_SEARCHBAR:
      return action.isSearchBarOpen;
    default:
      return state;
  }
}

function memberReducer(state = null, action) {
  switch (action.type) {
    case MEMBER_UPDATED:
      return action.member;

    default:
      return state;
  }
}

export const REDUCERS = {
  isHamburgerMenuOpen: hamburgerMenuReducer,
  isSearchBarOpen: searchBarReducer,
  member: memberReducer
};
