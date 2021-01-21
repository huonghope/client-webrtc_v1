import api from "../../apis/axios"
import asmediaapi from "../../apis/asmediaapi"

const services = {
  getCurrent: async () => {
    const response = await api.get(`/user/current`)
    return response
  },
}

export default services
