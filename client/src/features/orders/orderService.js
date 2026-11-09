import api from '../../services/api'

export const getOrders = async (tenantId, filters = {}) => {
  const response = await api.get(`/tenants/${tenantId}/orders`, {
    params: filters
  })

  return response.data.data
}

export const getOrderById = async (tenantId, orderId) => {
  const response = await api.get(
    `/tenants/${tenantId}/orders/${orderId}`
  )

  return response.data.data
}

export const createOrder = async (tenantId, orderData) => {
  const response = await api.post(
    `/tenants/${tenantId}/orders`,
    orderData
  )

  return response.data.data
}

export const updateOrderStatus = async (
  tenantId,
  orderId,
  statusData
) => {
  const response = await api.patch(
    `/tenants/${tenantId}/orders/${orderId}/status`,
    statusData
  )

  return response.data.data
}