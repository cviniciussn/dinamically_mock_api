const { query } = require('./db');

async function migrate() {
  await query(`
    CREATE TABLE IF NOT EXISTS mock_routes (
      id SERIAL PRIMARY KEY,
      method VARCHAR(10) NOT NULL,
      path VARCHAR(500) NOT NULL,
      status_code INTEGER NOT NULL DEFAULT 200,
      response_body TEXT NOT NULL DEFAULT '{}',
      content_type VARCHAR(100) NOT NULL DEFAULT 'application/json',
      delay_ms INTEGER NOT NULL DEFAULT 0,
      description VARCHAR(500) DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(method, path)
    )
  `);
  console.log('Migration complete.');
}

module.exports = { migrate };
