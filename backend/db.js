const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon') ? { rejectUnauthorized: false } : false
});

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'patient',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      chief_complaint TEXT,
      form_data TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      top_remedies TEXT NOT NULL,
      constitutional_profile TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);
  console.log('Database initialized successfully.');
};

module.exports = {
  pool,
  initDB
};
