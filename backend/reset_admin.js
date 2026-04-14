const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.resolve(__dirname, 'homeoai.db');
const db = new Database(dbPath);

async function resetAdminPassword() {
  const email = 'admin@homeoai.com';
  const newPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  try {
    const result = db.prepare('UPDATE users SET password = ? WHERE email = ?').run(hashedPassword, email);
    if (result.changes > 0) {
      console.log(`Password for ${email} has been reset to: ${newPassword}`);
    } else {
      console.log(`User ${email} not found.`);
    }
  } catch (err) {
    console.error('Error updating password:', err.message);
  } finally {
    db.close();
  }
}

resetAdminPassword();
