import axios from "../../../../apis/axios";

const chatService = {
  getListUser: async () => {
    const response = await axios.get('/getuser');
    return response
  },
  upFile: async(params) => {
    const response = await axios.post('/room/upfile', params);
    return response
  },
  getListMessageByUserId: async (params) => {
    const response = await axios.get('/chat', { params });
    return response
  }
}

export default chatService