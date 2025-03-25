const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

// Database connection configuration
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to create users table if not exists
const initializeDatabase = async () => {
  try {
    const connection = await db.getConnection();
    connection.release();
    console.log('Database connected succesfully');
  } catch (error) {
    console.error('Database initialization error:', error);
  }
};

module.exports = {
  db,
  initializeDatabase
};