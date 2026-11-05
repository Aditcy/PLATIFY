import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { Building2, Plus, ArrowRight, LogOut } from 'lucide-react'

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading your businesses...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 md:p-10">

      <div className="max-w-6xl mx-auto">

        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              PLATIFY
            </h1>
            <p className="text-slate-400 mt-1">
              Business Workspace
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </header>

        <section className="mb-10">
          <p className="text-indigo-400 text-sm font-medium mb-2">
            WELCOME TO PLATIFY
          </p>

          <h2 className="text-3xl md:text-4xl font-bold">
            Welcome{user?.name ? `, ${user.name}` : ' back'}!
          </h2>

          <p className="text-slate-400 mt-3">
            Select a business workspace or create a new one.
          </p>
        </section>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h3 className="text-xl font-semibold">
            Your Businesses
          </h3>

          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-lg flex items-center gap-2 font-medium transition"
          >
            <Plus size={18} />
            Create Business
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreateBusiness}
            className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8"
          >
            <h3 className="text-xl font-semibold mb-5">
              Create a Business Workspace
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Business name *"
                required
                className="bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-indigo-500"
              />

              <input
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                placeholder="Business type (e.g. Fashion & Lifestyle)"
                className="bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-indigo-500"
              />

              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Business email"
                className="bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-indigo-500"
              />

              <input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Business phone"
                className="bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-indigo-500"
              />

              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Business address"
                className="md:col-span-2 bg-slate-950 border border-slate-700 rounded-lg p-3 outline-none focus:border-indigo-500"
              />

            </div>

            <div className="flex gap-3 mt-6">
              <button
                type="submit"
                disabled={creating}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-5 py-3 rounded-lg font-medium"
              >
                {creating ? 'Creating...' : 'Create Workspace'}
              </button>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-slate-800 hover:bg-slate-700 px-5 py-3 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {businesses.length === 0 ? (
          <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-12 text-center">
            <Building2
              size={42}
              className="mx-auto text-slate-500 mb-4"
            />

            <h3 className="text-xl font-semibold">
              No businesses yet
            </h3>

            <p className="text-slate-400 mt-2 mb-6">
              Create your first business workspace to get started.
            </p>

            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 hover:bg-indigo-500 px-5 py-3 rounded-lg"
            >
              Create Your First Business
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

            {businesses.map((business) => (
              <div
                key={business.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-indigo-500 transition"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="bg-indigo-500/10 p-3 rounded-xl">
                    <Building2
                      size={25}
                      className="text-indigo-400"
                    />
                  </div>

                  <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full capitalize">
                    {business.role}
                  </span>
                </div>

                <h3 className="text-xl font-semibold">
                  {business.name}
                </h3>

                <p className="text-slate-400 text-sm mt-2">
                  {business.businessType || 'Retail Business'}
                </p>

                <button
                  onClick={() => handleSelectBusiness(business)}
                  className="w-full mt-6 bg-slate-800 hover:bg-indigo-600 py-3 rounded-lg flex items-center justify-center gap-2 transition"
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