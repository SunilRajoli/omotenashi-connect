# Architecture Overview

## System Architecture

Omotenashi Connect follows a layered architecture pattern with clear separation of concerns.

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15+
- **Cache/Queue**: Redis 7+ with BullMQ
- **Language**: TypeScript

## Layer Structure

### Controllers
Handle HTTP requests and responses, delegate business logic to services.

### Services
Contain business logic and orchestrate data operations.

### Models
Sequelize ORM models representing database entities.

### Routes
Define API endpoints and apply middleware.

### Middleware
Request processing pipeline components (auth, validation, rate limiting).

## Design Patterns

- Repository pattern (via Sequelize models)
- Service layer pattern
- Middleware pattern
- Dependency injection

