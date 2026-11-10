
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Users,
  UserPlus,
  Search,
  Mail,
  Phone,
  MapPin,
  Eye,
  Pencil,
  Trash2,
  X,
  LoaderCircle,
  UsersRound,
  Contact
} from 'lucide-react'
import toast from 'react-hot-toast'

import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../../features/customers/customerService'

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  }
}

const inputClass =
  'w-full min-w-0 rounded-xl border border-[var(--border-color)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]'

const labelClass =
  'mb-2 block text-sm font-medium text-[var(--text-secondary)]'

const CustomerModal = ({ title, onClose, children }) => (
  <div
    className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:items-center sm:p-5"
    onClick={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}
  >
    <div className="my-auto max-h-[calc(100vh-24px)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-2xl sm:max-h-[90vh]">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--border-color)] bg-[var(--card-bg)] px-4 py-4 sm:px-6 sm:py-5">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="shrink-0 rounded-lg p-2 text-[var(--text-muted)] transition hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)]"
        >
          <X size={19} />
        </button>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </div>
  </div>
)

const StatCard = ({ icon: Icon, label, value, description }) => (
  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div>
        <p className="text-sm text-[var(--text-muted)]">{label}</p>
        <p className="mt-2 text-2xl font-bold text-[var(--text-primary)]">
          {value}
        </p>
      </div>
      <div className="rounded-xl bg-[var(--accent-soft)] p-3 text-[var(--accent)]">
        <Icon size={22} />
      </div>
    </div>
    <p className="mt-3 text-xs text-[var(--text-muted)]">{description}</p>
  </div>
)

