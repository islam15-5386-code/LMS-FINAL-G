#!/usr/bin/env bash
set -euo pipefail

cat <<'EOF'

Betopia LMS Dev Container is ready.

Run the full stack:
  cd /workspaces/project/backend && php artisan serve --host=0.0.0.0 --port=8000
  cd /workspaces/project && npm run dev -- --hostname 0.0.0.0 --port 3010

Frontend:
  http://127.0.0.1:3010

Backend:
  http://127.0.0.1:8000

PostgreSQL service:
  host=postgres port=5432 db=betopia_lms user=postgres password=postgres

EOF
