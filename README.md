# Smart LMS - Full Project Setup Guide (Windows/macOS/Linux)

This guide explains:
- What this project is
- Project structure
- Requirements
- How to install and run on **Windows**, **macOS**, and **Linux**
- Common troubleshooting

## 1) Project Overview

Smart LMS is a full-stack, multi-tenant Learning Management System.

- **Frontend:** Next.js (React + TypeScript + Tailwind)
- **Backend:** Laravel (PHP)
- **Database:** SQLite (easy local setup) or PostgreSQL (production-like setup)
- **Auth/API:** Laravel API endpoints under `/api/v1/...`
- **Main roles:** Admin, Teacher, Student

### Core Features
- Authentication and role-based access
- Course management
- Enrollment management
- Teacher assignment
- Assessments and grading flows
- Live class and reporting modules
- Multi-tenant branding and workspace behavior

## 2) Project Structure

```text
LMS-FINAL-G/
├── frontend/              # Next.js frontend app
├── backend/               # Laravel backend app
├── package.json           # Root workspace scripts
├── README-multitenancy.md # Tenant test notes
└── README-SETUP.md        # This file
```

## 3) Requirements

Install these first:

- **Node.js**: 18+ (recommended 20 LTS)
- **npm**: comes with Node.js
- **PHP**: 8.2+
- **Composer**: latest stable
- Optional for PostgreSQL mode:
  - PostgreSQL 14+ (or Docker)

Check versions:

```bash
node -v
npm -v
php -v
composer -V
```

## 4) Quick Start (Recommended: SQLite)

Run from project root (`LMS-FINAL-G`):

```bash
npm install
cd backend
composer install
cp .env.example .env
php artisan key:generate
mkdir -p database
touch database/database.sqlite
```

Set DB in `backend/.env`:

```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

Then run migration + seed:

```bash
php artisan migrate:fresh --seed
cd ..
npm run dev
```

### App URLs
- Frontend: `http://localhost:3000` (or next available port like 3001)
- Backend: `http://127.0.0.1:8000`

## 5) Demo Credentials

Use these for login:

- Admin: `admin@example.com` / `password123`
- Teacher: `teacher@example.com` / `password123`
- Student: `student@example.com` / `password123`

## 6) Platform-Specific Notes

### Windows (PowerShell)

#### Copy env file
```powershell
Copy-Item .\backend\.env.example .\backend\.env
```

#### Create SQLite file
```powershell
New-Item -Path .\backend\database\database.sqlite -ItemType File -Force
```

#### Run
```powershell
npm install
cd .\backend
composer install
php artisan key:generate
php artisan migrate:fresh --seed
cd ..
npm run dev
```

### macOS / Linux (Terminal)

```bash
npm install
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate:fresh --seed
cd ..
npm run dev
```

## 7) PostgreSQL Setup (Optional)

Use this if you want production-like DB behavior.

Set `backend/.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=smart_lms_db
DB_USERNAME=postgres
DB_PASSWORD=your_password
```

Then:

```bash
cd backend
php artisan migrate:fresh --seed
cd ..
npm run dev
```

If using Docker:

```bash
cd backend
docker compose -f docker-compose.postgres.yml up -d
```

## 8) Useful Commands

From project root:

```bash
# Run frontend + backend together
npm run dev

# Only frontend
npm run dev:frontend

# Only backend
npm run dev:backend
```

Backend tests:

```bash
cd backend
php artisan test
```

Frontend lint:

```bash
npm run lint --workspace=frontend
```

## 9) Common Troubleshooting

### A) `Server Error` on login
- Check `backend/storage/logs/laravel.log`
- Most common cause: DB config mismatch in `backend/.env`
- Re-run:
```bash
cd backend
php artisan config:clear
php artisan cache:clear
php artisan migrate:fresh --seed
```

### B) `concurrently: command not found`
Run:
```bash
npm install
```

### C) Port already in use (3000 or 8000)
- Stop old processes, or run on next free port automatically.
- Frontend usually auto-switches (`3001`, `3002`, etc.).

### D) Teacher count / course assignment mismatch
- Ensure DB is seeded with latest migrations:
```bash
cd backend
php artisan migrate:fresh --seed
```

## 10) Multi-tenant Local Testing

See:
- `README-multitenancy.md`

That file includes tenant URL and host mapping notes.

---

If you want, I can also create a shorter `README.md` version for new developers and keep this one as a full installation manual.
