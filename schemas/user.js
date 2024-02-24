const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    hash: String,
    salt: String
})

module.exports = mongoose.model("user", userSchema)