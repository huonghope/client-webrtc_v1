import constants from "./RemoteStreamContainer.Constants"
import Errors from "../../../../components/Error/error";
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
  },
  saveCurrentRequest: (data) => (dispatch) => {
    try {
      dispatch({
        type: constants.SET_USER_REQUEST,
        payload: {request: data}
      })
    } catch (error) {
      Errors.handle(error);
    }
  }
};
export default actions;
