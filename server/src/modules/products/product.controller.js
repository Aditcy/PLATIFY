
const mongoose = require('mongoose')
const Product = require('../../models/Product')
const Category = require('../../models/Category')

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      tenantId: req.tenant._id,
      isActive: true
    })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve products'
    })
  }
}

const createProduct = async (req, res) => {
  try {
    const {
      name, description, sku, categoryId,
      price, costPrice, stockQuantity, lowStockThreshold, images
    } = req.body

    if (!name || !sku || price === undefined || price === '') {
      return res.status(400).json({
        success: false,
        message: 'Name, SKU and price are required'
      })
    }

    if (
      !Number.isFinite(Number(price)) ||
      Number(price) < 0 ||
      (costPrice !== undefined && (!Number.isFinite(Number(costPrice)) || Number(costPrice) < 0)) ||
      (stockQuantity !== undefined && (!Number.isInteger(Number(stockQuantity)) || Number(stockQuantity) < 0)) ||
      (lowStockThreshold !== undefined && (!Number.isInteger(Number(lowStockThreshold)) || Number(lowStockThreshold) < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid price, cost or stock value'
      })
    }

    if (categoryId) {
      if (!mongoose.isValidObjectId(categoryId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid category ID'
        })
      }

      const category = await Category.findOne({
        _id: categoryId,
        tenantId: req.tenant._id,
        isActive: true
      })

      if (!category) {
        return res.status(400).json({
          success: false,
          message: 'Category not found in this business'
        })
      }
    }

    const product = await Product.create({
      tenantId: req.tenant._id,
      name,
      description,
      sku,
      categoryId: categoryId || null,
      price: Number(price),
      costPrice: costPrice === undefined ? 0 : Number(costPrice),
      stockQuantity: stockQuantity === undefined ? 0 : Number(stockQuantity),
      lowStockThreshold: lowStockThreshold === undefined ? 5 : Number(lowStockThreshold),
      images: Array.isArray(images) ? images : []
    })

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    })
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message: error.code === 11000
        ? 'A product with this SKU already exists'
        : error.message
    })
  }
}

const updateProduct = async (req, res) => {
  try {
    const updates = {}
    const allowedFields = [
      'name', 'description', 'sku', 'price',
      'costPrice', 'stockQuantity', 'lowStockThreshold', 'images'
    ]

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    if (updates.price !== undefined) {
      updates.price = Number(updates.price)
    }

    if (updates.costPrice !== undefined) {
      updates.costPrice = Number(updates.costPrice)
    }

    for (const field of ['stockQuantity', 'lowStockThreshold']) {
      if (updates[field] !== undefined) {
        updates[field] = Number(updates[field])

        if (!Number.isInteger(updates[field]) || updates[field] < 0) {
          return res.status(400).json({
            success: false,
            message: `Invalid ${field}`
          })
        }
      }
    }

    if (
      (updates.price !== undefined && (!Number.isFinite(updates.price) || updates.price < 0)) ||
      (updates.costPrice !== undefined && (!Number.isFinite(updates.costPrice) || updates.costPrice < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Price and cost must be valid non-negative numbers'
      })
    }

    if (req.body.categoryId !== undefined) {
      if (req.body.categoryId === null || req.body.categoryId === '') {
        updates.categoryId = null
      } else {
        if (!mongoose.isValidObjectId(req.body.categoryId)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid category ID'
          })
        }

        const category = await Category.findOne({
          _id: req.body.categoryId,
          tenantId: req.tenant._id,
          isActive: true
        })

        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Category not found in this business'
          })
        }

        updates.categoryId = category._id
      }
    }

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.productId,
        tenantId: req.tenant._id,
        isActive: true
      },
      updates,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name')

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: product
    })
  } catch (error) {
    res.status(error.code === 11000 ? 409 : 400).json({
      success: false,
      message: error.code === 11000
        ? 'A product with this SKU already exists'
        : error.message
    })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.productId,
        tenantId: req.tenant._id,
        isActive: true
      },
      { isActive: false },
      { new: true }
    )

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Product deactivated successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to deactivate product'
    })
  }
}

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
}
