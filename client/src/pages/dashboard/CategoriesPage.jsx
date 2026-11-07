
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderOpen,
  Package,
  X,
  LoaderCircle
} from 'lucide-react'

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../../features/categories/categoryService'

function CategoriesPage() {
  const { activeTenant } = useSelector((state) => state.auth)
  const tenantId = activeTenant?._id || activeTenant?.id

  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const loadCategories = async () => {
    if (!tenantId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getCategories(tenantId)
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [tenantId])

  const filteredCategories = useMemo(() => {
    const term = search.trim().toLowerCase()

    if (!term) return categories

    return categories.filter((category) =>
      `${category.name} ${category.description || ''}`
        .toLowerCase()
        .includes(term)
    )
  }, [categories, search])

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({ name: '', description: '' })
    setShowModal(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      description: category.description || ''
    })
    setShowModal(true)
  }

  const closeModal = () => {
    if (saving) return
    setShowModal(false)
    setEditingCategory(null)
  }

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      toast.error('Please enter a category name')
      return
    }

    try {
      setSaving(true)

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim()
      }

      if (editingCategory) {
        await updateCategory(tenantId, editingCategory._id, payload)
        toast.success('Category updated successfully')
      } else {
        await createCategory(tenantId, payload)
        toast.success('Category created successfully')
      }

      setShowModal(false)
      setEditingCategory(null)
      await loadCategories()
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Unable to save category'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (category) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    )

    if (!confirmed) return

    try {
      await deleteCategory(tenantId, category._id)
      toast.success('Category deleted successfully')
      await loadCategories()
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        'Unable to delete category. It may contain products or subcategories.'
      )
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Inventory Management
          </p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Categories
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Organise your products into categories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Categories</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {categories.length}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
              <FolderOpen size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Products Categorised</p>
              <p className="mt-2 text-3xl font-bold text-white">
                {categories.reduce(
                  (total, category) =>
                    total + (Number(category.productCount) || 0),
                  0
                )}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <Package size={23} />
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Based on product counts returned by the API.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0d1424] p-5 sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Category Catalogue
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {filteredCategories.length} categories found
            </p>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              className="w-full rounded-xl border border-white/10 bg-[#080e1b] py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
            <LoaderCircle size={18} className="animate-spin" />
            Loading categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 py-14 text-center">
            <FolderOpen size={35} className="mx-auto text-slate-600" />
            <p className="mt-4 font-medium text-white">
              {search ? 'No matching categories' : 'No categories yet'}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {search
                ? 'Try another search term.'
                : 'Create your first category to organise your products.'}
            </p>
            {!search && (
              <button
                onClick={openCreateModal}
                className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
              >
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-4 font-medium">Category</th>
                  <th className="px-4 py-4 font-medium">Description</th>
                  <th className="px-4 py-4 font-medium">Products</th>
                  <th className="px-4 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="border-b border-white/5 transition hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                          <FolderOpen size={18} />
                        </div>
                        <span className="font-medium text-white">
                          {category.name}
                        </span>
                      </div>
                    </td>

                    <td className="max-w-xs px-4 py-4 text-sm text-slate-400">
                      <span className="line-clamp-2">
                        {category.description || 'No description'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-300">
                      {Number(category.productCount) || 0}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          title="Edit category"
                          className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-400"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(category)}
                          title="Delete category"
                          className="rounded-lg border border-white/10 p-2 text-slate-400 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0d1424] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Enter the category details below.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Category Name *
                </label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. T-Shirts"
                  maxLength={100}
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#080e1b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe this category..."
                  rows={4}
                  maxLength={500}
                  className="w-full resize-none rounded-xl border border-white/10 bg-[#080e1b] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {saving && <LoaderCircle size={16} className="animate-spin" />}
                  {saving
                    ? 'Saving...'
                    : editingCategory
                      ? 'Save Changes'
                      : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoriesPage
