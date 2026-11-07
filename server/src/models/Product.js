
const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true
  },

  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },

  description: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },

  sku: {
    type: String,
    required: true,
    trim: true,
    uppercase: true
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  costPrice: {
    type: Number,
    default: 0,
    min: 0
  },

  stockQuantity: {
    type: Number,
    default: 0,
    min: 0
  },

  lowStockThreshold: {
    type: Number,
    default: 5,
    min: 0
  },

  images: [{
    type: String
  }],

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

productSchema.index(
  { tenantId: 1, sku: 1 },
  { unique: true }
)

productSchema.index({ tenantId: 1, categoryId: 1 })

module.exports = mongoose.model('Product', productSchema)
