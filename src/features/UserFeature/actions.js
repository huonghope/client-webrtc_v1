import * as constants from "./constants"
import Errors from "../../components/Error/error"
import services from "./service"

// const messageCreateSuccess = "Create successfully";
// const messageDeleteSuccess = "Delete successfully";

const actions = {
  getCurrent: () => async dispatch => {
    try {
      dispatch({
        type: constants.USER_GET_CURRENT_START
      })
      let response = await services.getCurrent()
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
