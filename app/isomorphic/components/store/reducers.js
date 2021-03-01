import { IS_OPEN_LOGIN_FORM, MEMBER_UPDATED } from "./actions";

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

export const REDUCERS = {
  member: memberReducer,
  isLoginOpen: loginReducer
};
