const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'homeoai.db');
const db = new Database(dbPath, { verbose: console.log });

const initDB = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'patient',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS consultations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      chief_complaint TEXT,
      form_data TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      top_remedies TEXT NOT NULL,
      constitutional_profile TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
  console.log('Database initialized successfully.');
};

module.exports = {
  db,
  initDB
};
