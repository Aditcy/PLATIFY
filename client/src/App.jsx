
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import BusinessSelectionPage from './pages/BusinessSelectionPage'

function App() {
  const { isAuthenticated } = useSelector((state) => state.auth)

  return (
    <Routes>
      {/* Default route */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? '/businesses' : '/login'}
            replace
          />
        }
      />

      {/* Public routes */}
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

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/businesses"
          element={<BusinessSelectionPage />}
        />

        <Route
          path="/dashboard"
          element={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
              <h1 className="text-3xl font-bold">
                PLATIFY Dashboard — Coming Next
              </h1>
            </div>
          }
        />
      </Route>

      {/* Fallback route */}
      <Route
        path="*"
        element={<Navigate to="/" replace />}
      />
    </Routes>
  )
}

export default App
