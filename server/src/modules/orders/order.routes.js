const express = require('express')

const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} = require('./order.controller')

const { protect } = require('../../middleware/auth.middleware')
const {
  verifyTenantAccess,
  authorizeRoles
} = require('../../middleware/tenant.middleware')

const router = express.Router({ mergeParams: true })

router.use(protect, verifyTenantAccess)

router.get('/', getOrders)
router.get('/:orderId', getOrderById)

router.post(
  '/',
  authorizeRoles('owner', 'manager', 'staff'),
  createOrder
)

router.patch(
  '/:orderId/status',
  authorizeRoles('owner', 'manager', 'staff'),
  updateOrderStatus
)

module.exports = router