import api from '../../services/api'

export const getCustomers = async (tenantId) => {
  const response = await api.get(`/tenants/${tenantId}/customers`)
  return response.data.data
}

export const getCustomerById = async (tenantId, customerId) => {
  const response = await api.get(
    `/tenants/${tenantId}/customers/${customerId}`
  )
  return response.data.data
}

export const createCustomer = async (tenantId, customerData) => {
  const response = await api.post(
    `/tenants/${tenantId}/customers`,
    customerData
  )
  return response.data.data
}

export const updateCustomer = async (tenantId, customerId, customerData) => {
  const response = await api.put(
    `/tenants/${tenantId}/customers/${customerId}`,
    customerData
  )
  return response.data.data
}

export const deleteCustomer = async (tenantId, customerId) => {
  const response = await api.delete(
    `/tenants/${tenantId}/customers/${customerId}`
  )
  return response.data
}