import * as constants from "./constants";
import produce from 'immer';
const initialState = {
  initLoading: true,
  signinLoading: false,
  signinError: null,
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
        draft.signinLoading = true;
        draft.signinError = null;
        break;
      case constants.SIGNIN_SUCCESS:
        draft.signinLoading = false;
        draft.signinError = null;
        break;
      case constants.SIGNIN_ERROR:
        draft.signinLoading = false;
        draft.signinError = payload || null;
        break;
      case constants.JOINROOM_SUCCESS:
        console.log(payload)
        draft.roomInfo  = payload
      default:
        break;
    }
  });

export default authReducer;
