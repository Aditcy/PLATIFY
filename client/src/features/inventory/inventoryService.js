
import api from '../../services/api'

export const getInventorySummary = async (tenantId) => {
  const response = await api.get(
    `/tenants/${tenantId}/inventory/summary`
  )

  return response.data.data
}

export const getStockMovements = async (tenantId) => {
  const response = await api.get(
    `/tenants/${tenantId}/inventory/movements`
  )

  return response.data.data
}

export const adjustStock = async (tenantId, adjustmentData) => {
  const response = await api.post(
    `/tenants/${tenantId}/inventory/adjustments`,
    adjustmentData
  )

  return response.data.data
}
