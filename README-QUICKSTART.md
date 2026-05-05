# ⚡ Smart LMS Quickstart

One-liner commands to get the project running instantly with a fully seeded database.

## 🪟 Windows (PowerShell)
Paste this into your terminal from the project root:

```powershell
npm install; cd backend; composer install; if (!(Test-Path .env)) { Copy-Item .env.example .env }; php artisan key:generate; New-Item -Path database\database.sqlite -ItemType File -Force; php artisan migrate:fresh --seed; cd ..; npm run dev
```

## 🍎 macOS / 🐧 Linux (Terminal)
Paste this into your terminal from the project root:

```bash
npm install && cd backend && composer install && cp -n .env.example .env && php artisan key:generate && touch database/database.sqlite && php artisan migrate:fresh --seed && cd .. && npm run dev
```

---

### 🔑 Demo Credentials
- **Admin**: `admin@example.com` / `password123`
- **Teacher**: `teacher@example.com` / `password123`
- **Student**: `student@example.com` / `password123`

### 🔗 URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://127.0.0.1:8000
