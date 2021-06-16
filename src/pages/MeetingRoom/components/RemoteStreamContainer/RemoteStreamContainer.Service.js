import axios from "../../../../apis/axios";

export const getInformationRoom = async (params) => {
  const response = await axios.get("/room/getinfo", {params});
  return response;
};

export const getLectureInfo = async (params) => {
  const response = await axios.get("/room/lecture", {params});
  return response;
}

export const getWarningInfo = async (params) => {
  const response = await axios.get("/warning/info", {params})
  return response
}

export const getRequestQuestion = async (params) => {
  const response = await axios.get("/room/request-ques", {params})
  return response
}
export const getRequestQuestionByUser = async (params) => {
  const response = await axios.get("/room/request-ques/user", {params})
  return response
}

export const getRequestLecOut = async (params) =>{
  const response = await axios.get("/room/request-lecOut", {params})
  return response
}

export const getRequestLecOutByUser = async (params) =>{
  const response = await axios.get("/room/request-lecOut/user", {params})
  return response
}

export const postTestConcentration = async (params) => {
  const response = await axios.post("/room/test-concentration-fail", params);
  return response;
}


