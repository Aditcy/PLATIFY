
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

import { useTheme } from '../../context/ThemeContext'

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
    <div className="min-w-0 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[var(--text-muted)]">{title}</p>
        <div className="rounded-xl bg-[var(--accent-soft)] p-2.5 text-[var(--accent)]">
          <Icon size={19} />
        </div>
      </div>
      <h3 className="mt-4 break-words text-2xl font-bold text-[var(--text-primary)]">
        {value}
      </h3>
      <p className="mt-1 break-words text-xs text-[var(--text-muted)]">{subtitle}</p>
    </div>
  )
}

function ReportsPage() {
  const { activeTenant } = useSelector((state) => state.auth)
  const tenantId = activeTenant?._id || activeTenant?.id
  const { theme } = useTheme()

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

  const chartGrid = theme === 'light' ? '#c5e3f7' : '#263247'
  const chartAxis = theme === 'light' ? '#64839c' : '#94a3b8'
  const chartAccent = theme === 'light' ? '#168bd4' : '#818cf8'

  const tooltipStyle = {
    backgroundColor: theme === 'light' ? '#ffffff' : '#111c30',
    border: `1px solid ${theme === 'light' ? '#c5e3f7' : '#334155'}`,
    borderRadius: 12,
    color: theme === 'light' ? '#12304a' : '#f8fafc'
  }

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

  const cardClass =
    'rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)]'

  const inputClass =
    'min-w-0 rounded-lg border border-[var(--border-color)] bg-[var(--app-bg)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]'

  if (!tenantId) {
    return (
      <div className={`${cardClass} p-8 text-center`}>
        <h2 className="text-xl font-bold text-[var(--text-primary)]">
          Select a business
        </h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Choose a business workspace to view its reports.
        </p>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div className="min-w-0">
          <p className="text-sm font-medium text-[var(--accent)]">
            BUSINESS INTELLIGENCE
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Reports & Insights
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Understand revenue, orders and product performance.
          </p>
        </div>

        <button
          onClick={loadReports}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)] disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh Reports
        </button>
      </div>

      <div className={`${cardClass} flex flex-col gap-3 p-4 sm:flex-row sm:flex-wrap sm:items-center`}>
        <span className="text-sm font-medium text-[var(--text-secondary)]">
          Revenue period
        </span>

        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => selectRange(days)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              range === String(days)
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--app-bg)] text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)]'
            }`}
          >
            {days} days
          </button>
        ))}

        <button
          onClick={() => setRange('custom')}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
            range === 'custom'
              ? 'bg-[var(--accent)] text-white'
              : 'bg-[var(--app-bg)] text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)]'
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
              className={inputClass}
            />
            <span className="text-[var(--text-muted)]">to</span>
            <input
              type="date"
              value={to}
              min={from}
              onChange={(event) => setTo(event.target.value)}
              className={inputClass}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className={`${cardClass} p-12 text-center text-[var(--text-muted)]`}>
          Loading business reports...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <p className="font-medium text-red-500">{error}</p>
          <button
            onClick={loadReports}
            className="mt-3 text-sm text-[var(--text-primary)] underline"
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

          <div className="grid min-w-0 gap-6 xl:grid-cols-3">
            <div className={`${cardClass} min-w-0 p-4 sm:p-5 xl:col-span-2`}>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Revenue Trends
                </h2>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Daily paid revenue from {from} to {to}
                </p>
              </div>

              <div className="h-72 min-w-0">
                {chartRevenue.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartRevenue}>
                      <defs>
                        <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartAccent} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={chartAccent} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke={chartGrid} vertical={false} />
                      <XAxis
                        dataKey="label"
                        stroke={chartAxis}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke={chartAxis}
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(value) => [currency.format(value), 'Revenue']}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={chartAccent}
                        strokeWidth={3}
                        fill="url(#revenueFill)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-sm text-[var(--text-muted)]">
                    No paid revenue found for this period.
                  </div>
                )}
              </div>
            </div>

            <div className={`${cardClass} min-w-0 p-4 sm:p-5`}>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Order Status
              </h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Orders grouped by current status
              </p>

              <div className="mt-6 h-64 min-w-0">
                {chartOrders.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartOrders} layout="vertical">
                      <CartesianGrid stroke={chartGrid} horizontal={false} />
                      <XAxis
                        type="number"
                        stroke={chartAxis}
                        tick={{ fontSize: 11 }}
                        allowDecimals={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="label"
                        stroke={chartAxis}
                        width={85}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                      />
                      <Bar
                        dataKey="count"
                        name="Orders"
                        fill={chartAccent}
                        radius={[0, 6, 6, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-center text-sm text-[var(--text-muted)]">
                    No orders recorded.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={`${cardClass} min-w-0 p-4 sm:p-5`}>
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                Top-Selling Products
              </h2>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Ranked by units sold across paid, non-cancelled orders.
              </p>
            </div>

            {topProducts.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border-color)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
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
                        className="border-b border-[var(--border-color)]/60 last:border-0"
                      >
                        <td className="py-4 pr-4 font-medium text-[var(--text-primary)]">
                          {product.productName}
                        </td>
                        <td className="py-4 pr-4 text-[var(--text-muted)]">
                          {product.sku || '—'}
                        </td>
                        <td className="py-4 pr-4 text-[var(--text-secondary)]">
                          {product.unitsSold}
                        </td>
                        <td className="py-4 text-right font-medium text-emerald-500">
                          {currency.format(product.revenue || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-[var(--text-muted)]">
                No product sales available yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent-soft)] p-5">
            <div className="flex items-start gap-3">
              <TrendingUp size={20} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--text-primary)]">
                  Business Insight
                </h3>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
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
