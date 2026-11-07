
const express = require('express')

const {
  getOverview,
  getRevenue,
  getOrderStatistics
} = require('./analytics.controller')

const { protect } = require('../../middleware/auth.middleware')

const {
  verifyTenantAccess
} = require('../../middleware/tenant.middleware')

const router = express.Router({ mergeParams: true })

router.use(protect, verifyTenantAccess)

router.get('/overview', getOverview)
router.get('/revenue', getRevenue)
router.get('/orders', getOrderStatistics)

module.exports = router
