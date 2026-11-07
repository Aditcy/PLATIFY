
import api from '../../services/api'

export const getAnalyticsOverview = async (tenantId) => {
  const response = await api.get(
    `/tenants/${tenantId}/analytics/overview`
  )

  return response.data.data
}

export const getRevenueAnalytics = async (tenantId) => {
  const response = await api.get(
    `/tenants/${tenantId}/analytics/revenue`
  )

  return response.data.data
}

export const getOrderAnalytics = async (tenantId) => {
  const response = await api.get(
    `/tenants/${tenantId}/analytics/orders`
  )

  return response.data.data
}
