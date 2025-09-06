const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
   userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
   encryptedString: { type: String, required: true },
   createdAt: { type: Date, default: Date.now, expires: 1800 }, // expires after 30 minutes
});

module.exports = mongoose.model('PasswordReset', passwordResetSchema);