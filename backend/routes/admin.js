const express = require('express');
const { verifyToken } = require('./auth');
const { pool } = require('../db');

const router = express.Router();

// Admin-only middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

router.use(verifyToken);
router.use(requireAdmin);

// GET /api/admin/stats — dashboard overview numbers
router.get('/stats', async (req, res) => {
  try {
    const usersResult = await pool.query('SELECT COUNT(*) AS count FROM users');
    const consultResult = await pool.query('SELECT COUNT(*) AS count FROM consultations');
    const todayResult = await pool.query(
      "SELECT COUNT(*) AS count FROM consultations WHERE created_at >= CURRENT_DATE"
    );
    const rolesResult = await pool.query(
      "SELECT role, COUNT(*) AS count FROM users GROUP BY role ORDER BY count DESC"
    );

    res.json({
      totalUsers: parseInt(usersResult.rows[0].count),
      totalConsultations: parseInt(consultResult.rows[0].count),
      consultationsToday: parseInt(todayResult.rows[0].count),
      usersByRole: rolesResult.rows.map(r => ({ role: r.role, count: parseInt(r.count) }))
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/users — all users with consultation counts
router.get('/users', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             COUNT(c.id) AS consultation_count
      FROM users u
      LEFT JOIN consultations c ON c.user_id = u.id
      GROUP BY u.id, u.name, u.email, u.role, u.created_at
      ORDER BY u.created_at DESC
    `);

    res.json(result.rows.map(r => ({
      ...r,
      consultation_count: parseInt(r.consultation_count)
    })));
  } catch (err) {
    console.error('Admin users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// GET /api/admin/consultations — all consultations with user info
router.get('/consultations', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.id, c.chief_complaint, c.top_remedies, c.constitutional_profile,
             c.created_at, c.form_data, c.ai_response,
             u.name AS user_name, u.email AS user_email
      FROM consultations c
      JOIN users u ON u.id = c.user_id
      ORDER BY c.created_at DESC
    `);

    const consultations = result.rows.map(r => ({
      ...r,
      form_data: JSON.parse(r.form_data),
      ai_response: JSON.parse(r.ai_response),
      top_remedies: JSON.parse(r.top_remedies)
    }));

    res.json(consultations);
  } catch (err) {
    console.error('Admin consultations error:', err);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

module.exports = router;
