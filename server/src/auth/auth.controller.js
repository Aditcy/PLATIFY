
const User = require('../models/User')
const jwt = require('jsonwebtoken')
const { registerSchema, loginSchema } = require('./auth.validation')

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  )
}

const register = async (req, res) => {
  try {
    const validation = registerSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration details',
        errors: validation.error.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message
        }))
      })
    }

    const { name, email, password } = validation.data
    const normalizedEmail = email.toLowerCase()

    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      })
    }

    const user = new User({
      name,
      email: normalizedEmail,
      passwordHash: password
    })

    await user.save()

    const token = generateToken(user._id)

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        platformRole: user.platformRole
      }
    })

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists'
      })
    }

    console.error('Registration error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Registration failed'
    })
  }
}

const login = async (req, res) => {
  try {
    const validation = loginSchema.safeParse(req.body)

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid login details'
      })
    }

    const { email, password } = validation.data

    const user = await User.findOne({
      email: email.toLowerCase()
    }).select('+passwordHash')

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    const passwordMatches = await user.comparePassword(password)

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      })
    }

    const token = generateToken(user._id)

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        platformRole: user.platformRole
      }
    })

  } catch (error) {
    console.error('Login error:', error.message)

    return res.status(500).json({
      success: false,
      message: 'Login failed'
    })
  }
}

const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      platformRole: req.user.platformRole
    }
  })
}

module.exports = { register, login, getMe }