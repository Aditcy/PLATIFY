const mongoose = require('mongoose')

let connectionPromise = null

const ensureDatabaseConnection = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return next()
    }

    if (
      mongoose.connection.readyState === 0 ||
      mongoose.connection.readyState === 3
    ) {
      connectionPromise = null
    }

    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured')
    }

    if (!connectionPromise) {
      connectionPromise = mongoose.connect(process.env.MONGODB_URI).catch((error) => {
        connectionPromise = null
        throw error
      })
    }

    await connectionPromise

    next()
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`)

    res.status(503).json({
      success: false,
      message: 'Database connection unavailable'
    })
  }
}

module.exports = ensureDatabaseConnection