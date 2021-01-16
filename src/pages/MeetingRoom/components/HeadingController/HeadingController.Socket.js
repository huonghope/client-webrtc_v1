
import getSocket from "../../../rootSocket"
import getStore from "../../../../store/config"

const headingControllerSocket = {
  sendToPeer : (messageType, payload, socketID) => {
    getSocket().emit(messageType, {
      socketID,
      payload
    })
  },
  emitUserRequestQuestion : (payload) => {
    getSocket().emit("user-request-question", payload)
  },
  emitUserCancelRequestQuestion: (payload) => {
    getSocket().emit("user-cancel-request-question", payload)
  },
  emitUserRequestLecOut: (payload) => {
    getSocket().emit("user-request-lecOut", payload)
  },
  emitUserCancelRequestLecOut: (payload) => {
    getSocket().emit("user-cancel-request-lecOut", payload)
  },
  emitHandleStateMicAllStudent: (payload) => {
    getSocket().emit("host-send-mute-mic-all", payload)
  }
} 

export default headingControllerSocket