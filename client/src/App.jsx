
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import BusinessSelectionPage from './pages/BusinessSelectionPage'
import DashboardLayout from './layouts/DashboardLayout'
import DashboardPage from './pages/dashboard/DashboardPage'

function PlaceholderPage({ title }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-8">
      <p className="text-sm text-indigo-400">WORKSPACE</p>
      <h1 className="mt-3 text-2xl font-bold text-white">{title}</h1>
      <p className="mt-2 text-sm text-slate-400">
        This module will be implemented in a later development milestone.
      </p>
    </div>
  )
}

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? '/businesses' : '/login'}
            replace
          />
        }
      />

      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/businesses" replace />
            : <LoginPage />
        }
      />

      <Route
        path="/register"
        element={
          isAuthenticated
            ? <Navigate to="/businesses" replace />
            : <RegisterPage />
        }
      />

      <Route element={<ProtectedRoute />}>
        <Route
          path="/businesses"
          element={<BusinessSelectionPage />}
        />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<PlaceholderPage title="Products" />} />
          <Route path="categories" element={<PlaceholderPage title="Categories" />} />
          <Route path="inventory" element={<PlaceholderPage title="Inventory" />} />
          <Route path="orders" element={<PlaceholderPage title="Orders" />} />
          <Route path="customers" element={<PlaceholderPage title="Customers" />} />
          <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
        </Route>
      </Route>

      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default App
