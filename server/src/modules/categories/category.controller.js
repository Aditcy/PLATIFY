
const mongoose = require('mongoose')
const Category = require('../../models/Category')
const Product = require('../../models/Product')

const getCategories = async (req, res) => {
  try {
    const tenantId = req.tenant._id

    const [categories, productCounts] = await Promise.all([
      Category.find({
        tenantId,
        isActive: true
      }).sort({ name: 1 }),

      Product.aggregate([
        {
          $match: {
            tenantId,
            isActive: true,
            categoryId: { $ne: null }
          }
        },
        {
          $group: {
            _id: '$categoryId',
            productCount: { $sum: 1 }
          }
        }
      ])
    ])

    const countMap = new Map(
      productCounts.map((item) => [
        item._id.toString(),
        item.productCount
      ])
    )

    const categoriesWithCounts = categories.map((category) => {
      const categoryData = category.toObject()

      return {
        ...categoryData,
        productCount: countMap.get(category._id.toString()) || 0
      }
    })

    res.status(200).json({
      success: true,
      count: categoriesWithCounts.length,
      data: categoriesWithCounts
    })
  } catch (error) {
    console.error('Get categories error:', error)

    res.status(500).json({
      success: false,
      message: 'Unable to retrieve categories'
    })
  }
}

const createCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      })
    }

    if (parentCategory) {
      if (!mongoose.isValidObjectId(parentCategory)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid parent category ID'
        })
      }

      const parent = await Category.findOne({
        _id: parentCategory,
        tenantId: req.tenant._id,
        isActive: true
      })

      if (!parent) {
        return res.status(400).json({
          success: false,
          message: 'Parent category not found in this business'
        })
      }
    }

    const category = await Category.create({
      tenantId: req.tenant._id,
      name: name.trim(),
      description: description || '',
      parentCategory: parentCategory || null
    })

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    })
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message: error.code === 11000
        ? 'This category already exists'
        : error.message
    })
  }
}

const updateCategory = async (req, res) => {
  try {
    const updates = {}

    if (req.body.name !== undefined) {
      if (!req.body.name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Category name cannot be empty'
        })
      }

      updates.name = req.body.name.trim()
    }

    if (req.body.description !== undefined) {
      updates.description = req.body.description
    }

    if (req.body.parentCategory !== undefined) {
      if (!req.body.parentCategory) {
        updates.parentCategory = null
      } else {
        if (
          !mongoose.isValidObjectId(req.body.parentCategory) ||
          req.body.parentCategory === req.params.categoryId
        ) {
          return res.status(400).json({
            success: false,
            message: 'Invalid parent category'
          })
        }

        const parent = await Category.findOne({
          _id: req.body.parentCategory,
          tenantId: req.tenant._id,
          isActive: true
        })

        if (!parent) {
          return res.status(400).json({
            success: false,
            message: 'Parent category not found in this business'
          })
        }

        updates.parentCategory = parent._id
      }
    }

    const category = await Category.findOneAndUpdate(
      {
        _id: req.params.categoryId,
        tenantId: req.tenant._id,
        isActive: true
      },
      updates,
      { new: true, runValidators: true }
    )

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    })
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message: error.code === 11000
        ? 'This category already exists'
        : error.message
    })
  }
}

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.categoryId,
      tenantId: req.tenant._id,
      isActive: true
    })

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      })
    }

    const [productCount, childCount] = await Promise.all([
      Product.countDocuments({
        tenantId: req.tenant._id,
        categoryId: category._id,
        isActive: true
      }),
      Category.countDocuments({
        tenantId: req.tenant._id,
        parentCategory: category._id,
        isActive: true
      })
    ])

    if (productCount > 0 || childCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Move or remove its products and subcategories before deactivating this category'
      })
    }

    category.isActive = false
    await category.save()

    res.status(200).json({
      success: true,
      message: 'Category deactivated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to deactivate category'
    })
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
}
