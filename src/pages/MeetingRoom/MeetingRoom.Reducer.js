import produce from 'immer'
import constants from './MeetingRoom.Constants'

const initialState = {
  localStream: null,
  isHostUser: false,
}

export const roomReducer =(state = initialState, { type, payload })  =>
  produce(state, draft => {
    switch (type) {
      case constants.CREATE_LOCALSTREAM:
        draft.localStream = payload.localStream
        break;
      case constants.SET_HOST:
        draft.isHostUser = payload.isHostUser
        break;
      default:
        return state
    }
  })
export default roomReducer;

