import api from "../../apis/axios"

const services = {
  getCurrent: async () => {
    const response = await api.get(`/user/current`)
    return response
  },
}

export default services
