import api from '../../services/api'

export const registerUser = async (userData) => {
  const response = await api.post('/auth/register', userData)
  return response.data
}

export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials)
  return response.data
}

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me')
  return response.data
}

export const getMyBusinesses = async () => {
  const response = await api.get('/tenants/my-businesses')
  return response.data
}

export const createBusiness = async (businessData) => {
  const response = await api.post('/tenants', businessData)
  return response.data
}
