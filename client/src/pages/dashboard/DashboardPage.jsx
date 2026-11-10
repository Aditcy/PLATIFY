
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Activity,
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts'

import {
  getAnalyticsOverview,
  getRevenueAnalytics,
  getOrderAnalytics
} from '../../features/analytics/analyticsService'

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
})

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-muted)]">{title}</p>
        <div className="rounded-xl bg-[var(--accent-soft)] p-3">
          <Icon size={19} className="text-[var(--accent)]" />
        </div>
      </div>

      <h2 className="mt-5 break-words text-2xl font-bold text-[var(--text-primary)]">
        {value}
      </h2>

      <p className="mt-2 text-xs text-[var(--text-muted)]">
        {description}
      </p>
    </div>
  )
}

function DashboardPage() {
  const activeTenant = useSelector(
    (state) => state.auth.activeTenant
  )

  const tenantId = activeTenant?._id || activeTenant?.id

  const [overview, setOverview] = useState(null)
  const [revenue, setRevenue] = useState([])
  const [orders, setOrders] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAnalytics = async () => {
    if (!tenantId) {
      setError('Please select a business to view its analytics.')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError('')

      const [overviewData, revenueData, orderData] =
        await Promise.all([
          getAnalyticsOverview(tenantId),
          getRevenueAnalytics(tenantId),
          getOrderAnalytics(tenantId)
        ])

      setOverview(overviewData)
      setRevenue(revenueData || [])
      setOrders(orderData || [])
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Unable to load business analytics.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [tenantId])

  const totalRevenue = overview?.totalRevenue || 0
  const totalOrders = overview?.totalOrders || 0
  const totalCustomers = overview?.totalCustomers || 0
  const totalProducts = overview?.totalProducts || 0
  const lowStockProducts = overview?.lowStockProducts || 0

  if (loading) {
    return (
      <div className="flex min-h-[350px] items-center justify-center">
        <div className="text-center">
          <RefreshCw className="mx-auto animate-spin text-[var(--accent)]" size={30} />
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            Loading business analytics...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-8">

      <div className="flex flex-col flex-wrap items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--accent)]">
            BUSINESS OVERVIEW
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[var(--text-primary)] sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Here's an overview of your business performance.
          </p>
        </div>

        <button
          onClick={loadAnalytics}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)] sm:w-auto"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={currencyFormatter.format(totalRevenue)}
          icon={IndianRupee}
          description="Paid orders excluding cancellations"
        />

        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={ShoppingBag}
          description="All recorded orders"
        />

        <StatCard
          title="Total Customers"
          value={totalCustomers}
          icon={Users}
          description="Active business customers"
        />

        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={Package}
          description="Active products in your catalog"
        />
      </div>

      <div className="grid min-w-0 gap-6 xl:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 shadow-sm sm:p-5">
          <div className="mb-6">
            <h2 className="font-semibold text-[var(--text-primary)]">
              Revenue Overview
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Daily revenue for the last 30 days
            </p>
          </div>

          {revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#168bd4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#168bd4" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-color)"
                />

                <XAxis
                  dataKey="date"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => value.slice(5)}
                />

                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value) => `₹${value}`}
                  width={55}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                  formatter={(value) => [
                    currencyFormatter.format(value),
                    'Revenue'
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#168bd4"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-center">
              <div>
                <Activity size={30} className="mx-auto text-[var(--text-muted)]" />
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  No revenue data available yet.
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Revenue will appear when paid orders are recorded.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-4 shadow-sm sm:p-5">
          <div className="mb-6">
            <h2 className="font-semibold text-[var(--text-primary)]">
              Order Statistics
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Orders grouped by their current status
            </p>
          </div>

          {orders.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={orders}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border-color)"
                />

                <XAxis
                  dataKey="status"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 11 }}
                />

                <YAxis
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                  width={35}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)'
                  }}
                  labelStyle={{ color: 'var(--text-primary)' }}
                />

                <Bar
                  dataKey="count"
                  fill="#168bd4"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[280px] items-center justify-center text-center">
              <div>
                <ShoppingBag size={30} className="mx-auto text-[var(--text-muted)]" />
                <p className="mt-3 text-sm text-[var(--text-secondary)]">
                  No order statistics available yet.
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  Your order chart will appear when orders are created.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500/10 p-3">
              <AlertTriangle className="text-amber-500" size={20} />
            </div>

            <div className="min-w-0">
              <h2 className="font-semibold text-[var(--text-primary)]">
                Low Stock Alerts
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Products at or below their stock threshold
              </p>
            </div>
          </div>

          <p className="mt-5 text-3xl font-bold text-[var(--text-primary)]">
            {lowStockProducts}
          </p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Products requiring stock attention
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm">
          <h2 className="font-semibold text-[var(--text-primary)]">
            Order Status Summary
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
            {Object.entries(overview?.orderStatuses || {}).map(
              ([status, count]) => (
                <div
                  key={status}
                  className="rounded-xl border border-[var(--border-color)] bg-[var(--app-bg)] p-3"
                >
                  <p className="break-words text-xs capitalize text-[var(--text-muted)]">
                    {status}
                  </p>
                  <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
                    {count}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
