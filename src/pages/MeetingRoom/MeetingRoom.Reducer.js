import produce from 'immer'
import constants from './MeetingRoom.Constants'

const initialState = {
  localStream: null,
  isHostUser: false,
  shareScreen: false,
  peerConnections: {},
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
      case constants.SHARE_SCREEN:
        draft.shareScreen = payload.status
        break;
        // 현재 Peer Connections 객체
      case constants.SET_PEER_CONNECTIONS:
        draft.peerConnections = payload;
        break;
      case constants.SET_PEER_CONNECTIONS_ERROR:
        draft.peerConnections = undefined;
        break;
      default:
        return state
    }
  })
export default roomReducer;

