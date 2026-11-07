import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  ArrowDownRight,
  IndianRupee,
  ShoppingBag,
  Users,
  Package,
  Clock3,
  Plus
} from 'lucide-react'

const stats = [
  {
    title: 'Total Revenue',
    value: '₹0',
    change: 'Sales overview',
    icon: IndianRupee,
    color: 'indigo'
  },
  {
    title: 'Total Orders',
    value: '0',
    change: 'Orders received',
    icon: ShoppingBag,
    color: 'blue'
  },
  {
    title: 'Total Customers',
    value: '0',
    change: 'Customer base',
    icon: Users,
    color: 'violet'
  },
  {
    title: 'Total Products',
    value: '0',
    change: 'Products listed',
    icon: Package,
    color: 'emerald'
  }
]

const activities = [
  {
    title: 'Dashboard initialized',
    description: 'Your business workspace is ready.',
    time: 'Just now'
  },
  {
    title: 'Connect your operations',
    description: 'Start by adding products and categories.',
    time: 'Getting started'
  },
  {
    title: 'Monitor your business',
    description: 'Sales and order insights will appear here.',
    time: 'Coming soon'
  }
]

function DashboardPage() {
  return (
    <div className="space-y-8">

      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

        <div>
          <p className="text-sm text-indigo-400">OVERVIEW</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Here's what's happening with your business.
          </p>
        </div>

        <Link to="/dashboard/products" className="flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400">
        <Plus size={18} />Add Product</Link>

      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-white/10 bg-[#0d1424] p-6 transition hover:border-indigo-500/30"
            >

              <div className="flex items-center justify-between">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                  <Icon size={22} />
                </div>

                <ArrowUpRight size={18} className="text-slate-600" />

              </div>

              <p className="mt-6 text-sm text-slate-400">
                {stat.title}
              </p>

              <h2 className="mt-2 text-3xl font-bold text-white">
                {stat.value}
              </h2>

              <p className="mt-2 text-xs text-slate-500">
                {stat.change}
              </p>

            </div>
          )
        })}

      </section>

      <section className="grid gap-6 xl:grid-cols-3">

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-6 xl:col-span-2">

          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-white">
                Revenue Overview
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Sales performance will appear here
              </p>
            </div>

            <span className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400">
              Last 30 days
            </span>
          </div>

          <div className="mt-8 flex h-56 flex-col items-center justify-center rounded-xl border border-dashed border-white/10">

            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
              <IndianRupee size={23} />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-300">
              No sales data yet
            </p>

            <p className="mt-2 text-xs text-slate-500">
              Revenue analytics will update as orders are completed.
            </p>

          </div>

        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-6">

          <div className="flex items-center gap-2">
            <Clock3 size={18} className="text-indigo-400" />
            <h2 className="font-semibold text-white">
              Recent Activity
            </h2>
          </div>

          <div className="mt-6 space-y-6">

            {activities.map((activity, index) => (
              <div key={activity.title} className="flex gap-3">

                <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-400" />

                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {activity.title}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {activity.description}
                  </p>

                  <p className="mt-2 text-[10px] text-slate-600">
                    {activity.time}
                  </p>
                </div>

              </div>
            ))}

          </div>

        </div>

      </section>

      <section className="rounded-2xl border border-white/10 bg-gradient-to-r from-indigo-500/10 to-blue-500/5 p-6">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>
            <p className="text-sm font-semibold text-indigo-300">
              GETTING STARTED
            </p>

            <h2 className="mt-2 text-xl font-bold text-white">
              Build your retail workspace
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Add your products, organize inventory and start managing orders.
            </p>
          </div>

          <Package size={42} className="text-indigo-400" />

        </div>

      </section>

    </div>
  )
}

export default DashboardPage
