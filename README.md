# HomeoAI -- AI-Powered Homeopathic Remedy Finder

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-brightgreen)](https://homeoai-frontend.vercel.app)

An AI-powered homeopathic analysis tool that uses **Google Gemini** to suggest classical homeopathic remedies based on a detailed symptom intake form. The system follows traditional case-taking methodology from Kent's Repertory, Boericke's Materia Medica, and Organon of Medicine.

> **Disclaimer:** This is an educational tool only and does not replace professional medical advice.

## Features

- **Multi-step consultation form** -- 4-step wizard covering:
  - Basic Info (age, gender, chief complaint, duration)
  - Mental & Emotional (mood, fears, anxiety triggers, sleep quality/position, dreams)
  - Physical Generals (thermal sensitivity, thirst, sweat, food cravings/aversions, time of aggravation)
  - Particular Complaints (location, sensations, modalities -- better from/worse from, associated symptoms)
- **AI-powered analysis** via Google Gemini -- sends symptom totality and returns constitutional profile + remedy recommendations with match strength indicators
- **User authentication** -- register/login with JWT-based sessions, role selection (Patient or Practitioner)
- **Consultation history** -- browse past consultations with search and filter by complaint or remedy name, paginated results
- **PDF report generation** -- download branded PDF reports from results or history
- **Protected routes** -- consultation, results, and history require authentication
- **Responsive design** with mobile hamburger menu
- **Animated loading experience** with rotating contextual messages during AI analysis

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS 4 |
| Routing | React Router v7 |
| HTTP Client | Axios (with JWT interceptor) |
| PDF Generation | jsPDF |
| Backend | Node.js, Express 5 |
| Database | SQLite (better-sqlite3) |
| Authentication | JWT + bcryptjs |
| AI Engine | Google Gemini Flash (latest) |

## Project Structure

```
homeoai/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── db.js                  # SQLite database setup
│   ├── routes/
│   │   ├── auth.js            # Registration, login, JWT
│   │   ├── analyze.js         # Gemini AI symptom analysis
│   │   └── consultations.js   # Save/retrieve consultations
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Root component with routes
│   │   ├── pages/
│   │   │   ├── Landing.jsx    # Home page
│   │   │   ├── Auth.jsx       # Login/Register
│   │   │   ├── Consult.jsx    # Multi-step consultation form
│   │   │   ├── Result.jsx     # AI analysis results
│   │   │   ├── History.jsx    # Past consultations
│   │   │   └── NotFound.jsx   # 404 page
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StepProgressBar.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   └── api/
│   │       └── axios.js       # Axios instance with interceptor
│   ├── package.json
│   └── index.html
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- A [Google Gemini API key](https://aistudio.google.com/apikey)

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=your_jwt_secret_here
PORT=3001
```

Start the backend server:
```bash
node server.js
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## How It Works

1. **Sign up** as a Patient or Practitioner
2. **Fill out the consultation form** -- 4 steps covering mental, emotional, and physical symptoms
3. **AI analyzes your symptoms** -- the form data is sent to Google Gemini with a detailed system prompt trained on classical homeopathic principles
4. **View your results** -- constitutional profile and top 2-3 remedy suggestions with match strength and reasoning
5. **Save and revisit** -- consultations are stored in the database and can be reviewed or exported as PDF

## Screenshots

*Screenshots coming soon*

## License

MIT
