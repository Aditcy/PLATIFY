const mongoose = require('mongoose')
const express = require('express')
const cors = require('cors')
const app = express()
const authRoutes = require('./auth/auth.routes')
const tenantRoutes = require('./modules/tenant/tenant.routes')

app.use(cors({
  origin: 'http://localhost:5173'
}))

app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/tenants', tenantRoutes)

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
