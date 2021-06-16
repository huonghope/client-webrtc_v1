import axios from "../../apis/axios";

export const fetchSignIn = async (userInfo) => {
  const response = await axios.get("/user", { params : userInfo });
  return response;
};

export const fetJoinRoom = async (params) => {
  const response = await axios.post("/room", params );
  return response;
}

export const fetchRefreshToken = async (data) => {
  const response = await axios.post("/auth/refresh-token", data);
  return response;
}
