# Betopia LMS Backend

Laravel backend for the Betopia LMS frontend demo, built for PostgreSQL only.

## Folder map

- `app/Http/Controllers/Api`
  API endpoints grouped by feature:
  auth, branding, courses, assessments, live classes, compliance, certificates, billing, notifications, audit.
- `app/Models`
  Eloquent domain models and relationships, including enrollments, attendance, invoices, roles, and permissions.
- `app/Support/LmsSupport.php`
  Shared LMS business logic:
  plan matrix, fallback question bank, AI question generation, essay scoring, CSV export, payload serialization.
- `config/lms.php`
  LMS-specific configuration and frontend-compatible endpoints.
- `database/migrations`
  PostgreSQL schema for tenants, users, courses, lessons, enrollments, assessments, submissions, live classes, attendance, certificates, compliance, billing, invoices, notifications, audit, roles, and permissions.
- `database/seeders`
  Modular seeders:
  roles/permissions, tenants, users, courses, enrollments, assessments, live classes, billing, notifications, audit logs.
- `database/seeders/Support/BangladeshLmsDataset.php`
  Bangladesh-only realistic seed source for names, institutes, cities, courses, addresses, phones, and helper generators.
- `routes/api.php`
  Versioned API routes under `/api/v1/...` plus frontend-compatible teacher aliases under `/api/teacher/...`.

## Setup (PostgreSQL)

1. Start PostgreSQL (Docker option):
   - `docker compose -f docker-compose.postgres.yml up -d`
2. Configure PostgreSQL in `.env`:
   - `DB_CONNECTION=pgsql`
   - `DB_HOST=127.0.0.1`
   - `DB_PORT=5432`
   - `DB_DATABASE=smart_lms_db`
   - `DB_USERNAME=postgres`
   - `DB_PASSWORD=newpassword`
3. Run:
   - `composer install`
   - `php artisan key:generate`
   - `php artisan migrate --force`
4. Optional (preserve existing SQLite demo data):
   - `php artisan db:import-sqlite-to-pgsql --fresh`
5. Start backend:
   - `php artisan serve --host=127.0.0.1 --port=8000`

## Notes

- The current `.env` expects PostgreSQL at `127.0.0.1:5432`
- Sanctum is enabled for API token auth
- Teacher note upload is implemented with local file storage
- The AI generation and essay evaluation logic is deterministic demo logic that can later be swapped for real services
- Bangladesh-only dummy data is generated for multi-tenant institutes, users, billing, live classes, attendance, reporting, and analytics use cases
