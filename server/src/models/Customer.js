
const mongoose = require('mongoose')

const customerSchema = new mongoose.Schema({
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
    maxlength: 100
  },

  email: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 254,
    default: ''
  },

  phone: {
    type: String,
    trim: true,
    maxlength: 20,
    default: ''
  },

  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    country: { type: String, default: 'India' }
  },

  totalOrders: {
    type: Number,
    default: 0,
    min: 0
  },

  totalSpent: {
    type: Number,
    default: 0,
    min: 0
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

customerSchema.index({ tenantId: 1, email: 1 })

module.exports = mongoose.model('Customer', customerSchema)
