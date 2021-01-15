import constants from "./HeadingController.Constants"
// import getStore, { getHistory } from "../../store/config";
import Errors from "../../../../components/Error/error";
// import services from "./MeetingRoom.Service";
// import { emitSentMessage, emitCreateGroup } from "./MeetingRoom.Socket";
// import getSocket from "../rootSocket";
// import meetingRoomSocket from './MeetingRoom.Socket'

const actions = {
  handleStateMicAllStudent :  () => async(dispatch) => {
    try {
      dispatch({
          type: constants.CHANGE_STATE_MIC_ALL_STUDENT_ERROR,
      });
    } catch (error) {
        dispatch({
            type: constants.CHANGE_STATE_MIC_ALL_STUDENT,
        });
        Errors.handle(error);
    }
  },
  handleChangeMicState :  () => async(dispatch) => {
    try {
      dispatch({
          type: constants.CHANGE_MIC_STATE,
      });
    } catch (error) {
        dispatch({
            type: constants.CHANGE_MIC_STATE_ERROR,
        });
        Errors.handle(error);
    }
  },
  handleChangeCamState :  () => async(dispatch) => {
    try {
      dispatch({
          type: constants.CHANGE_CAM_STATE,
      });
    } catch (error) {
        Errors.handle(error);
        dispatch({
            type: constants.CHANGE_CAM_STATE_ERROR,
        });
    }
  },  

  //STUDENT
  listenRequestQuestion: (data) => async(dispatch) => {
    try {
      dispatch({
          type: constants.REQUEST_QUESTION_STATUS,
          payload: {
            status: data.status
          }
      });
    } catch (error) {
        Errors.handle(error);
        dispatch({
            type: constants.REQUEST_QUESTION_ERROR,
        });
    }
  },
  listenRequestLecOut: (data) => async(dispatch) => {
    try {
      dispatch({
        type: constants.REQUEST_QUESTION_STATUS,
        payload: {
          status: data.status
        }
    });
    } catch (error) {
        Errors.handle(error);
        dispatch({
            type: constants.REQUEST_LECOUT_ERROR,
        });
    }
  },
};
export default actions;
