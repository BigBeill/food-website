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

//make connection accessible to the server
module.exports = connection


/*
const uri = "mongodb+srv://BigBeill:" + process.env.MONGO_DB_PASSWORD + "@beillsgreenhouse.oull8qn.mongodb.net/?retryWrites=true&w=majority"

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
      await client.close();
    }
  }
  run().catch(console.dir);

  */