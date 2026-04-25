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

## Setup

1. Configure PostgreSQL in `.env`
2. Run `composer install`
3. Run `php artisan key:generate`
4. Run `php artisan migrate:fresh --seed`
5. Run `php artisan serve`

## Notes

- The current `.env` expects PostgreSQL at `127.0.0.1:5432`
- Sanctum is enabled for API token auth
- Teacher note upload is implemented with local file storage
- The AI generation and essay evaluation logic is deterministic demo logic that can later be swapped for real services
- Bangladesh-only dummy data is generated for multi-tenant institutes, users, billing, live classes, attendance, reporting, and analytics use cases
