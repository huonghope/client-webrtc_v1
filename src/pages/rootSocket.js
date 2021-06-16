import io from "socket.io-client"
import { isAuthenticated } from "../routes/permissionChecker"
const endpoint = process.env.REACT_APP_SERVER_SOCKET
let socket = null;

const onConnected = () => {
  // console.log("socket: connected - Welcome to page")
}

const onDisconnect = () => {
  // console.log("socket: disconnect")
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
  return socket
}
