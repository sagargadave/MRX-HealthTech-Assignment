# Healthcare Monitoring Dashboard

A full-stack web app for doctors to manage patients, record biomarker test results, view trends on a chart, and download a PDF report.

## Features

- Doctor registration and login (JWT + bcrypt)
- Patient management: add, view, edit, delete, search, filter by gender
- Test record management: add, edit, delete (multiple biomarkers per patient)
- Patient dashboard: patient details, latest result, full history, biomarker trend chart
- Dashboard with summary counts and recent tests
- Report page with PDF download (chart included)
- Swagger API docs at `/api-docs`

## Tech Stack

| Part | Technology |
|---|---|
| Frontend | Angular 18, TypeScript, Angular Material, Chart.js (ng2-charts), jsPDF |
| Backend | Node.js, Express, TypeScript |
| Database | MySQL (`mysql2`) |
| Auth | JWT, bcrypt |

## Architecture

```
Angular (localhost:4200)  →  REST API / Express (localhost:4000)  →  MySQL
```

The frontend never talks to the database directly.

## Project Structure

```
healthcare-monitoring-dashboard/
├── backend/
│   ├── database/        # schema.sql, seed.sql
│   ├── docs/            # openapi.yaml (Swagger)
│   └── src/
│       ├── config/  controllers/  middleware/  routes/
│       ├── services/  validators/  utils/  types/
│       ├── app.ts
│       └── server.ts
└── frontend/
    └── src/app/
        ├── core/        # services, guard, interceptor, models
        ├── features/    # auth, dashboard, patients, test-records, reports
        ├── layout/      # sidebar + header
        └── shared/      # reusable components
```
## Getting Started

### 1. Clone

```bash
git clone https://github.com/sagargadave/MRX-HealthTech-Assignment
cd healthcare-monitoring-dashboard
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

Edit `backend/.env` and set your MySQL password:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=healthcare_monitoring
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=8h
PORT=4000
CLIENT_URL=http://localhost:4200
```

Create the database, tables, sample data and demo doctor:

```bash
npm run seed
```

Start the API:

```bash
npm run dev
```

The API runs at `http://localhost:4000` and the docs at `http://localhost:4000/api-docs`.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm start
```

Open `http://localhost:4200`.

## Demo Login

```
Email:    doctor@example.com
Password: Doctor@123
```

You can also create your own account on the **Register** page.

## API Overview

All endpoints are under `/api`. Everything except login and register needs `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/register` | Register a doctor |
| POST | `/auth/login` | Login, returns JWT |
| GET | `/auth/me` | Current user |
| GET / POST | `/patients` | List (search/filter) / create patient |
| GET / PUT / DELETE | `/patients/:id` | Get / update / delete patient |
| GET / POST | `/patients/:id/tests` | List / add test records for a patient |
| GET | `/patients/:id/biomarkers` | Biomarkers with results for a patient |
| GET | `/patients/:id/trends/:biomarkerId` | Trend data for the chart |
| GET | `/patients/:id/report` | Report data |
| GET | `/biomarkers` | All biomarkers |
| GET | `/test-records` | All test records |
| PUT / DELETE | `/test-records/:id` | Update / delete a test record |
| GET | `/dashboard/stats` | Summary counts |
| GET | `/dashboard/recent-tests` | Recent test records |

Search and filter example: `GET /api/patients?search=P00&gender=Female`

## Database

Tables: `users`, `patients`, `biomarkers`, `test_records`.

- One patient → many test records
- One biomarker → many test records
- Deleting a patient also deletes their test records (`ON DELETE CASCADE`)

## Scripts

| Location | Command | What it does |
|---|---|---|
| `backend` | `npm run seed` | Create tables + sample data + demo doctor |
| `backend` | `npm run dev` | Start API with auto-reload |
| `backend` | `npm run build` / `npm start` | Compile and run the API |
| `frontend` | `npm start` | Start Angular dev server |
| `frontend` | `npm run build` | Production build |
