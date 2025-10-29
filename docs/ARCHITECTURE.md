# Architecture

- API: Express (stateless), DTO validated at edge.
- DB: Postgres + PostGIS. Overlap safety via EXCLUDE constraints.
- Queue: BullMQ (Redis) for email/reminders/no-show marking.
- i18n: EN/JA fields (MVP) → translation table later.
- Security: JWT + refresh tokens, audit logs, rate limiting.
