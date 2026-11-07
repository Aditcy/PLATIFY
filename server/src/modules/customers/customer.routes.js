const express = require('express')

const {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('./customer.controller')

const { protect } = require('../../middleware/auth.middleware')
const {
  verifyTenantAccess,
  authorizeRoles
} = require('../../middleware/tenant.middleware')

const router = express.Router({ mergeParams: true })

router.use(protect, verifyTenantAccess)

router.get('/', getCustomers)
router.get('/:customerId', getCustomerById)

router.post(
  '/',
  authorizeRoles('owner', 'manager', 'staff'),
  createCustomer
)

router.put(
  '/:customerId',
  authorizeRoles('owner', 'manager', 'staff'),
  updateCustomer
)

router.delete(
  '/:customerId',
  authorizeRoles('owner', 'manager'),
  deleteCustomer
)

module.exports = router