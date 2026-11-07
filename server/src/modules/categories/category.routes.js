
const express = require('express')

const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('./category.controller')

const { protect } = require('../../middleware/auth.middleware')
const { verifyTenantAccess } = require('../../middleware/tenant.middleware')

const router = express.Router({ mergeParams: true })

router.use(protect, verifyTenantAccess)

router.route('/')
  .get(getCategories)
  .post(createCategory)

router.route('/:categoryId')
  .put(updateCategory)
  .delete(deleteCategory)

module.exports = router
