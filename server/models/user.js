const mongoose = require('mongoose')
const ImageSchema = require('./image');

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    bio: String,
    image: { type: ImageSchema, default: null },
    hash: {type: String, select: false},
    salt: {type: String, select: false}
}, { timestamps: true });

module.exports = mongoose.model("user", userSchema)