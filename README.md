# AI Study Planner - MERN + Ollama

Modern full-stack study planner for a BCA 4th semester portfolio project.

## Features
- JWT auth (signup/login), bcrypt password hashing
- Dashboard with personalized welcome + productivity overview
- Task management: add/edit/delete, status, priority, filtering/sorting
- AI coach with local Ollama (`mistral`) chat + daily plan generation
- Charts tab with progress, completion split, and subject time distribution
- Settings page: update profile, theme toggle, reset all data
- Light/dark mode via Context API + localStorage persistence
- Responsive sidebar-based UI and reusable frontend architecture

## Project structure

### Backend (`server/src`)
- `controllers/`
- `routes/`
- `models/`
- `middleware/`
- `services/`
- `utils/`

### Frontend (`client/src`)
- `api/`
- `components/`
- `context/`
- `hooks/`
- `pages/`

## Local setup

### 1) Backend
```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 2) Frontend
```bash
cd client
npm install
npm run dev
```

## Environment
`server/.env`
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai_study_planner
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=mistral
JWT_SECRET=change_this_to_a_strong_secret
```

`client/.env` (optional)
```env
VITE_API_URL=http://localhost:5000/api
```

## Required services
- MongoDB running on local machine
- Ollama running locally with model pulled:
```bash
ollama pull mistral
```
