
import api from '../../services/api'

export const getProducts = async (tenantId) => {
  const response = await api.get(`/tenants/${tenantId}/products`)
  return response.data.data
}

export const createProduct = async (tenantId, productData) => {
  const response = await api.post(
    `/tenants/${tenantId}/products`,
    productData
  )
  return response.data.data
}

export const updateProduct = async (tenantId, productId, productData) => {
  const response = await api.put(
    `/tenants/${tenantId}/products/${productId}`,
    productData
  )
  return response.data.data
}

export const deleteProduct = async (tenantId, productId) => {
  const response = await api.delete(
    `/tenants/${tenantId}/products/${productId}`
  )
  return response.data
}

export const getProductCategories = async (tenantId) => {
  const response = await api.get(`/tenants/${tenantId}/categories`)
  return response.data.data
}
