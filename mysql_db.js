const mysql = require('mysql2/promise');

async function connectDB() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'mindspace_db'
    });
    console.log('MySQL connected...');
    return connection;
  } catch (err) {
    console.error('MySQL connection error:', err);
    throw err;
  }
}

module.exports = { connectDB };