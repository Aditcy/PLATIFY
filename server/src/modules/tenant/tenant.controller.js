const mongoose = require('mongoose')
const Tenant = require('../../models/Tenant')
const Membership = require('../../models/Membership')
const { createTenantSchema } = require('./tenant.validation')

const createTenant = async (req, res) => {
  const validation = createTenantSchema.safeParse(req.body)

  if (!validation.success) {
    return res.status(400).json({
      success: false,
      message: 'Invalid business details',
      errors: validation.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    })
  }

  const { name, businessType, email, phone, address } = validation.data

  const slug = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  if (!slug) {
    return res.status(400).json({
      success: false,
      message: 'Business name must contain letters or numbers'
    })
  }

  const session = await mongoose.startSession()

  try {
    let createdTenant

    await session.withTransaction(async () => {
      const [tenant] = await Tenant.create([{
        name,
        slug,
        businessType,
        email,
        phone,
        address
      }], { session })

      await Membership.create([{
        userId: req.user._id,
        tenantId: tenant._id,
        role: 'owner',
        status: 'active'
      }], { session })

      createdTenant = tenant
    })

    return res.status(201).json({
      success: true,
      message: 'Business created successfully',
      business: {
        id: createdTenant._id,
        name: createdTenant.name,
        slug: createdTenant.slug,
        businessType: createdTenant.businessType
      },
      membership: {
        role: 'owner',
        status: 'active'
      }
    })

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A business with this URL already exists'
      })
    }

    console.error('Business creation error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Business creation failed'
    })

  } finally {
    await session.endSession()
  }
}
const getMyTenants = async (req, res) => {
  try {
    const memberships = await Membership.find({
      userId: req.user._id,
      status: 'active'
    }).populate({
      path: 'tenantId',
      match: { isActive: true },
      select: 'name slug businessType'
    })

    const businesses = memberships
      .filter(membership => membership.tenantId)
      .map(membership => ({
        id: membership.tenantId._id,
        name: membership.tenantId.name,
        slug: membership.tenantId.slug,
        businessType: membership.tenantId.businessType,
        role: membership.role
      }))

    return res.status(200).json({
      success: true,
      count: businesses.length,
      businesses
    })

  } catch (error) {
    console.error('Business retrieval error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve businesses'
    })
  }
}
module.exports = { createTenant, getMyTenants }
