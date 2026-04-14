const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'homeoai.db');
const db = new Database(dbPath);

try {
  const users = db.prepare('SELECT id, name, email, role FROM users').all();
  console.log(JSON.stringify(users, null, 2));
} catch (err) {
  console.error('Error reading users:', err.message);
} finally {
  db.close();
}
