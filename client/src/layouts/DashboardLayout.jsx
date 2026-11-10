
import { useState } from 'react'
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingCart,
  Users,
  ChartNoAxesCombined,
  Settings,
  Menu,
  X,
  Store,
  ChevronDown,
  LogOut,
  Bell
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'

const navigation = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', path: '/dashboard/products', icon: Package },
  { name: 'Categories', path: '/dashboard/categories', icon: Tags },
  { name: 'Inventory', path: '/dashboard/inventory', icon: Boxes },
  { name: 'Orders', path: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Customers', path: '/dashboard/customers', icon: Users },
  { name: 'Reports & Insights', path: '/dashboard/analytics', icon: ChartNoAxesCombined }
]

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, activeTenant } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100">

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-[#0d1424] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">

          <div>
            <h1 className="text-2xl font-black tracking-[0.18em] text-white">
              PLATIFY
            </h1>
            <p className="mt-1 text-[10px] tracking-[0.2em] text-slate-500">
              RETAIL MANAGEMENT
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-slate-400 lg:hidden"
          >
            <X size={21} />
          </button>

        </div>

        <div className="border-b border-white/10 p-4">
        <button onClick={() => navigate('/businesses')} className="flex w-full items-center gap-3 rounded-xl bg-white/5 p-3 text-left transition hover:bg-white/10">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
      <Store size={20} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="truncate text-sm font-semibold text-white">
        {activeTenant?.name || 'Your Business'}
      </p>
      <p className="text-xs text-slate-500">Switch Business</p>
    </div>

    <ChevronDown size={16} className="text-slate-500" />
    </button>
    </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">

          <p className="mb-4 px-3 text-[10px] font-bold tracking-[0.2em] text-slate-500">
            WORKSPACE
          </p>

          {navigation.map((item) => {
            const Icon = item.icon

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <Icon size={19} />
                {item.name}
              </NavLink>
            )
          })}

          <div className="!mt-8 border-t border-white/10 pt-6">

            <p className="mb-4 px-3 text-[10px] font-bold tracking-[0.2em] text-slate-500">
              PREFERENCES
            </p>

            <NavLink
              to="/dashboard/settings"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Settings size={19} />
              Settings
            </NavLink>

          </div>

        </nav>

        <div className="border-t border-white/10 p-4">

          <div className="flex items-center gap-3 rounded-xl p-2">

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-500/20 font-bold text-indigo-400">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || 'User'}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || 'Account'}
              </p>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={18} />
            </button>

          </div>

        </div>

      </aside>

      <div className="min-h-screen lg:pl-64">

        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#080d19]/90 px-5 backdrop-blur-xl sm:px-8">

          <div className="flex items-center gap-4">

            <button
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white lg:hidden"
            >
              <Menu size={23} />
            </button>

            <div>
              <p className="text-sm font-semibold text-white">
                Business Workspace
              </p>
              <p className="text-xs text-slate-500">
                Manage your retail operations
              </p>
            </div>

          </div>

          <div className="flex items-center gap-4">

            <button className="relative rounded-xl border border-white/10 p-2.5 text-slate-400 hover:bg-white/5 hover:text-white">
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-400" />
            </button>

            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-white">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-slate-500">
                {activeTenant?.role || 'Business Member'}
              </p>
            </div>

          </div>

        </header>

        <main className="p-5 sm:p-8">
          <Outlet />
        </main>

      </div>

    </div>
  )
}

export default DashboardLayout
