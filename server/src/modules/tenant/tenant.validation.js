const { z } = require('zod')

const createTenantSchema = z.object({
  name: z.string().trim().min(2).max(100),
  businessType: z.string().trim().max(60).optional(),
  email: z.string().trim().email().max(254).optional(),
  phone: z.string().trim().max(20).optional(),
  address: z.string().trim().max(300).optional()
})

module.exports = { createTenantSchema }
