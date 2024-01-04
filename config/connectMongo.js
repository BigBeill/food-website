const { MongoClient, ServerApiVersion } = require('mongodb')
require('dotenv').config()
const uri = "mongodb+srv://BigBeill:"+ process.env.MONGO_DB_PASSWORD +"@beillsgreenhouse.oull8qn.mongodb.net/?retryWrites=true&w=majority"

const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

run()
async function run() {
    try {
        console.log("attempting to connect to mongo")
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        console.log("closing connection to MongoDB")
        await client.close();
    }
}

module.exports = client