
const express = require('express')

const {
  createTenant,
  getMyTenants
} = require('./tenant.controller')

const { protect } = require('../../middleware/auth.middleware')

const router = express.Router()

router.post('/', protect, createTenant)
router.get('/my-businesses', protect, getMyTenants)

module.exports = router
