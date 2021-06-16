import axios from "../../../../apis/axios";

export const userRequestQuestion = async (params) => {
  const response = await axios.post("/room/req-question", params );
  return response;
};

export const userRequestLecOut = async (params) => {
  const response = await axios.post("/room/req-lecout", params );
  return response;
};

