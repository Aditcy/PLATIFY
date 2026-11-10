import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts'
import {
  IndianRupee,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  RefreshCw
} from 'lucide-react'
import toast from 'react-hot-toast'

import {
  getAnalyticsOverview,
  getRevenueAnalytics,
  getOrderAnalytics,
  getTopProductsAnalytics
} from '../../features/analytics/analyticsService'

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
})

const localDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDates = (days) => {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - (days - 1))

  return {
    from: localDate(start),
    to: localDate(end)
  }
}

const formatDate = (value) => {
  if (!value) return ''
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short'
  })
}

const statusLabel = (value) =>
  value.charAt(0).toUpperCase() + value.slice(1)

function MetricCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        <div className="rounded-xl bg-indigo-500/15 p-2.5 text-indigo-400">
          <Icon size={19} />
        </div>
      </div>
      <h3 className="mt-4 text-2xl font-bold text-white">{value}</h3>
      <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
    </div>
  )
}

function ReportsPage() {
  const { activeTenant } = useSelector((state) => state.auth)
  const tenantId = activeTenant?._id || activeTenant?.id

  const initialDates = getDates(30)

  const [range, setRange] = useState('30')
  const [from, setFrom] = useState(initialDates.from)
  const [to, setTo] = useState(initialDates.to)

  const [overview, setOverview] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [orders, setOrders] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReports = async () => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    if (!from || !to || from > to) {
      toast.error('Please select a valid date range')
      return
    }

    try {
      setLoading(true)
      setError('')

      const [
        overviewData,
        revenueData,
        orderData,
        productData
      ] = await Promise.all([
        getAnalyticsOverview(tenantId),
        getRevenueAnalytics(tenantId, from, to),
        getOrderAnalytics(tenantId),
        getTopProductsAnalytics(tenantId)
      ])

      setOverview(overviewData)
      setRevenue(revenueData || [])
      setOrders(orderData || [])
      setTopProducts(productData || [])
    } catch (err) {
      console.error('Reports loading error:', err)
      setError(
        err.response?.data?.message || 'Unable to load business reports.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [tenantId, from, to])

  const selectRange = (days) => {
    const dates = getDates(days)
    setRange(String(days))
    setFrom(dates.from)
    setTo(dates.to)
  }

  const chartRevenue = revenue.map((item) => ({
    ...item,
    label: formatDate(item.date)
  }))

  const chartOrders = orders.map((item) => ({
    ...item,
    label: statusLabel(item.status)
  }))

  const bestSeller = topProducts[0]

  if (!tenantId) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-8 text-center">
        <h2 className="text-xl font-bold text-white">Select a business</h2>
        <p className="mt-2 text-sm text-slate-400">
          Choose a business workspace to view its reports.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-indigo-400">
            BUSINESS INTELLIGENCE
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Reports & Insights
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Understand revenue, orders and product performance.
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Reports
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#0d1424] p-4 sm:flex-row sm:items-center sm:flex-wrap">
        <span className="text-sm font-medium text-slate-300">
          Revenue period
        </span>

        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => selectRange(days)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              range === String(days)
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {days} days
          </button>
        ))}

        <button
          onClick={() => setRange('custom')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            range === 'custom'
              ? 'bg-indigo-500 text-white'
              : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          Custom
        </button>

        {range === 'custom' && (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={from}
              max={to}
              onChange={(event) => setFrom(event.target.value)}
              className="rounded-lg border border-white/10 bg-[#080d19] px-3 py-2 text-sm text-white"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(event) => setTo(event.target.value)}
              className="rounded-lg border border-white/10 bg-[#080d19] px-3 py-2 text-sm text-white"
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-12 text-center text-slate-400">
          Loading business reports...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="font-medium text-red-400">{error}</p>
          <button
            onClick={loadReports}
            className="mt-3 text-sm text-white underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total Revenue"
              value={currency.format(overview?.totalRevenue || 0)}
              subtitle="Paid orders, excluding cancelled"
              icon={IndianRupee}
            />
            <MetricCard
              title="Total Orders"
              value={overview?.totalOrders || 0}
              subtitle="All order statuses"
              icon={ShoppingCart}
            />
            <MetricCard
              title="Top Product Units"
              value={bestSeller?.unitsSold || 0}
              subtitle={bestSeller?.productName || 'No sales recorded'}
              icon={Package}
            />
            <MetricCard
              title="Low Stock Products"
              value={overview?.lowStockProducts || 0}
              subtitle="Products requiring attention"
              icon={AlertTriangle}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5 xl:col-span-2">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">
                  Revenue Trends
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Daily paid revenue from {from} to {to}
                </p>
              </div>

              <div className="h-72">
                {chartRevenue.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartRevenue}>
                      <defs>
                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#ffffff12" vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#64748b"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#111827',
                          border: '1px solid #334155',
                          borderRadius: 12,
                          color: '#fff'
                        }}
                        formatter={(value) => [currency.format(value), 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#818cf8"
                        strokeWidth={3}
                        fill="url(#revenueFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No paid revenue found for this period.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
              <h2 className="text-lg font-semibold text-white">
                Order Status
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Orders grouped by current status
              </p>

              <div className="mt-6 h-64">
                {chartOrders.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartOrders} layout="vertical">
                      <CartesianGrid stroke="#ffffff12" horizontal={false} />
                      <XAxis
                        type="number"
                        stroke="#64748b"
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="label"
                        stroke="#64748b"
                        width={85}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background: '#111827',
                          border: '1px solid #334155',
                          borderRadius: 12,
                          color: '#fff'
                        }}
                      />
                      <Bar
                        dataKey="count"
                        name="Orders"
                        fill="#818cf8"
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    No orders recorded.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">
                Top-Selling Products
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Ranked by units sold across paid, non-cancelled orders.
              </p>
            </div>

            {topProducts.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                      <th className="pb-3 pr-4">Product</th>
                      <th className="pb-3 pr-4">SKU</th>
                      <th className="pb-3 pr-4">Units Sold</th>
                      <th className="pb-3 text-right">Sales Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, index) => (
                      <tr
                        key={`${product.productId}-${index}`}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="py-4 pr-4 font-medium text-white">
                          {product.productName}
                        </td>
                        <td className="py-4 pr-4 text-slate-400">
                          {product.sku || '—'}
                        </td>
                        <td className="py-4 pr-4 text-slate-300">
                          {product.unitsSold}
                        </td>
                        <td className="py-4 text-right font-medium text-emerald-400">
                          {currency.format(product.revenue || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-slate-500">
                No product sales available yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-5">
            <div className="flex items-start gap-3">
              <TrendingUp size={20} className="mt-0.5 text-indigo-400" />
              <div>
                <h3 className="font-semibold text-white">Business Insight</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {bestSeller
                    ? `${bestSeller.productName} is your current top-selling product with ${bestSeller.unitsSold} units sold and ${currency.format(bestSeller.revenue || 0)} in sales.`
                    : 'Your top-selling product insights will appear here when paid orders contain product sales.'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ReportsPage
