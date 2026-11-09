const mongoose = require('mongoose')
const Customer = require('../../models/Customer')

const normalizeAddress = (address = {}) => ({
  street: (address.street || '').trim(),
  city: (address.city || '').trim(),
  state: (address.state || '').trim(),
  postalCode: (address.postalCode || '').trim(),
  country: (address.country || 'India').trim()
})

const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      tenantId: req.tenant._id,
      isActive: true
    }).sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    })
  } catch (error) {
    console.error('Get customers error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch customers'
    })
  }
}

const getCustomerById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      })
    }

    const customer = await Customer.findOne({
      _id: req.params.customerId,
      tenantId: req.tenant._id,
      isActive: true
    })

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      })
    }

    return res.status(200).json({
      success: true,
      data: customer
    })
  } catch (error) {
    console.error('Get customer error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to fetch customer'
    })
  }
}

const createCustomer = async (req, res) => {
  try {
    const {
      name,
      email = '',
      phone = '',
      address = {}
    } = req.body

    if (typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      })
    }

    if (
      typeof email !== 'string' ||
      typeof phone !== 'string' ||
      !address ||
      typeof address !== 'object' ||
      Array.isArray(address)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer details'
      })
    }

    const normalizedEmail = email.trim().toLowerCase()

    if (
      normalizedEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      })
    }

    if (normalizedEmail) {
      const existingCustomer = await Customer.findOne({
        tenantId: req.tenant._id,
        email: normalizedEmail,
        isActive: true
      })

      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message: 'A customer with this email already exists'
        })
      }
    }

    const customer = await Customer.create({
      tenantId: req.tenant._id,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      address: normalizeAddress(address)
    })

    return res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer
    })
  } catch (error) {
    console.error('Create customer error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to create customer'
    })
  }
}

const updateCustomer = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      })
    }

    const allowedFields = ['name', 'email', 'phone']
    const updates = {}

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== 'string') {
          return res.status(400).json({
            success: false,
            message: `${field} must be a string`
          })
        }

        updates[field] = req.body[field].trim()
      }
    }

    if (req.body.address !== undefined) {
      if (
        !req.body.address ||
        typeof req.body.address !== 'object' ||
        Array.isArray(req.body.address)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Address must be an object'
        })
      }

      updates.address = normalizeAddress(req.body.address)
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one customer field to update'
      })
    }

    if (updates.name !== undefined && !updates.name) {
      return res.status(400).json({
        success: false,
        message: 'Customer name cannot be empty'
      })
    }

    if (updates.email !== undefined) {
      updates.email = updates.email.toLowerCase()

      if (
        updates.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email address'
        })
      }

      if (updates.email) {
        const duplicate = await Customer.findOne({
          tenantId: req.tenant._id,
          email: updates.email,
          isActive: true,
          _id: { $ne: req.params.customerId }
        })

        if (duplicate) {
          return res.status(409).json({
            success: false,
            message: 'A customer with this email already exists'
          })
        }
      }
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.customerId,
        tenantId: req.tenant._id,
        isActive: true
      },
      { $set: updates },
      {
        new: true,
        runValidators: true
      }
    )

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Customer updated successfully',
      data: customer
    })
  } catch (error) {
    console.error('Update customer error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to update customer'
    })
  }
}

const deleteCustomer = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.customerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      })
    }

    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.customerId,
        tenantId: req.tenant._id,
        isActive: true
      },
      { $set: { isActive: false } },
      { new: true }
    )

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Customer deactivated successfully',
      data: customer
    })
  } catch (error) {
    console.error('Delete customer error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to deactivate customer'
    })
  }
}

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
}