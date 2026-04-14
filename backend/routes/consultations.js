const express = require('express');
const { verifyToken } = require('./auth');
const { db } = require('../db');

const router = express.Router();

router.use(verifyToken);

router.post('/save', (req, res) => {
  const { form_data, ai_response, top_remedies, constitutional_profile, chief_complaint } = req.body;
  
  try {
    const info = db.prepare(`
      INSERT INTO consultations 
      (user_id, chief_complaint, form_data, ai_response, top_remedies, constitutional_profile)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      req.user.id,
      chief_complaint,
      JSON.stringify(form_data),
      JSON.stringify(ai_response),
      JSON.stringify(top_remedies),
      constitutional_profile
    );

    res.status(201).json({ message: "Saved", id: info.lastInsertRowid });
  } catch (error) {
    console.error('Failed to save consultation', error);
    res.status(500).json({ error: 'Failed to save consultation' });
  }
});

router.get('/', (req, res) => {
  try {
    const rows = db.prepare(`
      SELECT * FROM consultations WHERE user_id = ? ORDER BY created_at DESC
    `).all(req.user.id);

    // Parse back the JSON strings for the client
    const consultations = rows.map(r => ({
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

router.get('/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT * FROM consultations WHERE user_id = ? AND id = ?
    `).get(req.user.id, req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

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