const CustomersPage = () => {
  const activeTenant = useSelector((state) => state.auth.activeTenant)
  const tenantId = activeTenant?._id || activeTenant?.id

  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)
  const [saving, setSaving] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const loadCustomers = async () => {
    if (!tenantId) {
      setCustomers([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getCustomers(tenantId)
      setCustomers(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to load customers'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [tenantId])

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return customers

    return customers.filter((customer) => {
      const searchable = [
        customer.name,
        customer.email,
        customer.phone,
        customer.address?.city,
        customer.address?.state
      ]

      return searchable.some((value) =>
        String(value || '').toLowerCase().includes(query)
      )
    })
  }, [customers, search])

  const customersWithEmail = customers.filter(
    (customer) => customer.email
  ).length

  const customersWithPhone = customers.filter(
    (customer) => customer.phone
  ).length

  const updateFormField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }))
  }

  const updateAddressField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      address: {
        ...previous.address,
        [field]: value
      }
    }))
  }

  const openAddModal = () => {
    setSelectedCustomer(null)
    setForm(EMPTY_FORM)
    setModal('form')
  }

  const openEditModal = (customer) => {
    setSelectedCustomer(customer)

    setForm({
      name: customer.name || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: {
        street: customer.address?.street || '',
        city: customer.address?.city || '',
        state: customer.address?.state || '',
        postalCode: customer.address?.postalCode || '',
        country: customer.address?.country || 'India'
      }
    })

    setModal('form')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!tenantId) {
      toast.error('Please select a business first')
      return
    }

    if (!form.name.trim()) {
      toast.error('Customer name is required')
      return
    }

    try {
      setSaving(true)

      const customerData = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: {
          street: form.address.street.trim(),
          city: form.address.city.trim(),
          state: form.address.state.trim(),
          postalCode: form.address.postalCode.trim(),
          country: form.address.country.trim() || 'India'
        }
      }

      if (selectedCustomer) {
        await updateCustomer(
          tenantId,
          selectedCustomer._id,
          customerData
        )
        toast.success('Customer updated successfully')
      } else {
        await createCustomer(tenantId, customerData)
        toast.success('Customer added successfully')
      }

      setModal(null)
      setSelectedCustomer(null)
      setForm(EMPTY_FORM)
      await loadCustomers()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to save customer'
      )
    } finally {
      setSaving(false)
    }
  }

  const openDetails = async (customer) => {
    try {
      setSelectedCustomer(customer)
      setModal('details')

      const data = await getCustomerById(tenantId, customer._id)
      setSelectedCustomer(data)
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to load customer details'
      )
      setModal(null)
    }
  }

  const handleDeactivate = async (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate ${customer.name}?`
    )

    if (!confirmed) return

    try {
      await deleteCustomer(tenantId, customer._id)
      toast.success('Customer deactivated successfully')
      await loadCustomers()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to deactivate customer'
      )
    }
  }

  const getAddressText = (address) => {
    if (!address) return 'No address provided'

    return [
      address.street,
      address.city,
      address.state,
      address.postalCode,
      address.country
    ]
      .filter(Boolean)
      .join(', ') || 'No address provided'
  }

  return (
    <div className="min-w-0 space-y-7">

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
            <Users size={16} />
            CUSTOMER MANAGEMENT
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Customers
          </h1>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Manage your business customers and their contact information.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] sm:w-auto"
        >
          <UserPlus size={18} />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={UsersRound}
          label="Total Customers"
          value={customers.length}
          description="Active customer records"
        />
        <StatCard
          icon={Mail}
          label="With Email"
          value={customersWithEmail}
          description="Customers with email addresses"
        />
        <StatCard
          icon={Phone}
          label="With Phone"
          value={customersWithPhone}
          description="Customers with phone numbers"
        />
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[var(--border-color)] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold text-[var(--text-primary)]">
              Customer Directory
            </h2>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="relative w-full lg:max-w-xs">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customers..."
              className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--app-bg)] py-3 pl-10 pr-4 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-[var(--text-muted)]">
            <LoaderCircle size={22} className="animate-spin" />
            Loading customers...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
            <div className="rounded-2xl bg-[var(--accent-soft)] p-4 text-[var(--accent)]">
              <Contact size={30} />
            </div>
            <h3 className="mt-4 font-semibold text-[var(--text-primary)]">
              {search ? 'No matching customers' : 'No customers yet'}
            </h3>
            <p className="mt-2 max-w-sm text-sm text-[var(--text-muted)]">
              {search
                ? 'Try searching with another name, email, phone number or location.'
                : 'Add your first customer to start building your customer directory.'}
            </p>
            {!search && (
              <button
                onClick={openAddModal}
                className="mt-5 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
              >
                Add Your First Customer
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-[var(--app-bg)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Customer</th>
                  <th className="px-6 py-4 font-medium">Contact</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[var(--border-color)]">
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="transition hover:bg-[var(--card-bg-hover)]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] font-semibold text-[var(--accent)]">
                          {(customer.name || '?')
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[var(--text-primary)]">
                            {customer.name}
                          </p>
                          <p className="mt-1 text-xs text-[var(--text-muted)]">
                            Customer
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1.5 text-sm">
                        <p className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <Mail size={14} className="shrink-0 text-[var(--text-muted)]" />
                          <span className="break-all">{customer.email || 'No email'}</span>
                        </p>
                        <p className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <Phone size={14} className="shrink-0 text-[var(--text-muted)]" />
                          {customer.phone || 'No phone'}
                        </p>
                      </div>
                    </td>

                    <td className="max-w-xs px-6 py-4">
                      <p className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                        <MapPin size={15} className="mt-0.5 shrink-0 text-[var(--text-muted)]" />
                        <span className="line-clamp-2">
                          {getAddressText(customer.address)}
                        </span>
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openDetails(customer)}
                          title="View customer"
                          aria-label={`View ${customer.name}`}
                          className="rounded-lg border border-[var(--border-color)] p-2 text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openEditModal(customer)}
                          title="Edit customer"
                          aria-label={`Edit ${customer.name}`}
                          className="rounded-lg border border-[var(--border-color)] p-2 text-[var(--text-muted)] transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-500"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeactivate(customer)}
                          title="Deactivate customer"
                          aria-label={`Deactivate ${customer.name}`}
                          className="rounded-lg border border-[var(--border-color)] p-2 text-[var(--text-muted)] transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'form' && (
        <CustomerModal
          title={selectedCustomer ? 'Edit Customer' : 'Add New Customer'}
          onClose={() => setModal(null)}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h3 className="mb-3 text-sm font-semibold text-[var(--accent)]">
                CUSTOMER INFORMATION
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Full Name *</label>
                  <input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(event) =>
                      updateFormField('name', event.target.value)
                    }
                    placeholder="Enter customer name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    maxLength={254}
                    value={form.email}
                    onChange={(event) =>
                      updateFormField('email', event.target.value)
                    }
                    placeholder="customer@example.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    maxLength={20}
                    value={form.phone}
                    onChange={(event) =>
                      updateFormField('phone', event.target.value)
                    }
                    placeholder="Enter phone number"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border-color)] pt-5">
              <h3 className="mb-3 text-sm font-semibold text-[var(--accent)]">
                ADDRESS INFORMATION
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Street Address</label>
                  <input
                    value={form.address.street}
                    onChange={(event) =>
                      updateAddressField('street', event.target.value)
                    }
                    placeholder="Street, building, apartment"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>City</label>
                  <input
                    value={form.address.city}
                    onChange={(event) =>
                      updateAddressField('city', event.target.value)
                    }
                    placeholder="City"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>State</label>
                  <input
                    value={form.address.state}
                    onChange={(event) =>
                      updateAddressField('state', event.target.value)
                    }
                    placeholder="State"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Postal Code</label>
                  <input
                    value={form.address.postalCode}
                    onChange={(event) =>
                      updateAddressField('postalCode', event.target.value)
                    }
                    placeholder="Postal code"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Country</label>
                  <input
                    value={form.address.country}
                    onChange={(event) =>
                      updateAddressField('country', event.target.value)
                    }
                    placeholder="Country"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-color)] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-xl border border-[var(--border-color)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)]"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <LoaderCircle size={17} className="animate-spin" />
                )}
                {selectedCustomer ? 'Save Changes' : 'Create Customer'}
              </button>
            </div>
          </form>
        </CustomerModal>
      )}

      {modal === 'details' && selectedCustomer && (
        <CustomerModal
          title="Customer Details"
          onClose={() => setModal(null)}
        >
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-xl font-bold text-[var(--accent)]">
                {(selectedCustomer.name || '?')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <h3 className="break-words text-xl font-semibold text-[var(--text-primary)]">
                  {selectedCustomer.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">
                  Customer record
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--app-bg)] p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Mail size={15} /> EMAIL
                </div>
                <p className="break-all text-sm text-[var(--text-primary)]">
                  {selectedCustomer.email || 'Not provided'}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--app-bg)] p-4">
                <div className="mb-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Phone size={15} /> PHONE
                </div>
                <p className="text-sm text-[var(--text-primary)]">
                  {selectedCustomer.phone || 'Not provided'}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--border-color)] bg-[var(--app-bg)] p-4 sm:col-span-2">
                <div className="mb-2 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <MapPin size={15} /> ADDRESS
                </div>
                <p className="break-words text-sm leading-6 text-[var(--text-primary)]">
                  {getAddressText(selectedCustomer.address)}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t border-[var(--border-color)] pt-5">
              <button
                onClick={() => openEditModal(selectedCustomer)}
                className="flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
              >
                <Pencil size={16} />
                Edit Customer
              </button>
            </div>
          </div>
        </CustomerModal>
      )}
    </div>
  )
}

export default CustomersPage
