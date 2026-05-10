const express = require('express');
const { verifyToken } = require('./auth');
const { pool } = require('../db');

const router = express.Router();

router.use(verifyToken);

router.post('/save', async (req, res) => {
  const { form_data, ai_response, top_remedies, constitutional_profile, chief_complaint } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO consultations
       (user_id, chief_complaint, form_data, ai_response, top_remedies, constitutional_profile)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        req.user.id,
        chief_complaint,
        JSON.stringify(form_data),
        JSON.stringify(ai_response),
        JSON.stringify(top_remedies),
        constitutional_profile
      ]
    );

    res.status(201).json({ message: "Saved", id: result.rows[0].id });
  } catch (error) {
    console.error('Failed to save consultation', error);
    res.status(500).json({ error: 'Failed to save consultation' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM consultations WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    const consultations = result.rows.map(r => ({
      ...r,
      form_data: JSON.parse(r.form_data),
      ai_response: JSON.parse(r.ai_response),
      top_remedies: JSON.parse(r.top_remedies)
    }));

    res.json(consultations);
  } catch (error) {
    console.error('Failed to fetch consultations', error);
    res.status(500).json({ error: 'Failed to fetch consultations' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM consultations WHERE user_id = $1 AND id = $2',
      [req.user.id, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    const row = result.rows[0];
    const consultation = {
      ...row,
      form_data: JSON.parse(row.form_data),
      ai_response: JSON.parse(row.ai_response),
      top_remedies: JSON.parse(row.top_remedies)
    };

    res.json(consultation);
  } catch (error) {
    console.error('Failed to fetch consultation', error);
    res.status(500).json({ error: 'Failed to fetch consultation' });
  }
});

module.exports = router;
