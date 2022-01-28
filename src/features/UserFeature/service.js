import api from "../../apis/axios"

const services = {
  getCurrent: async () => {
    const response = await api.get(`/user/current`)
    return response
  },
  checkConnecting: async (params) => {
    const response = await api.get(`/user/check-connecting`, { params })
    return response
  }
}

export default services
