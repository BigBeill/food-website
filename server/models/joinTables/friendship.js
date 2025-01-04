const mongoose = require('mongoose');

const friendshipSchema = new mongoose.Schema({
   friendIds: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
      validate: [ (val) => { return val.length === 2 }, 'friends must have exactly 2 users' ]
   }
}, { timestamps: true });

module.exports = mongoose.model('friendship', friendshipSchema);