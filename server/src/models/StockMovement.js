
const mongoose = require('mongoose')

const stockMovementSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  type: {
    type: String,
    enum: ['stock_in', 'stock_out', 'adjustment'],
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  previousStock: {
    type: Number,
    required: true,
    min: 0
  },
  newStock: {
    type: Number,
    required: true,
    min: 0
  },
  reason: {
    type: String,
    trim: true,
    maxlength: 300,
    default: ''
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

stockMovementSchema.index({
  tenantId: 1,
  productId: 1,
  createdAt: -1
})

module.exports = mongoose.model('StockMovement', stockMovementSchema)
