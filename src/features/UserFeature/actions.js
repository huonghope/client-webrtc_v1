import * as constants from "./constants"
import Message from "../../components/Message"
import Errors from "../../components/Error/error"
import services from "./service"

const messageUpdateSuccess = "Update successfully"
// const messageCreateSuccess = "Create successfully";
// const messageDeleteSuccess = "Delete successfully";

const actions = {
  getCurrent: () => async dispatch => {
    try {
      dispatch({
        type: constants.USER_GET_CURRENT_START
      })
      let response = await services.getCurrent()
      console.log("hello user info", response)
      dispatch({
        type: constants.USER_GET_CURRENT_SUCCESS,
        payload: response.data
      })
    } catch (error) {
      Errors.handle(error)

      dispatch({
        type: constants.USER_GET_CURRENT_ERROR
      })
    }
  },

}
export default actions
