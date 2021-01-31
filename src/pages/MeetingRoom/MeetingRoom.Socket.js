import getSocket from "../rootSocket"

const meetingRoomSocket = {
  sendToPeer : (messageType, payload, socketID) => {
    getSocket().emit(messageType, {
      socketID,
      payload
    })
  }
  
} 

export default meetingRoomSocket