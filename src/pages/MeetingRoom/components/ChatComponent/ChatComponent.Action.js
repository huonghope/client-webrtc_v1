import constants from "./ChatComponent.Constants"
import Errors from "../../../../components/Error/error";

const actions = {
  chattingStateChange :  (data) => async(dispatch) => {
    try {
      dispatch({
          type: constants.CHAT_STATE_CHANGE,
          payload:  { state : data }
      });
    } catch (error) {
        Errors.handle(error);
    }
  },
  disableChatUser: (data) => (dispatch) => {
    try {
      dispatch({
          type: constants.DISABLE_CHAT_USER,
          payload:  data
      });
    } catch (error) {
        Errors.handle(error);
    }
  },
  disableAllChatting: (data) => async(dispatch) => {
    try {
      dispatch({
          type: constants.DISABLE_ALL_CHAT,
          payload:  { state : data }
      });
    } catch (error) {
        Errors.handle(error);
    }
  }
};
export default actions;
