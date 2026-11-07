
import api from '../../services/api'

export const getCategories = async (tenantId) => {
  const response = await api.get(`/tenants/${tenantId}/categories`)
  return response.data.data
}

export const createCategory = async (tenantId, categoryData) => {
  const response = await api.post(
    `/tenants/${tenantId}/categories`,
    categoryData
  )
  return response.data.data
}

export const updateCategory = async (tenantId, categoryId, categoryData) => {
  const response = await api.put(
    `/tenants/${tenantId}/categories/${categoryId}`,
    categoryData
  )
  return response.data.data
}

export const deleteCategory = async (tenantId, categoryId) => {
  const response = await api.delete(
    `/tenants/${tenantId}/categories/${categoryId}`
  )
  return response.data
}
