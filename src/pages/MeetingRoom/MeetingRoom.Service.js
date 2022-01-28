import axios from "../../apis/axios";

export const getUserRole = async (params) => {
  const response = await axios.get("/user/profile", {params});
  return response
}
export const setTimeRoomWithTime = async (params) => {
  const response = await axios.post('/room/calculat-time', params);
  return response;
};

