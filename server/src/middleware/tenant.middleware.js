const mongoose = require('mongoose')
const Tenant = require('../models/Tenant')
const Membership = require('../models/Membership')

const verifyTenantAccess = async (req, res, next) => {
  try {
    const { tenantId } = req.params

    if (!mongoose.isValidObjectId(tenantId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid business ID'
      })
    }

    const tenant = await Tenant.findOne({
      _id: tenantId,
      isActive: true
    })

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      })
    }

    const membership = await Membership.findOne({
      userId: req.user._id,
      tenantId: tenant._id,
      status: 'active'
    })

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this business'
      })
    }

    req.tenant = tenant
    req.membership = membership

    next()

  } catch (error) {
    console.error('Tenant access error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to verify business access'
    })
  }
}

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.membership || !roles.includes(req.membership.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      })
    }

    next()
  }
}

module.exports = {
  verifyTenantAccess,
  authorizeRoles
}