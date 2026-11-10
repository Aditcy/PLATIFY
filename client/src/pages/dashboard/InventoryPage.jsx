
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  Package,
  Boxes,
  AlertTriangle,
  IndianRupee,
  Search,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  RefreshCw,
  X,
  LoaderCircle,
  SlidersHorizontal
} from 'lucide-react'

import { getProducts } from '../../features/products/productService'
import {
  getInventorySummary,
  getStockMovements,
  adjustStock
} from '../../features/inventory/inventoryService'

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value) || 0)

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short'
      })
    : '—'

const inputClass =
  'w-full min-w-0 rounded-xl border border-[var(--border-color)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]'

const labelClass =
  'mb-2 block text-sm font-medium text-[var(--text-secondary)]'

function InventoryPage() {
  const { activeTenant } = useSelector((state) => state.auth)
  const tenantId = activeTenant?._id || activeTenant?.id

  const [products, setProducts] = useState([])
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalUnits: 0,
    inventoryCostValue: 0,
    lowStockCount: 0
  })
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [movements, setMovements] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all')

  const [showModal, setShowModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const [formData, setFormData] = useState({
    type: 'stock_in',
    quantity: '',
    reason: ''
  })

  const loadInventory = useCallback(async (showRefresh = false) => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    try {
      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const [productData, inventoryData, movementData] =
        await Promise.all([
          getProducts(tenantId),
          getInventorySummary(tenantId),
          getStockMovements(tenantId)
        ])

      setProducts(Array.isArray(productData) ? productData : [])

      setSummary(
        inventoryData?.summary || {
          totalProducts: 0,
          totalUnits: 0,
          inventoryCostValue: 0,
          lowStockCount: 0
        }
      )

      setLowStockProducts(
        Array.isArray(inventoryData?.lowStockProducts)
          ? inventoryData.lowStockProducts
          : []
      )

      setMovements(Array.isArray(movementData) ? movementData : [])
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to load inventory'
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [tenantId])

  useEffect(() => {
    loadInventory()
  }, [loadInventory])

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase()

    return products.filter((product) => {
      const matchesSearch =
        !term ||
        `${product.name} ${product.sku}`.toLowerCase().includes(term)

      const isLowStock =
        Number(product.stockQuantity) <=
        Number(product.lowStockThreshold)

      const matchesFilter =
        stockFilter === 'all' ||
        (stockFilter === 'low' && isLowStock) ||
        (stockFilter === 'healthy' && !isLowStock)

      return matchesSearch && matchesFilter
    })
  }, [products, search, stockFilter])

  const openAdjustment = (product, type = 'stock_in') => {
    setSelectedProduct(product)
    setFormData({
      type,
      quantity: '',
      reason: ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) return
    setShowModal(false)
    setSelectedProduct(null)
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const quantity = Number(formData.quantity)

    if (
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      (formData.type !== 'adjustment' && quantity === 0)
    ) {
      toast.error('Enter a valid whole-number quantity')
      return
    }

    if (formData.type === 'adjustment' && !formData.reason.trim()) {
      toast.error('A reason is required for stock adjustments')
      return
    }

    try {
      setSaving(true)

      await adjustStock(tenantId, {
        productId: selectedProduct._id,
        type: formData.type,
        quantity,
        reason: formData.reason.trim()
      })

      toast.success('Inventory updated successfully')
      setShowModal(false)
      setSelectedProduct(null)

      await loadInventory(true)
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to update inventory'
      )
    } finally {
      setSaving(false)
    }
  }

  const getStockStatus = (product) => {
    const stock = Number(product.stockQuantity) || 0
    const threshold = Number(product.lowStockThreshold) || 0

    if (stock === 0) return 'Out of Stock'
    if (stock <= threshold) return 'Low Stock'
    return 'In Stock'
  }

  const statusClasses = (status) => {
    if (status === 'In Stock') {
      return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
    }

    if (status === 'Low Stock') {
      return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
    }

    return 'bg-red-500/10 text-red-600 dark:text-red-400'
  }

  const movementLabel = (type) => {
    if (type === 'stock_in') return 'Stock In'
    if (type === 'stock_out') return 'Stock Out'
    return 'Adjustment'
  }

  const movementClasses = (type) => {
    if (type === 'stock_in') return 'text-emerald-600 dark:text-emerald-400'
    if (type === 'stock_out') return 'text-red-600 dark:text-red-400'
    return 'text-amber-600 dark:text-amber-400'
  }

  return (
    <div className="min-w-0 space-y-7">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Inventory Management
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Inventory
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Monitor stock levels and manage inventory movements.
          </p>
        </div>

        <button
          onClick={() => loadInventory(true)}
          disabled={refreshing || loading}
          className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)] disabled:opacity-50 sm:w-auto"
        >
          <RefreshCw
            size={17}
            className={refreshing ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--text-muted)]">Total Products</p>
            <Package className="shrink-0 text-[var(--accent)]" size={21} />
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
            {summary.totalProducts}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Active products</p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--text-muted)]">Total Units</p>
            <Boxes className="shrink-0 text-blue-500" size={21} />
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
            {summary.totalUnits}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">Units in stock</p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--text-muted)]">Low Stock Products</p>
            <AlertTriangle className="shrink-0 text-amber-500" size={21} />
          </div>
          <p className="mt-3 text-3xl font-bold text-[var(--text-primary)]">
            {summary.lowStockCount}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            At or below stock threshold
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[var(--text-muted)]">Inventory Cost Value</p>
            <IndianRupee className="shrink-0 text-emerald-500" size={21} />
          </div>
          <p className="mt-3 break-words text-2xl font-bold text-[var(--text-primary)]">
            {formatPrice(summary.inventoryCostValue)}
          </p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Stock quantity × cost price
          </p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.04] p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={19} className="text-amber-500" />
            <h2 className="font-semibold text-[var(--text-primary)]">
              Low Stock Alerts
            </h2>
          </div>

          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product._id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--text-primary)]">
                    {product.name}
                  </p>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">
                    SKU: {product.sku}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                    {product.stockQuantity} units remaining
                  </p>

                  <button
                    onClick={() => {
                      const fullProduct = products.find(
                        (item) => item._id === product._id
                      )
                      if (fullProduct) openAdjustment(fullProduct, 'stock_in')
                    }}
                    className="shrink-0 rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-600 transition hover:bg-amber-500/20 dark:text-amber-400"
                  >
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="min-w-0 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Stock Overview
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {filteredProducts.length} products found
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
            <div className="relative min-w-0 flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className={`${inputClass} py-2.5 pl-10 sm:w-56`}
              />
            </div>

            <div className="relative min-w-0 sm:w-48">
              <SlidersHorizontal
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
              />
              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                className={`${inputClass} appearance-none py-2.5 pl-9 pr-8`}
              >
                <option value="all">All Stock</option>
                <option value="healthy">In Stock</option>
                <option value="low">Low / Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-[var(--text-muted)]">
            <LoaderCircle size={18} className="animate-spin" />
            Loading inventory...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-14 text-center text-sm text-[var(--text-muted)]">
            No products found.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--app-bg)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-4 py-4 font-medium">Product</th>
                  <th className="px-4 py-4 font-medium">SKU</th>
                  <th className="px-4 py-4 font-medium">Stock</th>
                  <th className="px-4 py-4 font-medium">Threshold</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const status = getStockStatus(product)

                  return (
                    <tr
                      key={product._id}
                      className="border-b border-[var(--border-color)] transition hover:bg-[var(--card-bg-hover)]"
                    >
                      <td className="px-4 py-4 font-medium text-[var(--text-primary)]">
                        {product.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                        {product.sku}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-[var(--text-primary)]">
                        {product.stockQuantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                        {product.lowStockThreshold}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${statusClasses(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openAdjustment(product, 'stock_in')}
                            title="Stock in"
                            aria-label={`Add stock for ${product.name}`}
                            className="rounded-lg border border-[var(--border-color)] p-2 text-emerald-600 transition hover:bg-emerald-500/10 dark:text-emerald-400"
                          >
                            <ArrowDownToLine size={16} />
                          </button>

                          <button
                            onClick={() => openAdjustment(product, 'stock_out')}
                            title="Stock out"
                            aria-label={`Remove stock for ${product.name}`}
                            className="rounded-lg border border-[var(--border-color)] p-2 text-red-600 transition hover:bg-red-500/10 dark:text-red-400"
                          >
                            <ArrowUpFromLine size={16} />
                          </button>

                          <button
                            onClick={() => openAdjustment(product, 'adjustment')}
                            title="Manual adjustment"
                            aria-label={`Adjust stock for ${product.name}`}
                            className="rounded-lg border border-[var(--border-color)] p-2 text-amber-600 transition hover:bg-amber-500/10 dark:text-amber-400"
                          >
                            <SlidersHorizontal size={16} />
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

      <div className="min-w-0 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
            <History size={21} />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              Recent Stock Movements
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Latest inventory activity (maximum 100 records)
            </p>
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-[var(--text-muted)]">
            Loading movements...
          </p>
        ) : movements.length === 0 ? (
          <p className="py-8 text-center text-sm text-[var(--text-muted)]">
            No stock movements recorded yet.
          </p>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-[var(--border-color)] bg-[var(--app-bg)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-4 py-4 font-medium">Product</th>
                  <th className="px-4 py-4 font-medium">Movement</th>
                  <th className="px-4 py-4 font-medium">Quantity</th>
                  <th className="px-4 py-4 font-medium">Previous</th>
                  <th className="px-4 py-4 font-medium">New Stock</th>
                  <th className="px-4 py-4 font-medium">Date</th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr
                    key={movement._id}
                    className="border-b border-[var(--border-color)]"
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {movement.productId?.name || 'Product unavailable'}
                      </p>
                      <p className="mt-1 text-xs text-[var(--text-muted)]">
                        {movement.productId?.sku || '—'}
                      </p>
                    </td>

                    <td className={`px-4 py-4 text-sm font-medium ${movementClasses(movement.type)}`}>
                      {movementLabel(movement.type)}
                    </td>

                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {movement.quantity}
                    </td>

                    <td className="px-4 py-4 text-sm text-[var(--text-secondary)]">
                      {movement.previousStock}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-[var(--text-primary)]">
                      {movement.newStock}
                    </td>

                    <td className="px-4 py-4 text-xs text-[var(--text-muted)]">
                      {formatDate(movement.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-5"
          onClick={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border-color)] px-4 py-5 sm:px-6">
              <div className="min-w-0">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  {formData.type === 'stock_in'
                    ? 'Stock In'
                    : formData.type === 'stock_out'
                      ? 'Stock Out'
                      : 'Manual Stock Adjustment'}
                </h2>
                <p className="mt-1 break-words text-sm text-[var(--text-muted)]">
                  {selectedProduct.name} · {selectedProduct.sku}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                aria-label="Close stock adjustment"
                className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="max-h-[calc(100vh-140px)] space-y-5 overflow-y-auto p-4 sm:p-6">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--app-bg)] p-4">
                <p className="text-sm text-[var(--text-muted)]">Current stock</p>
                <p className="mt-1 text-2xl font-bold text-[var(--text-primary)]">
                  {selectedProduct.stockQuantity} units
                </p>
              </div>

              <div>
                <label className={labelClass}>
                  Movement Type
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className={inputClass}
                >
                  <option value="stock_in">Stock In — Add units</option>
                  <option value="stock_out">Stock Out — Remove units</option>
                  <option value="adjustment">Adjustment — Set exact stock</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  {formData.type === 'adjustment'
                    ? 'New Stock Quantity'
                    : 'Quantity'}
                </label>

                <input
                  type="number"
                  name="quantity"
                  min={formData.type === 'adjustment' ? '0' : '1'}
                  step="1"
                  required
                  value={formData.quantity}
                  onChange={handleFormChange}
                  placeholder={
                    formData.type === 'adjustment'
                      ? 'Enter final stock quantity'
                      : 'Enter quantity'
                  }
                  className={inputClass}
                />

                {formData.type === 'adjustment' && (
                  <p className="mt-2 text-xs text-[var(--text-muted)]">
                    This replaces the current quantity; it is not added to it.
                  </p>
                )}
              </div>

              <div>
                <label className={labelClass}>
                  Reason {formData.type === 'adjustment' ? '*' : '(Optional)'}
                </label>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleFormChange}
                  rows={3}
                  maxLength={300}
                  required={formData.type === 'adjustment'}
                  placeholder="e.g. New supplier shipment or stock correction"
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-color)] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[var(--border-color)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
                >
                  {saving && (
                    <LoaderCircle size={16} className="animate-spin" />
                  )}
                  {saving ? 'Saving...' : 'Save Stock Movement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventoryPage
