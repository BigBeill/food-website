const mongoose = require('mongoose');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

//connect to mongoDB using link
const mongoLink = "mongodb+srv://BigBeill:" + process.env.MONGO_DB_PASSWORD + "@beillsgreenhouse.oull8qn.mongodb.net/?retryWrites=true&w=majority"
const connection = mongoose.createConnection(mongoLink)

//confirm connection has been made
if (connection) {
  console.log("Mongoose database connected")
}

const UserSchema = new mongoose.Schema({
  username: String,
  hash: String,
  salt: String
})

const User = connection.model('User', UserSchema)

//make connection accessible to the server
module.exports = connection