# AI-Powered Student Performance Prediction and Adaptive Study Planner

Serious academic full-stack project with supervised learning, multi-student tracking, class analytics, adaptive planning, and a data-aware chatbot.

## 1) Project folder structure

```text
ai-study-planner/
├── server/
│   ├── data/
│   │   └── student_performance_sample.csv
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── analyticsController.js
│   │   │   ├── coachController.js
│   │   │   ├── mlController.js
│   │   │   └── studentController.js
│   │   ├── models/
│   │   │   ├── PerformanceRecord.js
│   │   │   ├── StudyPlan.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── coachRoutes.js
│   │   │   ├── mlRoutes.js
│   │   │   └── studentRoutes.js
│   │   ├── services/
│   │   │   ├── mlService.js
│   │   │   └── planService.js
│   │   └── server.js
├── client/
│   └── src/
│       ├── components/Layout.jsx
│       ├── hooks/usePortalData.js
│       └── pages/
│           ├── DashboardPage.jsx
│           ├── PlannerPage.jsx
│           ├── TeacherAnalyticsPage.jsx
│           ├── StudentsPage.jsx
│           └── AiCoachPage.jsx
└── README.md
```

## 2) Backend overview (Node.js + Express + MongoDB)

- **Multi-user auth:** `student` and `teacher` roles with JWT.
- **Performance data API:** weekly records with features and real scores.
- **ML API:** train model from DB, predict scores, and persist adaptive study plans.
- **Teacher analytics API:** class average, weak students, subject-wise trend, student comparison.
- **Student data API:** list students and fetch profile snapshot.
- **Data-aware chatbot API:** recommendations grounded in actual student records and generated plan.

### Key backend endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/ml/seed-sample` (teacher-only, generates 100 records)
- `POST /api/ml/records` (student performance entry)
- `GET /api/ml/records`
- `GET /api/ml/predict`
- `GET /api/analytics/class` (teacher-only dashboard)
- `GET /api/students`
- `GET /api/students/:id`
- `POST /api/coach/chat`

## 3) Frontend overview (React + modern UI)

- **Role-aware navigation** (student vs teacher).
- **Student dashboard** with model metrics, prediction summary, and adaptive recommendation.
- **Adaptive Planner page** with weekly feature entry form and subject-level plan cards.
- **Teacher Analytics panel** with charts and weak-student list.
- **Student Comparison page** to inspect per-student records and generated plan.
- **Data-aware chatbot** that uses backend student data instead of generic responses.

## 4) ML implementation details (Supervised Learning)

### Features (X)

- `studyHours`
- `sleepHours`
- `attendance`
- `previousScore`
- `subjectDifficulty`
- `assignmentCompletion`

### Label (y)

- `score` (actual exam/performance score)

### Pipeline

1. Data preprocessing: min-max normalization per feature.
2. Model training: custom multivariate linear regression via gradient descent.
3. Evaluation:
   - MAE (mean absolute error)
   - R2 score
4. Inference:
   - Compute `predictedScore` for each student-subject record.
5. Action layer:
   - Build adaptive study plan that increases/decreases suggested weekly hours by predicted risk band.

## 5) Dataset

- Sample dataset file: `server/data/student_performance_sample.csv`
- Contains 60 records (within required 50-100 range).
- Columns include:
  - `student_id`
  - `subject`
  - `study_hours`
  - `sleep_hours`
  - `attendance`
  - `previous_score`
  - `predicted_score`

## 6) Run instructions

### Prerequisites

- Node.js 18+
- MongoDB running locally

### Backend

```bash
cd server
npm install
npm run dev
```

### Frontend

```bash
cd client
npm install
npm run dev
```

### Optional env

`server/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai_study_planner
JWT_SECRET=change_this_to_a_strong_secret
```

`client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

### First-time demo flow

1. Sign up as a teacher.
2. Open dashboard and click **Seed Dataset**.
3. Open teacher analytics and student comparison pages.
4. Sign up as a student and add weekly records.
5. Open planner and chatbot to see data-driven recommendations.
