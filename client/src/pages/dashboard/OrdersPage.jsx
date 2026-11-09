import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Plus,
  Search,
  ShoppingBag,
  Clock,
  CheckCircle,
  IndianRupee,
  Eye,
  X,
  Trash2,
  RefreshCw,
  Package
} from 'lucide-react'
import toast from 'react-hot-toast'

import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} from '../../features/orders/orderService'

import { getProducts } from '../../features/products/productService'
import { getCustomers } from '../../features/customers/customerService'

const emptyForm = {
  customerId: '',
  customerName: '',
  customerEmail: '',
  items: [{ productId: '', quantity: 1 }],
  discount: 0,
  tax: 0,
  shippingCost: 0,
  paymentMethod: 'upi',
  paymentStatus: 'pending',
  notes: ''
}

const statusStyles = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  shipped: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
}

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0))

const formatDate = (value) => {
  if (!value) return '—'

  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function OrdersPage() {
  const { activeTenant } = useSelector((state) => state.auth)
  const tenantId = activeTenant?._id || activeTenant?.id

  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const [selectedOrder, setSelectedOrder] = useState(null)
  const [customerMode, setCustomerMode] = useState('existing')
  const [form, setForm] = useState(emptyForm)

  const loadData = async () => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const [orderData, productData, customerData] = await Promise.all([
        getOrders(tenantId),
        getProducts(tenantId),
        getCustomers(tenantId)
      ])

      setOrders(orderData || [])
      setProducts(productData || [])
      setCustomers(customerData || [])
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to load order data'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [tenantId])

  const activeProducts = useMemo(
    () => products.filter((product) => product.isActive !== false),
    [products]
  )

  const activeCustomers = useMemo(
    () => customers.filter((customer) => customer.isActive !== false),
    [customers]
  )

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase().trim()

    return orders.filter((order) => {
      const matchesSearch =
        !query ||
        order.orderNumber?.toLowerCase().includes(query) ||
        order.customerName?.toLowerCase().includes(query) ||
        order.customerEmail?.toLowerCase().includes(query)

      const matchesStatus =
        statusFilter === 'all' || order.orderStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const totalValue = orders.reduce(
    (sum, order) =>
      order.orderStatus === 'cancelled'
        ? sum
        : sum + Number(order.totalAmount || 0),
    0
  )

  const pendingCount = orders.filter(
    (order) => order.orderStatus === 'pending'
  ).length

  const processingCount = orders.filter(
    (order) => order.orderStatus === 'processing'
  ).length

  const deliveredCount = orders.filter(
    (order) => order.orderStatus === 'delivered'
  ).length

  const estimatedSubtotal = form.items.reduce((sum, item) => {
    const product = activeProducts.find(
      (entry) => entry._id === item.productId
    )

    return sum + Number(product?.price || 0) * Number(item.quantity || 0)
  }, 0)

  const estimatedTotal =
    estimatedSubtotal -
    Number(form.discount || 0) +
    Number(form.tax || 0) +
    Number(form.shippingCost || 0)

  const updateForm = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }))
  }

  const updateItem = (index, field, value) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.map((item, itemIndex) =>
        itemIndex === index
          ? { ...item, [field]: value }
          : item
      )
    }))
  }

  const addItem = () => {
    setForm((previous) => ({
      ...previous,
      items: [...previous.items, { productId: '', quantity: 1 }]
    }))
  }

  const removeItem = (index) => {
    setForm((previous) => ({
      ...previous,
      items: previous.items.filter((_, itemIndex) => itemIndex !== index)
    }))
  }

  const openCreateForm = () => {
    setForm(emptyForm)
    setCustomerMode(activeCustomers.length > 0 ? 'existing' : 'manual')
    setShowForm(true)
  }

  const handleCreateOrder = async (event) => {
    event.preventDefault()

    if (!form.items.length || form.items.some((item) => !item.productId)) {
      toast.error('Please select at least one product')
      return
    }

    if (form.items.some((item) => Number(item.quantity) < 1)) {
      toast.error('Product quantity must be at least 1')
      return
    }

    if (customerMode === 'existing' && !form.customerId) {
      toast.error('Please select a customer')
      return
    }

    if (customerMode === 'manual' && !form.customerName.trim()) {
      toast.error('Please enter the customer name')
      return
    }

    if (Number(form.discount) < 0 ||
        Number(form.tax) < 0 ||
        Number(form.shippingCost) < 0) {
      toast.error('Discount, tax and shipping cannot be negative')
      return
    }

    const payload = {
      items: form.items.map((item) => ({
        productId: item.productId,
        quantity: Number(item.quantity)
      })),
      discount: Number(form.discount || 0),
      tax: Number(form.tax || 0),
      shippingCost: Number(form.shippingCost || 0),
      paymentMethod: form.paymentMethod,
      paymentStatus: form.paymentStatus,
      notes: form.notes
    }

    if (customerMode === 'existing') {
      payload.customerId = form.customerId
    } else {
      payload.customerName = form.customerName.trim()
      payload.customerEmail = form.customerEmail.trim()
    }

    try {
      setSaving(true)

      await createOrder(tenantId, payload)

      toast.success('Order created successfully')
      setShowForm(false)
      setForm(emptyForm)

      await loadData()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to create order'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleViewOrder = async (orderId) => {
    try {
      const order = await getOrderById(tenantId, orderId)
      setSelectedOrder(order)
      setShowDetails(true)
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to load order details'
      )
    }
  }

  const handleStatusUpdate = async (order, nextStatus) => {
    if (
      nextStatus === 'cancelled' &&
      !window.confirm(
        `Cancel order ${order.orderNumber}? The product stock will be restored.`
      )
    ) {
      return
    }

    try {
      await updateOrderStatus(tenantId, order._id, {
        orderStatus: nextStatus
      })

      toast.success(`Order ${nextStatus} successfully`)

      if (selectedOrder?._id === order._id) {
        setSelectedOrder((previous) => ({
          ...previous,
          orderStatus: nextStatus
        }))
      }

      await loadData()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to update order status'
      )
    }
  }

  const getNextStatus = (status) => {
    const nextStatuses = {
      pending: 'processing',
      processing: 'shipped',
      shipped: 'delivered'
    }

    return nextStatuses[status]
  }

  const inputClass =
    'w-full rounded-xl border border-white/10 bg-[#080d19] px-3 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500'

  const labelClass = 'mb-1.5 block text-sm font-medium text-slate-300'

  return (
    <div className="space-y-6 text-white">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-indigo-400">SALES MANAGEMENT</p>
          <h1 className="mt-1 text-2xl font-bold">Orders</h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage customer orders, payments and fulfilment.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            onClick={openCreateForm}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium hover:bg-indigo-500"
          >
            <Plus size={17} />
            Create Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total Orders',
            value: orders.length,
            icon: ShoppingBag,
            color: 'text-indigo-400'
          },
          {
            label: 'Pending Orders',
            value: pendingCount,
            icon: Clock,
            color: 'text-amber-400'
          },
          {
            label: 'Processing Orders',
            value: processingCount,
            icon: Package,
            color: 'text-blue-400'
          },
          {
            label: 'Order Value',
            value: formatCurrency(totalValue),
            icon: IndianRupee,
            color: 'text-emerald-400'
          }
        ].map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/10 bg-[#0d1424] p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <Icon size={19} className={stat.color} />
              </div>
              <h2 className="mt-3 text-2xl font-bold">{stat.value}</h2>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order number or customer..."
              className={`${inputClass} pl-10`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className={`${inputClass} sm:w-52`}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold">Order History</h2>
          <span className="text-xs text-slate-500">
            {filteredOrders.length} orders found
          </span>
        </div>

        {loading ? (
          <div className="py-14 text-center text-sm text-slate-400">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-14 text-center">
            <ShoppingBag
              size={36}
              className="mx-auto mb-3 text-slate-600"
            />
            <p className="font-medium text-slate-300">No orders found</p>
            <p className="mt-1 text-sm text-slate-500">
              Create an order or adjust your search filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase text-slate-500">
                  <th className="px-3 py-3 font-medium">Order</th>
                  <th className="px-3 py-3 font-medium">Customer</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                  <th className="px-3 py-3 font-medium">Payment</th>
                  <th className="px-3 py-3 font-medium">Total</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-3 py-4 font-medium text-white">
                      {order.orderNumber}
                    </td>

                    <td className="px-3 py-4">
                      <p className="text-slate-200">
                        {order.customerName || order.customerId?.name || 'Guest'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.customerEmail || order.customerId?.email || '—'}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-slate-400">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-3 py-4">
                      <p className="capitalize text-slate-300">
                        {order.paymentMethod}
                      </p>
                      <p className="mt-1 text-xs capitalize text-slate-500">
                        {order.paymentStatus}
                      </p>
                    </td>

                    <td className="px-3 py-4 font-medium">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td className="px-3 py-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-1 text-xs capitalize ${
                          statusStyles[order.orderStatus] || statusStyles.pending
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="px-3 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewOrder(order._id)}
                          title="View order"
                          className="rounded-lg border border-white/10 p-2 text-slate-400 hover:bg-white/5 hover:text-white"
                        >
                          <Eye size={16} />
                        </button>

                        {getNextStatus(order.orderStatus) && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(
                                order,
                                getNextStatus(order.orderStatus)
                              )
                            }
                            title={`Mark as ${getNextStatus(order.orderStatus)}`}
                            className="rounded-lg border border-indigo-500/20 p-2 text-indigo-400 hover:bg-indigo-500/10"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}

                        {['pending', 'processing'].includes(order.orderStatus) && (
                          <button
                            onClick={() =>
                              handleStatusUpdate(order, 'cancelled')
                            }
                            title="Cancel order"
                            className="rounded-lg border border-red-500/20 p-2 text-red-400 hover:bg-red-500/10"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1424] p-5 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Create Order</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Add customer and product details.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-5">
              <div>
                <label className={labelClass}>Customer Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomerMode('existing')}
                    disabled={activeCustomers.length === 0}
                    className={`rounded-xl border px-4 py-2 text-sm ${
                      customerMode === 'existing'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-white/10 text-slate-400'
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    Existing Customer
                  </button>

                  <button
                    type="button"
                    onClick={() => setCustomerMode('manual')}
                    className={`rounded-xl border px-4 py-2 text-sm ${
                      customerMode === 'manual'
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-white/10 text-slate-400'
                    }`}
                  >
                    Manual Customer
                  </button>
                </div>
              </div>

              {customerMode === 'existing' ? (
                <div>
                  <label className={labelClass}>Select Customer *</label>
                  <select
                    value={form.customerId}
                    onChange={(event) =>
                      updateForm('customerId', event.target.value)
                    }
                    className={inputClass}
                    required
                  >
                    <option value="">Choose a customer</option>
                    {activeCustomers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} {customer.email ? `— ${customer.email}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Customer Name *</label>
                    <input
                      value={form.customerName}
                      onChange={(event) =>
                        updateForm('customerName', event.target.value)
                      }
                      className={inputClass}
                      placeholder="Enter customer name"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Customer Email</label>
                    <input
                      type="email"
                      value={form.customerEmail}
                      onChange={(event) =>
                        updateForm('customerEmail', event.target.value)
                      }
                      className={inputClass}
                      placeholder="customer@example.com"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-300">
                    Order Items *
                  </label>

                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1 text-sm text-indigo-400 hover:text-indigo-300"
                  >
                    <Plus size={15} />
                    Add Product
                  </button>
                </div>

                <div className="space-y-3">
                  {form.items.map((item, index) => {
                    const selectedProduct = activeProducts.find(
                      (product) => product._id === item.productId
                    )

                    return (
                      <div
                        key={index}
                        className="grid grid-cols-1 gap-3 rounded-xl border border-white/10 bg-[#080d19] p-3 sm:grid-cols-[1fr_110px_100px_36px] sm:items-end"
                      >
                        <div>
                          <label className={labelClass}>Product</label>
                          <select
                            value={item.productId}
                            onChange={(event) =>
                              updateItem(index, 'productId', event.target.value)
                            }
                            className={inputClass}
                            required
                          >
                            <option value="">Select product</option>
                            {activeProducts.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name} — {formatCurrency(product.price)}
                              </option>
                            ))}
                          </select>

                          {selectedProduct && (
                            <p className="mt-1 text-xs text-slate-500">
                              Available stock: {selectedProduct.stockQuantity ?? '—'}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className={labelClass}>Quantity</label>
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.quantity}
                            onChange={(event) =>
                              updateItem(index, 'quantity', event.target.value)
                            }
                            className={inputClass}
                            required
                          />
                        </div>

                        <div>
                          <label className={labelClass}>Subtotal</label>
                          <p className="rounded-xl border border-white/10 px-3 py-2.5 text-sm text-slate-300">
                            {formatCurrency(
                              Number(selectedProduct?.price || 0) *
                              Number(item.quantity || 0)
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          disabled={form.items.length === 1}
                          className="flex h-10 items-center justify-center rounded-lg text-red-400 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                          title="Remove item"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {activeProducts.length === 0 && (
                  <p className="mt-2 text-sm text-amber-400">
                    No active products are available. Add a product before creating an order.
                  </p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className={labelClass}>Discount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.discount}
                    onChange={(event) =>
                      updateForm('discount', event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Tax (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.tax}
                    onChange={(event) =>
                      updateForm('tax', event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Shipping (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.shippingCost}
                    onChange={(event) =>
                      updateForm('shippingCost', event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(event) =>
                      updateForm('paymentMethod', event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="online">Online</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Payment Status</label>
                  <select
                    value={form.paymentStatus}
                    onChange={(event) =>
                      updateForm('paymentStatus', event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Order Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(event) => updateForm('notes', event.target.value)}
                  className={inputClass}
                  rows={3}
                  placeholder="Optional order notes..."
                />
              </div>

              <div className="rounded-xl border border-white/10 bg-[#080d19] p-4">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Estimated Subtotal</span>
                  <span>{formatCurrency(estimatedSubtotal)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-slate-400">
                  <span>Discount</span>
                  <span>- {formatCurrency(form.discount)}</span>
                </div>
                <div className="mt-2 flex justify-between text-sm text-slate-400">
                  <span>Tax + Shipping</span>
                  <span>
                    {formatCurrency(
                      Number(form.tax || 0) + Number(form.shippingCost || 0)
                    )}
                  </span>
                </div>
                <div className="mt-3 flex justify-between border-t border-white/10 pt-3 font-semibold">
                  <span>Estimated Total</span>
                  <span className="text-indigo-400">
                    {formatCurrency(estimatedTotal)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Final pricing and stock availability are validated by the server.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || activeProducts.length === 0}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/10 bg-[#0d1424] p-5 sm:p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs text-indigo-400">ORDER DETAILS</p>
                <h2 className="mt-1 text-xl font-bold">
                  {selectedOrder.orderNumber}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Created {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-[#080d19] p-4">
                <p className="text-xs text-slate-500">Customer</p>
                <p className="mt-2 font-medium">
                  {selectedOrder.customerName ||
                    selectedOrder.customerId?.name ||
                    'Guest'}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedOrder.customerEmail ||
                    selectedOrder.customerId?.email ||
                    'No email'}
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#080d19] p-4">
                <p className="text-xs text-slate-500">Payment</p>
                <p className="mt-2 font-medium capitalize">
                  {selectedOrder.paymentMethod}
                </p>
                <p className="mt-1 text-sm capitalize text-slate-400">
                  {selectedOrder.paymentStatus}
                </p>
              </div>
            </div>

            <div className="mt-5">
              <h3 className="mb-3 font-semibold">Order Items</h3>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full min-w-[400px] text-sm">
                  <thead className="bg-[#080d19] text-xs text-slate-500">
                    <tr>
                      <th className="px-3 py-3 text-left">Product</th>
                      <th className="px-3 py-3 text-center">Quantity</th>
                      <th className="px-3 py-3 text-right">Price</th>
                      <th className="px-3 py-3 text-right">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {(selectedOrder.items || []).map((item, index) => (
                      <tr
                        key={item._id || index}
                        className="border-t border-white/5"
                      >
                        <td className="px-3 py-3">
                          <p className="font-medium text-slate-200">
                            {item.productName || 'Product'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.sku || ''}
                          </p>
                        </td>
                        <td className="px-3 py-3 text-center text-slate-300">
                          {item.quantity}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-300">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-3 py-3 text-right text-slate-300">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-xl border border-white/10 bg-[#080d19] p-4 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Discount</span>
                <span>- {formatCurrency(selectedOrder.discount)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Tax</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping</span>
                <span>{formatCurrency(selectedOrder.shippingCost)}</span>
              </div>
              <div className="flex justify-between border-t border-white/10 pt-3 text-base font-bold">
                <span>Total Amount</span>
                <span className="text-indigo-400">
                  {formatCurrency(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="mt-4 rounded-xl border border-white/10 p-4">
                <p className="text-xs text-slate-500">Order Notes</p>
                <p className="mt-2 text-sm text-slate-300">
                  {selectedOrder.notes}
                </p>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
              <span
                className={`rounded-full border px-3 py-1.5 text-xs capitalize ${
                  statusStyles[selectedOrder.orderStatus] || statusStyles.pending
                }`}
              >
                {selectedOrder.orderStatus}
              </span>

              <div className="flex flex-wrap gap-2">
                {getNextStatus(selectedOrder.orderStatus) && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        selectedOrder,
                        getNextStatus(selectedOrder.orderStatus)
                      )
                    }
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm hover:bg-indigo-500"
                  >
                    Mark {getNextStatus(selectedOrder.orderStatus)}
                  </button>
                )}

                {['pending', 'processing'].includes(selectedOrder.orderStatus) && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedOrder, 'cancelled')
                    }
                    className="rounded-xl border border-red-500/20 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrdersPage