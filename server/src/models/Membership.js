const mongoose = require('mongoose')

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },

  role: {
    type: String,
    enum: ['owner', 'manager', 'staff'],
    default: 'staff'
  },

  status: {
    type: String,
    enum: ['active', 'invited', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true
})

membershipSchema.index(
  { userId: 1, tenantId: 1 },
  { unique: true }
)

membershipSchema.index({ tenantId: 1, role: 1 })

module.exports = mongoose.model('Membership', membershipSchema)