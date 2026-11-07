
const mongoose = require('mongoose')
const Product = require('../../models/Product')
const StockMovement = require('../../models/StockMovement')

const getInventorySummary = async (req, res) => {
  try {
    const tenantId = req.tenant._id

    const [summary, lowStockProducts] = await Promise.all([
      Product.aggregate([
        {
          $match: {
            tenantId,
            isActive: true
          }
        },
        {
          $group: {
            _id: null,
            totalProducts: { $sum: 1 },
            totalUnits: { $sum: '$stockQuantity' },
            inventoryCostValue: {
              $sum: {
                $multiply: ['$stockQuantity', '$costPrice']
              }
            },
            lowStockCount: {
              $sum: {
                $cond: [
                  { $lte: ['$stockQuantity', '$lowStockThreshold'] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $project: { _id: 0 }
        }
      ]),
      Product.find({
        tenantId,
        isActive: true,
        $expr: {
          $lte: ['$stockQuantity', '$lowStockThreshold']
        }
      })
        .select('name sku stockQuantity lowStockThreshold')
        .sort({ stockQuantity: 1 })
    ])

    res.status(200).json({
      success: true,
      data: {
        summary: summary[0] || {
          totalProducts: 0,
          totalUnits: 0,
          inventoryCostValue: 0,
          lowStockCount: 0
        },
        lowStockProducts
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve inventory summary'
    })
  }
}

const getStockMovements = async (req, res) => {
  try {
    const filter = {
      tenantId: req.tenant._id
    }

    if (req.query.productId) {
      if (!mongoose.isValidObjectId(req.query.productId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID'
        })
      }

      filter.productId = req.query.productId
    }

    const movements = await StockMovement.find(filter)
      .populate('productId', 'name sku')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(100)

    res.status(200).json({
      success: true,
      count: movements.length,
      data: movements
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Unable to retrieve stock movements'
    })
  }
}

const adjustStock = async (req, res) => {
  const { productId, type, quantity, reason } = req.body

  if (!mongoose.isValidObjectId(productId)) {
    return res.status(400).json({
      success: false,
      message: 'A valid product ID is required'
    })
  }

  if (!['stock_in', 'stock_out', 'adjustment'].includes(type)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid stock movement type'
    })
  }

  if (
    quantity === undefined ||
    !Number.isInteger(Number(quantity)) ||
    Number(quantity) < 0 ||
    (type !== 'adjustment' && Number(quantity) === 0)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Quantity must be a valid non-negative whole number; stock-in and stock-out must be greater than zero'
    })
  }

  if (type === 'adjustment' && !reason?.trim()) {
    return res.status(400).json({
      success: false,
      message: 'A reason is required for manual stock adjustments'
    })
  }

  const session = await mongoose.startSession()

  try {
    let result

    await session.withTransaction(async () => {
      const product = await Product.findOne({
        _id: productId,
        tenantId: req.tenant._id,
        isActive: true
      }).session(session)

      if (!product) {
        const error = new Error('Product not found')
        error.statusCode = 404
        throw error
      }

      const previousStock = product.stockQuantity
      const requestedQuantity = Number(quantity)

      let newStock

      if (type === 'stock_in') {
        newStock = previousStock + requestedQuantity
      } else if (type === 'stock_out') {
        newStock = previousStock - requestedQuantity
      } else {
        newStock = requestedQuantity
      }

      if (newStock < 0) {
        const error = new Error('Insufficient stock available')
        error.statusCode = 400
        throw error
      }

      product.stockQuantity = newStock
      await product.save({ session })

      const movement = await StockMovement.create([{
        tenantId: req.tenant._id,
        productId: product._id,
        type,
        quantity: requestedQuantity,
        previousStock,
        newStock,
        reason: reason || '',
        performedBy: req.user._id
      }], { session })

      result = {
        product,
        movement: movement[0]
      }
    })

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: result
    })
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : 'Unable to update inventory'
    })
  } finally {
    await session.endSession()
  }
}

module.exports = {
  getInventorySummary,
  getStockMovements,
  adjustStock
}
