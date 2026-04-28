# Multi-tenant local testing

## Backend env
Add/verify in `backend/.env`:
- `APP_URL=http://127.0.0.1:8000`
- `FRONTEND_URL=http://localhost:3000`
- `DEFAULT_TENANT=diu`

## Frontend env
Add/verify in `frontend/.env.local`:
- `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api`
- `NEXT_PUBLIC_DEFAULT_TENANT=diu`

## Local URLs to test
- http://localhost:3000
- http://diu.localhost:3000
- http://brac.localhost:3000
- http://tepantor.localhost:3000

## Demo credentials
- `admin@diu.test` / `password`
- `teacher@diu.test` / `password`
- `student@diu.test` / `password`

- `admin@brac.test` / `password`
- `teacher@brac.test` / `password`
- `student@brac.test` / `password`

- `admin@tepantor.test` / `password`
- `teacher@tepantor.test` / `password`
- `student@tepantor.test` / `password`

## Hosts file (optional)
Most OSes resolve `*.localhost` by default. If not, add:

```
127.0.0.1 diu.localhost brac.localhost tepantor.localhost
```