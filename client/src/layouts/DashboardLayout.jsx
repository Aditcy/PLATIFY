
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
  Bell,
  Sun,
  Moon
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../features/auth/authSlice'
import { useTheme } from '../context/ThemeContext'

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
  const { theme, toggleTheme } = useTheme()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const { user, activeTenant } = useSelector((state) => state.auth)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
  }

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
        : 'text-[var(--text-secondary)] hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)]'
    }`

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-primary)] transition-colors duration-200">

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-[var(--border-color)] bg-[var(--sidebar-bg)] transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >

        <div className="flex h-20 shrink-0 items-center justify-between border-b border-[var(--border-color)] px-6">
          <div>
            <h1 className="text-2xl font-black tracking-[0.18em] text-[var(--text-primary)]">
              PLATIFY
            </h1>
            <p className="mt-1 text-[10px] tracking-[0.2em] text-[var(--text-muted)]">
              RETAIL MANAGEMENT
            </p>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)] lg:hidden"
          >
            <X size={21} />
          </button>
        </div>

        <div className="shrink-0 border-b border-[var(--border-color)] p-4">
          <button
            onClick={() => navigate('/businesses')}
            className="flex w-full items-center gap-3 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-3 text-left transition hover:bg-[var(--card-bg-hover)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
              <Store size={20} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {activeTenant?.name || 'Your Business'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Switch Business
              </p>
            </div>

            <ChevronDown size={16} className="shrink-0 text-[var(--text-muted)]" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-[10px] font-bold tracking-[0.2em] text-[var(--text-muted)]">
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
                className={navLinkClass}
              >
                <Icon size={19} className="shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            )
          })}

          <div className="!mt-8 border-t border-[var(--border-color)] pt-6">
            <p className="mb-4 px-3 text-[10px] font-bold tracking-[0.2em] text-[var(--text-muted)]">
              PREFERENCES
            </p>

            <NavLink
              to="/dashboard/settings"
              onClick={() => setSidebarOpen(false)}
              className={navLinkClass}
            >
              <Settings size={19} className="shrink-0" />
              <span>Settings</span>
            </NavLink>
          </div>
        </nav>

        <div className="shrink-0 border-t border-[var(--border-color)] p-4">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] font-bold text-[var(--accent)]">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                {user?.name || 'User'}
              </p>
              <p className="truncate text-xs text-[var(--text-muted)]">
                {user?.email || 'Account'}
              </p>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              aria-label="Logout"
              className="rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-red-500/10 hover:text-red-500"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen min-w-0 lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between gap-3 border-b border-[var(--border-color)] bg-[var(--header-bg)] px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="shrink-0 rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)] lg:hidden"
            >
              <Menu size={23} />
            </button>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                Business Workspace
              </p>
              <p className="hidden text-xs text-[var(--text-muted)] sm:block">
                Manage your retail operations
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-2.5 text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)] hover:text-[var(--accent)]"
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              aria-label="Notifications"
              className="relative rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] p-2.5 text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)]"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--accent)]" />
            </button>

            <div className="hidden text-right sm:block">
              <p className="max-w-36 truncate text-sm font-medium text-[var(--text-primary)]">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {activeTenant?.role || 'Business Member'}
              </p>
            </div>
          </div>
        </header>

        <main className="min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
