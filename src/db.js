const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'mockserver',
  user: process.env.DB_USER || 'mockserver',
  password: process.env.DB_PASSWORD || 'mockserver',
});

async function query(text, params) {
  return pool.query(text, params);
}

async function waitForConnection(retries = 10, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.query('SELECT 1');
      console.log('Database connected.');
      return;
    } catch (err) {
      console.log(`Waiting for database... (${i + 1}/${retries})`);
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
  throw new Error('Could not connect to database after retries.');
}

module.exports = { pool, query, waitForConnection };
