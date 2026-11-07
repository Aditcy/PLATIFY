
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
      return 'bg-emerald-500/10 text-emerald-400'
    }

    if (status === 'Low Stock') {
      return 'bg-amber-500/10 text-amber-400'
    }

    return 'bg-red-500/10 text-red-400'
  }

  const movementLabel = (type) => {
    if (type === 'stock_in') return 'Stock In'
    if (type === 'stock_out') return 'Stock Out'
    return 'Adjustment'
  }

  const movementClasses = (type) => {
    if (type === 'stock_in') return 'text-emerald-400'
    if (type === 'stock_out') return 'text-red-400'
    return 'text-amber-400'
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Inventory Management
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Inventory
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Monitor stock levels and manage inventory movements.
          </p>
        </div>

        <button
          onClick={() => loadInventory(true)}
          disabled={refreshing || loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0d1424] px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
        >
          <RefreshCw
            size={17}
            className={refreshing ? 'animate-spin' : ''}
          />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Products</p>
            <Package className="text-indigo-400" size={21} />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">
            {summary.totalProducts}
          </p>
          <p className="mt-2 text-xs text-slate-500">Active products</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Total Units</p>
            <Boxes className="text-blue-400" size={21} />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">
            {summary.totalUnits}
          </p>
          <p className="mt-2 text-xs text-slate-500">Units in stock</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Low Stock Products</p>
            <AlertTriangle className="text-amber-400" size={21} />
          </div>
          <p className="mt-3 text-3xl font-bold text-white">
            {summary.lowStockCount}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            At or below stock threshold
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Inventory Cost Value</p>
            <IndianRupee className="text-emerald-400" size={21} />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">
            {formatPrice(summary.inventoryCostValue)}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Stock quantity × cost price
          </p>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
          <div className="mb-4 flex items-center gap-2">
            <AlertTriangle size={19} className="text-amber-400" />
            <h2 className="font-semibold text-white">Low Stock Alerts</h2>
          </div>

          <div className="space-y-3">
            {lowStockProducts.map((product) => (
              <div
                key={product._id}
                className="flex flex-col justify-between gap-3 rounded-xl border border-white/5 bg-[#0d1424] p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <p className="font-medium text-white">{product.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    SKU: {product.sku}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <p className="text-sm text-amber-400">
                    {product.stockQuantity} units remaining
                  </p>

                  <button
                    onClick={() => {
                      const fullProduct = products.find(
                        (item) => item._id === product._id
                      )
                      if (fullProduct) openAdjustment(fullProduct, 'stock_in')
                    }}
                    className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 hover:bg-amber-500/20"
                  >
                    Restock
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5 sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Stock Overview
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {filteredProducts.length} products found
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search products..."
                className="w-full rounded-xl border border-white/10 bg-[#080e1b] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500 sm:w-56"
              />
            </div>

            <div className="relative">
              <SlidersHorizontal
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <select
                value={stockFilter}
                onChange={(event) => setStockFilter(event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#080e1b] py-2.5 pl-9 pr-8 text-sm text-slate-300 outline-none focus:border-indigo-500 sm:w-44"
              >
                <option value="all">All Stock</option>
                <option value="healthy">In Stock</option>
                <option value="low">Low / Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
            <LoaderCircle size={18} className="animate-spin" />
            Loading inventory...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-14 text-center text-sm text-slate-400">
            No products found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
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
                      className="border-b border-white/5 hover:bg-white/[0.02]"
                    >
                      <td className="px-4 py-4 font-medium text-white">
                        {product.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-400">
                        {product.sku}
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-white">
                        {product.stockQuantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-400">
                        {product.lowStockThreshold}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusClasses(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openAdjustment(product, 'stock_in')}
                            title="Stock in"
                            className="rounded-lg border border-white/10 p-2 text-emerald-400 hover:bg-emerald-500/10"
                          >
                            <ArrowDownToLine size={16} />
                          </button>

                          <button
                            onClick={() => openAdjustment(product, 'stock_out')}
                            title="Stock out"
                            className="rounded-lg border border-white/10 p-2 text-red-400 hover:bg-red-500/10"
                          >
                            <ArrowUpFromLine size={16} />
                          </button>

                          <button
                            onClick={() => openAdjustment(product, 'adjustment')}
                            title="Manual adjustment"
                            className="rounded-lg border border-white/10 p-2 text-amber-400 hover:bg-amber-500/10"
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

      <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
            <History size={21} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Recent Stock Movements
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Latest inventory activity (maximum 100 records)
            </p>
          </div>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-400">
            Loading movements...
          </p>
        ) : movements.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">
            No stock movements recorded yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
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
                    className="border-b border-white/5"
                  >
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-white">
                        {movement.productId?.name || 'Product unavailable'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {movement.productId?.sku || '—'}
                      </p>
                    </td>

                    <td className={`px-4 py-4 text-sm font-medium ${movementClasses(movement.type)}`}>
                      {movementLabel(movement.type)}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-300">
                      {movement.quantity}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-400">
                      {movement.previousStock}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-white">
                      {movement.newStock}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-400">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1424] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {formData.type === 'stock_in'
                    ? 'Stock In'
                    : formData.type === 'stock_out'
                      ? 'Stock Out'
                      : 'Manual Stock Adjustment'}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedProduct.name} · {selectedProduct.sku}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div className="rounded-xl border border-white/5 bg-[#080e1b] p-4">
                <p className="text-sm text-slate-400">Current stock</p>
                <p className="mt-1 text-2xl font-bold text-white">
                  {selectedProduct.stockQuantity} units
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Movement Type
                </label>

                <select
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  className="w-full rounded-xl border border-white/10 bg-[#080e1b] px-4 py-3 text-sm text-white outline-none focus:border-indigo-500"
                >
                  <option value="stock_in">Stock In — Add units</option>
                  <option value="stock_out">Stock Out — Remove units</option>
                  <option value="adjustment">Adjustment — Set exact stock</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
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
                  className="w-full rounded-xl border border-white/10 bg-[#080e1b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                />

                {formData.type === 'adjustment' && (
                  <p className="mt-2 text-xs text-slate-500">
                    This replaces the current quantity; it is not added to it.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
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
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#080e1b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
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
