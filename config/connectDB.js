const fs = require('fs');
const mysql  = require ('mysql2')
require('dotenv').config()
const serverCa = [fs.readFileSync("config/key/DigiCertGlobalRootCA.crt.pem", "utf8")]

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: true,
        ca: serverCa
    }
})

connection.connect(function(err){
    if (err) throw err
    else console.log("Azure SQL database connected")
})

module.exports = connection