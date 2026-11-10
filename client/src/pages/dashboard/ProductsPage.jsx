
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

  const inputClass = 'w-full min-w-0 rounded-xl border border-[var(--border-color)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]'

  const labelClass = 'mb-2 block text-sm font-medium text-[var(--text-secondary)]'

  const primaryButtonClass = 'flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-50'

  if (!tenantId) {
    return (
      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-6 text-[var(--text-secondary)] sm:p-8">
        Please select a business to manage products.
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold tracking-wide text-[var(--accent)]">
            INVENTORY MANAGEMENT
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">
            Manage your business products and stock.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className={`${primaryButtonClass} w-full shrink-0 sm:w-auto`}
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--text-muted)]">Total Products</p>
            <div className="rounded-xl bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
              <Package size={20} />
            </div>
          </div>
          <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
            {products.length}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm">
          <p className="text-sm font-medium text-[var(--text-muted)]">Total Units</p>
          <p className="mt-3 text-2xl font-bold text-[var(--text-primary)]">
            {products.reduce(
              (total, product) => total + Number(product.stockQuantity || 0),
              0
            )}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm sm:col-span-2 xl:col-span-1">
          <p className="text-sm font-medium text-[var(--text-muted)]">Low Stock Products</p>
          <p className="mt-3 text-2xl font-bold text-amber-500">
            {products.filter(
              (product) =>
                Number(product.stockQuantity) <=
                Number(product.lowStockThreshold)
            ).length}
          </p>
        </div>

      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">

        <div className="flex flex-col justify-between gap-4 border-b border-[var(--border-color)] p-4 sm:p-5 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">
              Product Catalogue
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {filteredProducts.length} products found
            </p>
          </div>

          <div className="flex w-full items-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--app-bg)] px-3 py-2.5 lg:w-auto">
            <Search size={17} className="shrink-0 text-[var(--text-muted)]" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products..."
              className="w-full min-w-0 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] lg:w-52"
            />

            <button
              onClick={loadData}
              className="shrink-0 rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--card-bg-hover)] hover:text-[var(--accent)]"
              title="Refresh products"
              aria-label="Refresh products"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-[var(--text-muted)]">
            Loading products...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package size={36} className="mx-auto text-[var(--text-muted)]" />
            <p className="mt-4 font-medium text-[var(--text-primary)]">
              No products found
            </p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Add your first product to get started.
            </p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-[var(--app-bg)] text-xs uppercase tracking-wide text-[var(--text-muted)]">
                <tr>
                  <th className="px-5 py-4">Product</th>
                  <th className="px-5 py-4">SKU</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Stock</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredProducts.map((product) => {
                  const lowStock =
                    Number(product.stockQuantity) <=
                    Number(product.lowStockThreshold)

                  return (
                    <tr
                      key={product._id}
                      className="transition hover:bg-[var(--card-bg-hover)]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium text-[var(--text-primary)]">
                          {product.name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {product.categoryId?.name || 'Uncategorised'}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-[var(--text-secondary)]">
                        {product.sku}
                      </td>

                      <td className="px-5 py-4 font-medium text-[var(--text-primary)]">
                        {formatPrice(product.price)}
                      </td>

                      <td className="px-5 py-4 text-[var(--text-secondary)]">
                        {product.stockQuantity}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                          lowStock
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {lowStock ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditForm(product)}
                            className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                            title="Edit product"
                            aria-label={`Edit ${product.name}`}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            onClick={() => handleDelete(product._id)}
                            className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-500"
                            title="Delete product"
                            aria-label={`Delete ${product.name}`}
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
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-5"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setShowForm(false)
            }
          }}
        >
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-2xl">

            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-color)] p-4 sm:p-5">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Enter your product information.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)]"
                aria-label="Close product form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[calc(100vh-130px)] space-y-4 overflow-y-auto p-4 sm:p-5">

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="min-w-0">
                  <label className={labelClass}>
                    Product Name *
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    maxLength={150}
                    placeholder="Classic Cotton T-Shirt"
                    className={inputClass}
                  />
                </div>

                <div className="min-w-0">
                  <label className={labelClass}>
                    SKU *
                  </label>
                  <input
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    required
                    placeholder="UT-TS-001"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Category
                </label>
                <select
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>
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
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Cost Price (₹)
                  </label>
                  <input
                    type="number"
                    name="costPrice"
                    value={form.costPrice}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stockQuantity"
                    value={form.stockQuantity}
                    onChange={handleChange}
                    min="0"
                    required
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={form.lowStockThreshold}
                    onChange={handleChange}
                    min="0"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-color)] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-[var(--border-color)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={primaryButtonClass}
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
