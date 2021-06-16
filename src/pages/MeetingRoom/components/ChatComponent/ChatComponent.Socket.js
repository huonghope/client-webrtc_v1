import getSocket from "../../../rootSocket"

const ChatComponentSocket = {
  emitSentMessage :  (payload) => {
    getSocket().emit("sent-message", payload);
  },
  emitDisableUserChat: (payload) => {
    getSocket().emit("host-req-user-disable-chat", payload);
  },
  emitEnableUserChat: (payload) => {
    getSocket().emit("host-req-user-enable-chat", payload);
  }
} 
export default ChatComponentSocket;
