
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Plus,
  Search,
  Package,
  Pencil,
  Trash2,
  X,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductCategories
} from '../../features/products/productService'

const emptyForm = {
  name: '',
  sku: '',
  description: '',
  categoryId: '',
  price: '',
  costPrice: '',
  stockQuantity: '',
  lowStockThreshold: 5
}

function ProductsPage() {
  const { activeTenant } = useSelector((state) => state.auth)

  const tenantId = activeTenant?._id || activeTenant?.id

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const loadData = async () => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const [productData, categoryData] = await Promise.all([
        getProducts(tenantId),
        getProductCategories(tenantId)
      ])

      setProducts(productData || [])
      setCategories(categoryData || [])
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to load products'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tenantId])

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim()

    return products.filter((product) =>
      product.name?.toLowerCase().includes(query) ||
      product.sku?.toLowerCase().includes(query)
    )
  }, [products, search])

  const openCreateForm = () => {
    setEditingProduct(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEditForm = (product) => {
    setEditingProduct(product)

    setForm({
      name: product.name || '',
      sku: product.sku || '',
      description: product.description || '',
      categoryId: product.categoryId?._id || product.categoryId || '',
      price: product.price ?? '',
      costPrice: product.costPrice ?? 0,
      stockQuantity: product.stockQuantity ?? 0,
      lowStockThreshold: product.lowStockThreshold ?? 5
    })

    setShowForm(true)
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setForm((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!tenantId) {
      toast.error('Please select a business first')
      return
    }

    const productData = {
      ...form,
      price: Number(form.price),
      costPrice: Number(form.costPrice),
      stockQuantity: Number(form.stockQuantity),
      lowStockThreshold: Number(form.lowStockThreshold),
      categoryId: form.categoryId || null
    }

    try {
      setSaving(true)

      if (editingProduct) {
        await updateProduct(
          tenantId,
          editingProduct._id,
          productData
        )

        toast.success('Product updated successfully')
      } else {
        await createProduct(tenantId, productData)

        toast.success('Product created successfully')
      }

      setShowForm(false)
      setEditingProduct(null)
      setForm(emptyForm)

      await loadData()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to save product'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await deleteProduct(tenantId, productId)

      toast.success('Product deleted successfully')
      await loadData()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to delete product'
      )
    }
  }

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(price || 0)

  if (!tenantId) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-8 text-slate-300">
        Please select a business to manage products.
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-indigo-400">INVENTORY MANAGEMENT</p>
          <h1 className="mt-2 text-2xl font-bold text-white">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your business products and stock.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Products</p>
            <Package className="text-indigo-400" size={20} />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">
            {products.length}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <p className="text-sm text-slate-400">Total Units</p>
          <p className="mt-3 text-2xl font-bold text-white">
            {products.reduce(
              (total, product) => total + Number(product.stockQuantity || 0),
              0
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <p className="text-sm text-slate-400">Low Stock Products</p>
          <p className="mt-3 text-2xl font-bold text-amber-400">
            {products.filter(
              (product) =>
                Number(product.stockQuantity) <=
                Number(product.lowStockThreshold)
            ).length}
          </p>
        </div>

      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0d1424]">

        <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-semibold text-white">
              Product Catalogue
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {filteredProducts.length} products found
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#111b2e] px-3 py-2">
            <Search size={17} className="text-slate-400" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500 sm:w-52"
            />

            <button
              onClick={loadData}
              className="text-slate-400 transition hover:text-white"
              title="Refresh products"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={36} className="mx-auto text-slate-500" />
            <p className="mt-4 font-medium text-white">
              No products found
            </p>
            <p className="mt-1 text-sm text-slate-400">
              Add your first product to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#111b2e] text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">SKU</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => {
                  const lowStock =
                    Number(product.stockQuantity) <=
                    Number(product.lowStockThreshold)

                  return (
                    <tr key={product._id} className="transition hover:bg-white/[0.02]">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {product.categoryId?.name || 'Uncategorised'}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-slate-400">
                        {product.sku}
                      </td>

                      <td className="px-5 py-4 font-medium text-white">
                        {formatPrice(product.price)}
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        {product.stockQuantity}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          lowStock
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {lowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(product)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400"
                            title="Edit product"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(product._id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-500/10 hover:text-red-400"
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
          <div className="my-auto w-full max-w-2xl rounded-2xl border border-white/10 bg-[#0d1424] shadow-2xl">

            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Enter your product information.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Product Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    placeholder="Classic Cotton T-Shirt"
                    className="w-full rounded-xl border border-white/10 bg-[#111b2e] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    SKU *
                  </label>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    required
                    placeholder="UT-TS-001"
                    className="w-full rounded-xl border border-white/10 bg-[#111b2e] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-[#111b2e] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-300">
                  Category
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-[#111b2e] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#111b2e] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    value={form.costPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full rounded-xl border border-white/10 bg-[#111b2e] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-xl border border-white/10 bg-[#111b2e] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={form.lowStockThreshold}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-xl border border-white/10 bg-[#111b2e] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default ProductsPage
