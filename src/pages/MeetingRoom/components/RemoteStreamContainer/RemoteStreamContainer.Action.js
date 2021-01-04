import constants from "./RemoteStreamContainer.Constants"
// import getStore, { getHistory } from "../../store/config";
import Errors from "../../../../components/Error/error";
// import services from "./MeetingRoom.Service";
// import { emitSentMessage, emitCreateGroup } from "./MeetingRoom.Socket";
// import getSocket from "../rootSocket";
// import meetingRoomSocket from './MeetingRoom.Socket'

const actions = {
  saveListUser: (data) => (dispatch) => {
    try {
      dispatch({
        type: constants.SET_LIST_USER,
        payload: {listUser: data}
      })
    } catch (error) {
      Errors.handle(error);
    }
  },
  saveLectureInfo: (data) => (dispatch) => {
    try {
      dispatch({
        type: constants.SET_LECTURE_INFO,
        payload: {lecture: data.data}
      })
    } catch (error) {
      Errors.handle(error);
    }
  },
  saveListUserRequest: (data) => (dispatch) => {
    try {
      dispatch({
        type: constants.SET_LIST_USER_REQUEST,
        payload: {listUserRequest: data}
      })
    } catch (error) {
      Errors.handle(error);
    }
  }
};
export default actions;
