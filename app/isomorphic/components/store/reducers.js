import { OPEN_HAMBURGER_MENU, OPEN_SEARCHBAR, MEMBER_UPDATED, IS_OPEN_LOGIN_FORM, IS_USER_LOGGED_IN } from "./actions";

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

function loginReducer(state = false, action) {
  switch (action.type) {
    case IS_OPEN_LOGIN_FORM:
      return action.payload;
    default:
      return state;
  }
}

function userLoggedInReducer(state = true, action) {
  switch (action.type) {
    case IS_USER_LOGGED_IN:
      return action.isUserLoggedIn;
    default:
      return state;
  }
}

export const REDUCERS = {
  isHamburgerMenuOpen: hamburgerMenuReducer,
  isSearchBarOpen: searchBarReducer,
  member: memberReducer,
  isLoginOpen: loginReducer,
  isUserLoggedIn: userLoggedInReducer
};
