# Omotenashi Connect

Japan-ready booking backend (Node.js + TypeScript + Express + Sequelize + PostgreSQL + Redis + BullMQ).

## Quick start (dev)

```bash
cp .env.example .env
npm i
npm run dev


## 🔐 Authentication (API)

Base path: `/api/v1/auth`

| Endpoint                | Method | Auth   | Purpose                          |
|-------------------------|--------|--------|----------------------------------|
| `/signup`               | POST   | Public | Create user + send verify email  |
| `/verify-email`         | GET    | Public | Confirm email via token (query)  |
| `/login`                | POST   | Public | Email+password → tokens          |
| `/refresh`              | POST   | Public | Rotate refresh → new pair        |
| `/logout`               | POST   | Public | Revoke refresh token             |
| `/forgot-password`      | POST   | Public | Send reset link                  |
| `/reset-password`       | POST   | Public | Reset with token                 |
| `/me`                   | GET    | Bearer | Return current user profile      |

### Example (cURL)

```bash
# Signup
curl -X POST http://localhost:4000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Passw0rd!","fullName":"Demo User"}'

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com","password":"Passw0rd!"}'

# Me
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"

# Refresh
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'

# Logout
curl -X POST http://localhost:4000/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"<REFRESH_TOKEN>"}'
