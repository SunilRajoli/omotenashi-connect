# Omotenashi Connect (おもてなしコネクト / Omotenashi Connect)

Japan-ready hospitality booking backend — multi-tenant, JA/EN, konbini-aware.

## Quick Start
```bash
cp .env.sample .env
docker compose up -d db redis
npm i
npm run migrate
npm run seed
npm run dev

Docs at /docs (Swagger UI).

Scripts

npm run dev – ts-node + nodemon

npm run migrate / migrate:undo

npm run seed

npm run build && npm start

Stack

Node 22, Express, PostgreSQL, Sequelize, Redis/BullMQ, Swagger, TypeScript.


---

## 13) Docs placeholders (create empty files so links work)
- `docs/ARCHITECTURE.md`  
- `docs/BACKEND_OVERVIEW.md`  
- `docs/DATABASE_SCHEMA_FINAL.md`  
- `docs/JAPAN_LOCALIZATION_GUIDE.md`  
- `docs/SECURITY_COMPLIANCE.md`  
- `docs/RUNBOOKS.md`  
- `docs/TEST_PLAN.md`  
- `docs/API_CONVENTIONS.md` (include the extra endpoints we listed)  
- `docs/DEPLOYMENT_GUIDE.md` (include full env list above)  
- `docs/MONITORING_SETUP.md`  
- `docs/TROUBLESHOOTING.md`  
- `docs/SEQUELIZE_ASSOCIATIONS.md`  
- `docs/openapi.yaml` (put a stub; we’ll expand later)

Minimal `docs/openapi.yaml` stub:
```yaml
openapi: 3.0.3
info:
  title: Omotenashi Connect API
  version: 0.1.0
servers:
  - url: http://localhost:4000/api/v1
paths:
  /health:
    get:
      summary: Healthcheck
      responses:
        "200":
          description: OK
