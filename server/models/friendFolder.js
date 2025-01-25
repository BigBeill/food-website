const mongoose = require('mongoose');

const friendFolderSchema = new mongoose.Schema({
   owner: mongoose.SchemaTypes.ObjectId,
   title: String,
   contents: {
      type: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'user' }],
      validate: [limitSize, 'Folder contents must be less than 3 users']
   }
});

function limitSize(val) {
   return val.length <= 3;
}

module.exports = mongoose.model("friendFolder", friendFolderSchema);