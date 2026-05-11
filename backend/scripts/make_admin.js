/**
 * Make a user an admin by email address.
 *
 * Usage:
 *   DATABASE_URL=<your_pg_url> node scripts/make_admin.js <email>
 *
 * Example:
 *   DATABASE_URL=postgresql://... node scripts/make_admin.js admin@homeoai.com
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon') ? { rejectUnauthorized: false } : false
});

async function makeAdmin() {
  const email = process.argv[2];

  if (!email) {
    console.error('Usage: node scripts/make_admin.js <email>');
    console.error('Example: node scripts/make_admin.js admin@homeoai.com');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL environment variable is not set.');
    console.error('Set it in backend/.env or pass it inline:');
    console.error('  DATABASE_URL=postgresql://... node scripts/make_admin.js <email>');
    process.exit(1);
  }

  try {
    // Check if user exists
    const check = await pool.query('SELECT id, name, email, role FROM users WHERE email = $1', [email]);

    if (check.rows.length === 0) {
      console.error(`No user found with email: ${email}`);

      // Show all users for reference
      const all = await pool.query('SELECT name, email, role FROM users ORDER BY created_at DESC LIMIT 10');
      if (all.rows.length > 0) {
        console.log('\nExisting users:');
        all.rows.forEach(u => console.log(`  ${u.name} (${u.email}) — ${u.role}`));
      }
      process.exit(1);
    }

    const user = check.rows[0];

    if (user.role === 'admin') {
      console.log(`${user.name} (${user.email}) is already an admin.`);
      process.exit(0);
    }

    // Promote to admin
    await pool.query('UPDATE users SET role = $1 WHERE email = $2', ['admin', email]);
    console.log(`Successfully promoted ${user.name} (${user.email}) to admin!`);

  } catch (err) {
    console.error('Database error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

makeAdmin();
