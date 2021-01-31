import produce from 'immer'
import constants from './RemoteStreamContainer.Constants'

const initialState = {
  listUser: [],
  lectureInfo: null,
  listUserRequest: [],
  userRequest: {}
}

export const remoteReducer =(state = initialState, { type, payload })  =>
  produce(state, draft => {
    switch (type) {
      case constants.SET_LIST_USER:
        draft.listUser = payload.listUser
        break;
      case constants.SET_LECTURE_INFO:
        draft.lectureInfo = payload.lecture
        break;
      case constants.SET_LIST_USER_REQUEST:
        console.log("payload", payload.listUserRequest)
        draft.listUserRequest = payload.listUserRequest
        break;
      case constants.SET_USER_REQUEST:
        draft.userRequest = payload.request
        break;
      default:
        return state
    }
  })
export default remoteReducer;

