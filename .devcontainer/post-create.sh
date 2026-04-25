#!/usr/bin/env bash
set -euo pipefail

cd /workspaces/project

echo "Installing frontend dependencies..."
npm install

cd /workspaces/project/backend

echo "Installing backend PHP dependencies..."
composer install

echo "Installing backend Vite dependencies..."
npm install

if [ ! -f .env ]; then
  cp .env.example .env
fi

php -r '
$path = ".env";
$content = file_get_contents($path);
$replacements = [
    "APP_URL=http://localhost" => "APP_URL=http://127.0.0.1:8000",
    "DB_HOST=127.0.0.1" => "DB_HOST=postgres",
    "DB_PORT=5432" => "DB_PORT=5432",
    "DB_DATABASE=betopia_lms" => "DB_DATABASE=betopia_lms",
    "DB_USERNAME=postgres" => "DB_USERNAME=postgres",
    "DB_PASSWORD=postgres" => "DB_PASSWORD=postgres",
];
file_put_contents($path, str_replace(array_keys($replacements), array_values($replacements), $content));
'

php artisan key:generate --force
php artisan storage:link || true
php artisan migrate:fresh --seed --force
