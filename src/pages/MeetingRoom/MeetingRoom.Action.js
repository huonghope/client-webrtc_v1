import constants from "./MeetingRoom.Constants"
import Errors from "../../components/Error/error";
import getSocket from "../rootSocket";
import meetingRoomSocket from './MeetingRoom.Socket'

const actions = {
  setHostUser: (data) => (dispatch) => {
    try {
      dispatch({
        type: constants.SET_HOST,
        payload: data
      })
    } catch (error) {
      Errors.handle(error);
    }
  },
  doCreateLocalStream :  (localStream) => async(dispatch) => {
    try {
        dispatch({
            type: constants.CREATE_LOCALSTREAM,
            payload: { localStream: localStream },
        });
    } catch (error) {
        Errors.handle(error);
        dispatch({
            type: constants.CREATE_LOCALSTREAM_ERROR,
        });
    }
  },
  whoIsOnline: () => async(dispatch) => {
    try {
        meetingRoomSocket.sendToPeer("onlinePeers", null, { local: getSocket().id});
    } catch (error) {
      console.log(error)
    }
  },
  handleSetPeerConnections: (data) => async (dispatch) => {
    try {
      dispatch({
        type: constants.SET_PEER_CONNECTIONS,
        payload: data,
      });
    } catch (error) {
      Errors.handle(error);
      dispatch({
        type: constants.SET_PEER_CONNECTIONS_ERROR,
      });
    }
  },
  shareScreen: (status) => async(dispatch) => {
    try {
      console.log(status)
      dispatch({
        type: constants.SHARE_SCREEN,
        payload: { status }
      })
    } catch (error) {
      // console.log(error)
    }
  }
};
export default actions;
