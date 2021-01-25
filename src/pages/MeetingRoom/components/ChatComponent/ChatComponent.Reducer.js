import constants from "./ChatComponent.Constants";
import produce from "immer";


const initialState = {
  chattingState: false,
  disableChatUser: [],
  disableAllChat: false,
};

const chatReducer = (state = initialState, { type, payload }) =>
  produce(state, (draft) => {
    switch (type) {
      case constants.CHAT_STATE_CHANGE:
        draft.chattingState = payload.state
        break;
      case constants.DISABLE_CHAT_USER:
          let existsUser = state.disableChatUser.filter(item => item.userId === payload.userId)
          if(existsUser.length === 0){
            draft.disableChatUser.push(payload);
          }else{
            let mapUser = state.disableChatUser.map(item => item.userId === payload.userId ? payload : item)
            draft.disableChatUser = mapUser;
          }  
          break;
      case constants.DISABLE_ALL_CHAT:
        draft.disableAllChat = !draft.disableAllChat
        break;
      default:
        break;
    }
  });

export default chatReducer;
