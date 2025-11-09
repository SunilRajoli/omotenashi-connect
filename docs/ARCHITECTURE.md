# Architecture Overview

## System Architecture

Omotenashi Connect follows a layered architecture pattern with clear separation of concerns.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│              (Web App, Mobile App, Admin Panel)             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                       │
│  Express.js + Middleware (Auth, Validation, Rate Limiting)  │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Services   │ │   Workers    │ │   Storage    │
│   Layer      │ │   (BullMQ)   │ │   (S3)       │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────┬───────┴────────────────┘
                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│         PostgreSQL (Primary) + Redis (Cache/Queue)          │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

- **Runtime**: Node.js v22.x
- **Framework**: Express.js 4.19.x
- **Database**: PostgreSQL 14.x+
- **Cache/Queue**: Redis 5.0+ with BullMQ
- **Language**: TypeScript 5.6.x
- **ORM**: Sequelize 6.37.x
- **Validation**: Zod 3.23.x
- **Email**: SendGrid
- **Storage**: AWS S3
- **Payments**: PayJP, Stripe

## Layer Structure

### Controllers
Handle HTTP requests and responses, delegate business logic to services.
- Request validation
- Response formatting
- Error handling
- Authentication checks

### Services
Contain business logic and orchestrate data operations.
- Business rules
- Data validation
- Transaction management
- External service integration

### Models
Sequelize ORM models representing database entities.
- Schema definitions
- Relationships
- Validations
- Hooks

### Routes
Define API endpoints and apply middleware.
- Route definitions
- Middleware application
- Request routing
- Error handling

### Middleware
Request processing pipeline components.
- Authentication (JWT)
- Authorization (RBAC)
- Validation (Zod)
- Rate limiting (Redis)
- Logging (Pino)

## Design Patterns

- **Repository Pattern**: Via Sequelize models
- **Service Layer Pattern**: Business logic separation
- **Middleware Pattern**: Request processing pipeline
- **Dependency Injection**: Service dependencies
- **Factory Pattern**: Test data creation
- **Strategy Pattern**: Payment gateway abstraction

## Request Flow

1. **Client Request** → Express.js middleware stack
2. **Authentication** → JWT token validation
3. **Authorization** → Role-based access control
4. **Validation** → Zod schema validation
5. **Rate Limiting** → Redis-based rate limiting
6. **Business Logic** → Service layer processing
7. **Database Operations** → Sequelize ORM with transactions
8. **Response** → JSON response with proper status codes

## Scalability

### Horizontal Scaling
- Stateless application design
- Load balancer distribution
- Multiple application instances
- Read replicas for database

### Vertical Scaling
- Database resource scaling
- Redis memory scaling
- Application memory scaling

### Caching Strategy
- Redis caching for frequently accessed data
- Application-level caching
- CDN for static assets

## Security Architecture

### Authentication Flow
1. User login → JWT access token + refresh token
2. Access token → Short-lived (15 minutes)
3. Refresh token → Long-lived (7 days), stored in database
4. Token rotation → New tokens on refresh

### Authorization Flow
1. Extract user from JWT token
2. Check user role
3. Verify business ownership (if applicable)
4. Check resource-level permissions

### Data Protection
- Encryption at rest (database, S3)
- Encryption in transit (HTTPS)
- Input validation and sanitization
- SQL injection prevention (Sequelize)
- XSS protection

## Performance Architecture

### Database Performance
- Indexes on foreign keys and commonly queried fields
- Connection pooling (min 5, max 30)
- Read replicas for reporting
- Query optimization

### Caching Strategy
- Business data: 5 min TTL
- Availability checks: 1 min TTL
- User sessions: Token expiry TTL
- Service catalog: 10 min TTL
- Analytics: 15 min TTL

### Background Jobs
- Email queue (BullMQ)
- Analytics aggregation
- Booking reminders
- Booking expiration
- Webhook processing

## Monitoring Architecture

### Metrics Collection
- Application metrics (APM)
- Database metrics
- Redis metrics
- Queue metrics
- External service metrics

### Logging
- Structured JSON logging (Pino)
- Request/response logging
- Error logging
- Business event logging

### Alerting
- Critical alerts (PagerDuty)
- High alerts (Slack + Email)
- Medium alerts (Email)
- Low alerts (Dashboard)

---

**Last Updated**: 2024
**Version**: 1.0.0

