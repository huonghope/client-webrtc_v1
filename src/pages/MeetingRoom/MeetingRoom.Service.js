import axios from "../../apis/axios";

export const getUserRole = async (params) => {
  const response = await axios.get("/user/profile", {params});
  return response
}

