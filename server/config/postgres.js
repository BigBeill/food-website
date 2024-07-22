const { Pool } = require('pg');
require('dotenv').config()

const postgresConnection = new Pool({
  user: 'postgres',
  database: 'Canadian Nutrient File',
  password: process.env.POSTGRES_DB_PASSWORD,
  port: 5432, // Default PostgreSQL port
})

postgresConnection.connect((error, client, release) => {
  if (error) { return console.error('Error acquiring client', error.stack); }
  console.log('Connected to PostgreSQL');
  release();
});

// Export the pool instance for use in other files
module.exports = postgresConnection;