const mongoose = require('mongoose')

const tenantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },

  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  },

  businessType: {
    type: String,
    trim: true,
    maxlength: 60
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    maxlength: 254
  },

  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },

  address: {
    type: String,
    trim: true,
    maxlength: 300
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Tenant', tenantSchema)