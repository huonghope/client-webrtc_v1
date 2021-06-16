import * as constants from "./constants";
import produce from 'immer';
const initialState = {
  initLoading: true,
  signInLoading: false,
  signInError: null,
  roomInfo: null,
};

const authReducer = (state = initialState, { type, payload }) =>
  produce(state, draft => {
    switch (type) {
      case constants.SIGNIN_INIT_LOADING_DONE:
        draft.initLoading = false;
        break;
      case constants.SIGNIN_START:
        draft.roomInfo = payload;
        draft.signInLoading = true;
        draft.signInError = null;
        break;
      case constants.SIGNIN_SUCCESS:
        draft.signInLoading = false;
        draft.signInError = null;
        break;
      case constants.SIGNIN_ERROR:
        draft.signInLoading = false;
        draft.signInError = payload || null;
        break;
      case constants.JOINROOM_SUCCESS:
        draft.roomInfo  = payload
        break;
      default:
        break;
    }
  });

export default authReducer;
