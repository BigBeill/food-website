const mongoose = require('mongoose')
const user = require('./user')

const refreshTokenSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: user,
    required: true
  },
  token: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 30 // 30 days in seconds
  }
})

module.exports = mongoose.model("refreshToken", refreshTokenSchema)