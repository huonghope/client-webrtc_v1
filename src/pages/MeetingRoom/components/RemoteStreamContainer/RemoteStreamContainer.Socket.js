import getSocket from "../../../rootSocket"

const remoteStreamContainerSocket = {
  sendToPeer : (messageType, payload, socketID) => {
    getSocket().emit(messageType, {
      socketID,
      payload
    })
  },
  emitHostWarning : (payload) => {
    getSocket().emit("host-send-warning", payload)
  },
  emitHostDisableChat : (payload) => {
    getSocket().emit("host-send-disable-chat", payload)
  },
  emitProcessRequestUser: (payload) => {
    getSocket().emit("host-send-process-request", payload)
  },
  emitTestConcentration: (payload) => {
    getSocket().emit("user-test-concentration", payload)
  },
  emitFailTestConcentration: (payload) => {
    getSocket().emit("user-test-concentration-fail", payload)
  },
  emitUserComeback: (payload) => {
    getSocket().emit("user-send-comeback-lec", payload)
  }
} 

export default remoteStreamContainerSocket