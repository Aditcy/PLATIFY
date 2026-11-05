
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 60
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 254
  },

  passwordHash: {
    type: String,
    required: true,
    select: false
  },

  platformRole: {
    type: String,
    enum: ['user', 'platform_admin'],
    default: 'user'
  },

  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12

  this.passwordHash = await bcrypt.hash(
    this.passwordHash,
    saltRounds
  )
})

// Verify password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash)
}

module.exports = mongoose.model('User', userSchema)
