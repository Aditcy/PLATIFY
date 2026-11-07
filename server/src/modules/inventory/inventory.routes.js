const express = require('express')

const {
  getInventorySummary,
  getStockMovements,
  adjustStock
} = require('./inventory.controller')

const { protect } = require('../../middleware/auth.middleware')
const {
  verifyTenantAccess,
  authorizeRoles
} = require('../../middleware/tenant.middleware')

const router = express.Router({ mergeParams: true })

router.use(protect, verifyTenantAccess)

router.get('/summary', getInventorySummary)
router.get('/movements', getStockMovements)

router.post(
  '/adjustments',
  authorizeRoles('owner', 'manager', 'staff'),
  adjustStock
)

module.exports = router