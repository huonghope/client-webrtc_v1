import { useDispatch } from "react-redux"
import io from "socket.io-client"
import { isAuthenticated } from "../routes/permissionChecker"
import getStore from "../store/config"
import meetingRoomAction from "./MeetingRoom/MeetingRoom.Action"
const endpoint = process.env.REACT_APP_SERVER_SOCKET
let socket = null;

const onConnected = () => {
  console.log("socket: connected - Welcome to page")
  getSocket().on("user-role", data => {
    const { userRole } = data
    getStore().dispatch(meetingRoomAction.setHostUser({ isHostUser: userRole}));
    // dispatch(meetingRoomAction.setHostUser({ isHostUser: userRole }))
    console.log("i am ", userRole)
  })
}

const onDisconnect = () => {
  console.log("socket: disconnect")
}

export const configSocket = async () => {
  if (socket && socket.disconnected) {
    socket.connect()
  }

  if (socket) return

  socket = io.connect(endpoint, {
    path: `/io/webrtc`,
    query: {
      token : isAuthenticated(),
      roomId: localStorage.getItem("usr_id") ? localStorage.getItem("usr_id") : null
    }
  })
  socket.on("connect", onConnected)
  socket.on("disconnect", onDisconnect)

  return socket
}

export const socketDisconnect = () => {
  socket.disconnect()
}

export default function getSocket() {
  console.log("get socket", socket)
  return socket
}
