import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Building2, Plus, ArrowRight, LogOut, Sun, Moon } from 'lucide-react'

import { useTheme } from '../context/ThemeContext'

import {
  getMyBusinesses,
  createBusiness
} from '../features/auth/authService'

import {
  setBusinesses,
  setActiveTenant,
  logout
} from '../features/auth/authSlice'

function BusinessSelectionPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()

  const { user, businesses } = useSelector((state) => state.auth)

  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    businessType: '',
    email: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    const loadBusinesses = async () => {
      try {
        const response = await getMyBusinesses()
        dispatch(setBusinesses(response.businesses))
      } catch (error) {
        toast.error(
          error.response?.data?.message || 'Unable to load businesses'
        )
      } finally {
        setLoading(false)
      }
    }

    loadBusinesses()
  }, [dispatch])

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    })
  }

  const handleCreateBusiness = async (event) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Business name is required')
      return
    }

    try {
      setCreating(true)

      const businessData = Object.fromEntries(
        Object.entries(formData).filter(
          ([key, value]) => key === 'name' || value.trim() !== ''
        )
      )

      await createBusiness(businessData)

      const response = await getMyBusinesses()

      dispatch(setBusinesses(response.businesses))

      toast.success('Business created successfully!')

      setFormData({
        name: '',
        businessType: '',
        email: '',
        phone: '',
        address: ''
      })

      setShowForm(false)
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to create business'
      )
    } finally {
      setCreating(false)
    }
  }

  const handleSelectBusiness = (business) => {
    dispatch(setActiveTenant(business))
    navigate('/dashboard')
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const inputClass = 'w-full min-w-0 rounded-lg border p-3 outline-none transition focus:border-[var(--accent)]'
  const surfaceClass = 'rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)]'
  const mutedTextClass = 'text-[var(--text-muted)]'

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] p-5 text-[var(--text-primary)]">
        Loading your businesses...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] px-4 py-6 text-[var(--text-primary)] sm:px-6 md:px-10 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 sm:mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              PLATIFY
            </h1>
            <p className={`mt-1 ${mutedTextClass}`}>
              Business Workspace
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)]"
            >
              {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            <button
              onClick={handleLogout}
              className={`flex items-center gap-2 transition hover:text-[var(--text-primary)] ${mutedTextClass}`}
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </header>

        <section className="mb-10">
          <p className="mb-2 text-sm font-medium text-[var(--accent)]">
            WELCOME TO PLATIFY
          </p>

          <h2 className="text-3xl font-bold sm:text-4xl">
            Welcome{user?.name ? `, ${user.name}` : ' back'}!
          </h2>

          <p className={`mt-3 ${mutedTextClass}`}>
            Select a business workspace or create a new one.
          </p>
        </section>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xl font-semibold">
            Your Businesses
          </h3>

          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-3 font-medium text-white transition hover:bg-[var(--accent-hover)]"
          >
            <Plus size={18} />
            Create Business
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreateBusiness}
            className={`${surfaceClass} mb-8 p-5 sm:p-6`}
          >
            <h3 className="mb-5 text-xl font-semibold">
              Create a Business Workspace
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Business name *"
                required
                className={`${inputClass} bg-[var(--app-bg)]`}
              />

              <input
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                placeholder="Business type (e.g. Fashion & Lifestyle)"
                className={`${inputClass} bg-[var(--app-bg)]`}
              />

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Business email"
                className={`${inputClass} bg-[var(--app-bg)]`}
              />

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Business phone"
                className={`${inputClass} bg-[var(--app-bg)]`}
              />

              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Business address"
                className={`${inputClass} bg-[var(--app-bg)] md:col-span-2`}
              />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={creating}
                className="rounded-lg bg-[var(--accent)] px-5 py-3 font-medium text-white transition hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Workspace'}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-[var(--border-color)] bg-[var(--card-bg-hover)] px-5 py-3 transition hover:opacity-80"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {businesses.length === 0 ? (
          <div className={`${surfaceClass} border-dashed p-8 text-center sm:p-12`}>
            <Building2
              size={42}
              className="mx-auto mb-4 text-[var(--text-muted)]"
            />

            <h3 className="text-xl font-semibold">
              No businesses yet
            </h3>

            <p className={`mb-6 mt-2 ${mutedTextClass}`}>
              Create your first business workspace to get started.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-[var(--accent)] px-5 py-3 text-white transition hover:bg-[var(--accent-hover)]"
            >
              Create Your First Business
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((business) => (
              <div
                key={business.id}
                className={`${surfaceClass} p-5 transition hover:border-[var(--accent)] sm:p-6`}
              >
                <div className="mb-5 flex items-center justify-between">
                  <div className="rounded-xl bg-[var(--accent-soft)] p-3">
                    <Building2
                      size={25}
                      className="text-[var(--accent)]"
                    />
                  </div>

                  <span className="rounded-full border border-[var(--border-color)] bg-[var(--card-bg-hover)] px-3 py-1 text-xs capitalize text-[var(--text-secondary)]">
                    {business.role}
                  </span>
                </div>

                <h3 className="break-words text-xl font-semibold">
                  {business.name}
                </h3>

                <p className={`mt-2 text-sm ${mutedTextClass}`}>
                  {business.businessType || 'Retail Business'}
                </p>

                <button
                  onClick={() => handleSelectBusiness(business)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--card-bg-hover)] py-3 transition hover:bg-[var(--accent)] hover:text-white"
                >
                  Open Workspace
                  <ArrowRight size={17} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessSelectionPage