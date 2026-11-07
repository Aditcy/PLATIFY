
const mongoose = require('mongoose')

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  productName: {
    type: String,
    required: true,
    trim: true
  },

  sku: {
    type: String,
    default: ''
  },

  quantity: {
    type: Number,
    required: true,
    min: 1
  },

  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },

  subtotal: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  _id: false
})

const orderSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },

  orderNumber: {
    type: String,
    required: true,
    trim: true
  },

  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    default: null
  },

  customerName: {
    type: String,
    required: true,
    trim: true
  },

  customerEmail: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },

  items: {
    type: [orderItemSchema],
    validate: {
      validator: items => items.length > 0,
      message: 'An order must contain at least one item'
    }
  },

  subtotal: {
    type: Number,
    required: true,
    min: 0
  },

  discount: {
    type: Number,
    default: 0,
    min: 0
  },

  tax: {
    type: Number,
    default: 0,
    min: 0
  },

  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },

  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },

  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'online', 'other'],
    default: 'other'
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },

  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },

  notes: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  }
}, {
  timestamps: true
})

orderSchema.index(
  { tenantId: 1, orderNumber: 1 },
  { unique: true }
)

orderSchema.index({ tenantId: 1, createdAt: -1 })
orderSchema.index({ tenantId: 1, orderStatus: 1 })

module.exports = mongoose.model('Order', orderSchema)
