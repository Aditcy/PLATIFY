
const express = require('express')

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('./product.controller')

const { protect } = require('../../middleware/auth.middleware')
const { verifyTenantAccess } = require('../../middleware/tenant.middleware')

const router = express.Router({ mergeParams: true })

router.use(protect, verifyTenantAccess)

router.route('/')
  .get(getProducts)
  .post(createProduct)

router.route('/:productId')
  .put(updateProduct)
  .delete(deleteProduct)

module.exports = router
