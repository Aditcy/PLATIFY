
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

  const totalProducts = categories.reduce(
    (total, category) =>
      total + (Number(category.productCount) || 0),
    0
  )

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

  const inputClass =
    'w-full rounded-xl border border-[var(--border-color)] bg-[var(--app-bg)] px-4 py-3 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]'

  const primaryButtonClass =
    'inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--app-bg)] disabled:cursor-not-allowed disabled:opacity-50'

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-6 sm:space-y-8">

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent)]">
            Inventory Management
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Categories
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            Organise your products into categories.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className={`${primaryButtonClass} w-full shrink-0 sm:w-auto`}
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm transition-colors duration-200 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Total Categories
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {categories.length}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Categories in your catalogue
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <FolderOpen size={23} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] p-5 shadow-sm transition-colors duration-200 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                Products Categorised
              </p>
              <p className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                {totalProducts}
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Products assigned to categories
              </p>
            </div>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Package size={23} />
            </div>
          </div>
        </div>

      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-sm transition-colors duration-200">

        <div className="flex flex-col justify-between gap-4 p-5 sm:p-6 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Category Catalogue
            </h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {filteredCategories.length} categories found
            </p>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              aria-label="Search categories"
              className={`${inputClass} pl-11`}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-16 text-sm text-[var(--text-secondary)]">
            <LoaderCircle size={19} className="animate-spin text-[var(--accent)]" />
            Loading categories...
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="mx-5 mb-5 rounded-xl border border-dashed border-[var(--border-color)] px-4 py-14 text-center sm:mx-6 sm:mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
              <FolderOpen size={27} />
            </div>

            <p className="mt-4 font-semibold text-[var(--text-primary)]">
              {search ? 'No matching categories' : 'No categories yet'}
            </p>

            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
              {search
                ? 'Try another search term.'
                : 'Create your first category to organise your products.'}
            </p>

            {!search && (
              <button
                onClick={openCreateModal}
                className={`${primaryButtonClass} mt-5`}
              >
                <Plus size={17} />
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead>
                <tr className="border-y border-[var(--border-color)] bg-[var(--app-bg)] text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  <th className="px-5 py-4 font-semibold sm:px-6">Category</th>
                  <th className="px-5 py-4 font-semibold">Description</th>
                  <th className="px-5 py-4 font-semibold">Products</th>
                  <th className="px-5 py-4 text-right font-semibold sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="border-b border-[var(--border-color)] transition-colors last:border-b-0 hover:bg-[var(--card-bg-hover)]"
                  >
                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                          <FolderOpen size={18} />
                        </div>
                        <span className="font-semibold text-[var(--text-primary)]">
                          {category.name}
                        </span>
                      </div>
                    </td>

                    <td className="max-w-xs px-5 py-4 text-sm text-[var(--text-secondary)]">
                      <span className="line-clamp-2">
                        {category.description || 'No description'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium tabular-nums text-[var(--text-primary)]">
                      {Number(category.productCount) || 0}
                    </td>

                    <td className="px-5 py-4 sm:px-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          title="Edit category"
                          aria-label={`Edit ${category.name}`}
                          className="rounded-lg border border-[var(--border-color)] p-2.5 text-[var(--text-secondary)] transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(category)}
                          title="Delete category"
                          aria-label={`Delete ${category.name}`}
                          className="rounded-lg border border-[var(--border-color)] p-2.5 text-[var(--text-secondary)] transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-500"
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

        {!loading && filteredCategories.length > 0 && (
          <div className="border-t border-[var(--border-color)] px-5 py-3 sm:px-6">
            <p className="text-xs text-[var(--text-muted)]">
              Showing {filteredCategories.length} of {categories.length} categories
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <div className="my-auto max-h-[calc(100dvh-24px)] w-full max-w-lg overflow-y-auto rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] shadow-2xl sm:max-h-[calc(100dvh-40px)]">

            <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-[var(--border-color)] bg-[var(--card-bg)] px-5 py-5 sm:px-6">
              <div>
                <h2 className="text-lg font-bold text-[var(--text-primary)]">
                  {editingCategory ? 'Edit Category' : 'Add Category'}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Enter the category details below.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                aria-label="Close dialog"
                className="shrink-0 rounded-lg p-2 text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
                >
                  Category Name *
                </label>

                <input
                  id="category-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. T-Shirts"
                  maxLength={100}
                  required
                  autoFocus
                  className={inputClass}
                />

                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  Maximum 100 characters.
                </p>
              </div>

              <div>
                <label
                  htmlFor="category-description"
                  className="mb-2 block text-sm font-semibold text-[var(--text-primary)]"
                >
                  Description
                </label>

                <textarea
                  id="category-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe this category..."
                  rows={4}
                  maxLength={500}
                  className={`${inputClass} resize-y`}
                />

                <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                  Maximum 500 characters.
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[var(--border-color)] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[var(--border-color)] px-5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-[var(--card-bg-hover)] hover:text-[var(--text-primary)] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={primaryButtonClass}
                >
                  {saving && (
                    <LoaderCircle size={17} className="animate-spin" />
                  )}
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
