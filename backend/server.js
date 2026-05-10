require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');

const authRoutes = require('./routes/auth');
const analyzeRoutes = require('./routes/analyze');
const consultationRoutes = require('./routes/consultations');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Initialize DB tables
initDB().catch(err => console.error('DB init error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/consultations', consultationRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`HomeoAI backend running on port ${PORT}`);
  });
}

module.exports = app;
