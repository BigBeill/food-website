const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
   userId: String,
   encryptedString: String,
   createdAt: { type: Date, default: Date.now, expires: '30min' },
});

module.exports = mongoose.model('PasswordReset', passwordResetSchema);