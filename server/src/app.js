const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')

const app = express()

const authRoutes = require('./auth/auth.routes')
const tenantRoutes = require('./modules/tenant/tenant.routes')
const analyticsRoutes = require('./modules/analytics/analytics.routes')
const productRoutes = require('./modules/products/product.routes')
const categoryRoutes = require('./modules/categories/category.routes')
const inventoryRoutes = require('./modules/inventory/inventory.routes')
const orderRoutes = require('./modules/orders/order.routes')
const customerRoutes = require('./modules/customers/customer.routes')
app.use(cors({
  origin: 'http://localhost:5173'
}))

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/tenants', tenantRoutes)
app.use('/api/tenants/:tenantId/products', productRoutes)
app.use('/api/tenants/:tenantId/categories', categoryRoutes)
app.use('/api/tenants/:tenantId/inventory', inventoryRoutes)
app.use(
  '/api/tenants/:tenantId/analytics',
  analyticsRoutes
)
app.use('/api/tenants/:tenantId/orders', orderRoutes)
app.use('/api/tenants/:tenantId/customers', customerRoutes)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'PLATIFY API is running successfully',
    application: 'PLATIFY',
    version: '1.0.0'
  })
})

app.get('/api/health/db', (req, res) => {
  const connected = mongoose.connection.readyState === 1

  res.status(connected ? 200 : 503).json({
    success: connected,
    database: connected ? 'connected' : 'disconnected',
    databaseName: mongoose.connection.name
  })
})

module.exports = app
