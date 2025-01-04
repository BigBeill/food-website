const mongoose = require('mongoose');

const friendRequestSchema = new mongoose.Schema({
   senderId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
   receiverId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'}
}, { timestamps: true });

module.exports = mongoose.model('friendRequest', friendRequestSchema);