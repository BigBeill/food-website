const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    bio: String,
    hash: {type: String, select: false},
    salt: {type: String, select: false}
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema)