# Development Workflow

## Git Workflow

### Branch Strategy

**Main Branches:**
- **`main`**: Production-ready code
- **`staging`**: Pre-production testing
- **`develop`**: Development integration

**Feature Branches:**
- **Format**: `feature/TICKET-123-description`
- **Example**: `feature/OC-456-add-customer-notes`
- **Lifecycle**: Create → Develop → PR → Merge → Delete

**Hotfix Branches:**
- **Format**: `hotfix/TICKET-123-description`
- **Example**: `hotfix/OC-789-fix-payment-bug`
- **Lifecycle**: Create from `main` → Fix → PR → Merge to `main` and `develop`

**Release Branches:**
- **Format**: `release/v1.2.0`
- **Lifecycle**: Create from `develop` → Test → Merge to `main` and `develop`

### Commit Messages

**Format:**
```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Build/tooling changes

**Examples:**
```
feat(booking): add availability checking

Add real-time availability checking for bookings with conflict detection.

Closes #123
```

```
fix(payment): handle webhook retries correctly

Fix webhook processing to handle retries and prevent duplicate processing.
```

### Pull Request Requirements

**Before Creating PR:**
- [ ] All tests passing (`npm test`)
- [ ] No lint errors (`npm run lint`)
- [ ] Code coverage > 80%
- [ ] Documentation updated
- [ ] Migration files created (if schema changes)

**PR Checklist:**
- [ ] Clear description of changes
- [ ] Related issue/ticket referenced
- [ ] Breaking changes documented
- [ ] Migration guide (if needed)
- [ ] Screenshots (if UI changes)

**Review Requirements:**
- **Minimum Approvals**: 2
- **Required Reviewers**: 
  - At least one senior developer
  - Code owner for affected area
- **CI Checks**: All must pass
- **Status Checks**: Build, tests, lint

## CI/CD Pipeline

### Continuous Integration

**On Pull Request:**
1. **Linting**: ESLint check
2. **Type Checking**: TypeScript compilation
3. **Unit Tests**: Run all unit tests
4. **Integration Tests**: Run integration tests
5. **Code Coverage**: Check coverage > 80%
6. **Security Scan**: Dependency vulnerability scan

**Pipeline Steps:**
```yaml
# .github/workflows/ci.yml
on: [pull_request]
jobs:
  lint:
    - Run ESLint
  test:
    - Run tests
    - Generate coverage report
  security:
    - Run npm audit
    - Check for vulnerabilities
```

### Continuous Deployment

**On Merge to Staging:**
1. **Build**: Compile TypeScript
2. **Deploy**: Deploy to staging environment
3. **Migrations**: Run database migrations
4. **Smoke Tests**: Run E2E smoke tests
5. **Health Check**: Verify deployment

**On Release Tag:**
1. **Build**: Production build
2. **Security Scan**: Full security audit
3. **Deploy**: Deploy to production
4. **Migrations**: Run database migrations
5. **Smoke Tests**: Run production smoke tests
6. **Gradual Rollout**: 10% → 50% → 100%

**Pipeline Steps:**
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [staging, main]
    tags: ['v*']
jobs:
  deploy:
    - Build application
    - Run migrations
    - Deploy to environment
    - Run smoke tests
    - Verify health
```

## Code Review Checklist

### Security

- [ ] No secrets in code
- [ ] Proper authentication checks
- [ ] Authorization verified
- [ ] Input validation implemented
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection

### Performance

- [ ] No N+1 queries
- [ ] Proper indexes used
- [ ] Caching implemented where appropriate
- [ ] Pagination for list endpoints
- [ ] Efficient database queries

### Error Handling

- [ ] All edge cases covered
- [ ] Proper error messages
- [ ] Error logging implemented
- [ ] User-friendly error messages
- [ ] Error codes standardized

### Testing

- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Edge cases tested
- [ ] Error cases tested
- [ ] Test coverage maintained

### Documentation

- [ ] Code comments added
- [ ] API documentation updated
- [ ] README updated (if needed)
- [ ] Migration guide (if schema changes)
- [ ] Breaking changes documented

## Development Environment Setup

### Prerequisites

1. **Node.js**: v22.x
2. **PostgreSQL**: v14.x+
3. **Redis**: v5.0+
4. **Git**: Latest version

### Setup Steps

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd omotenashi-connect
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   createdb omotenashi_connect
   npm run migrate
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

### Development Tools

**Recommended VS Code Extensions:**
- ESLint
- Prettier
- TypeScript
- GitLens
- REST Client

**Recommended Tools:**
- **Postman/Insomnia**: API testing
- **pgAdmin**: Database management
- **Redis Insight**: Redis management
- **Docker**: Containerization

## Testing Strategy

### Test Types

**1. Unit Tests** (`*.test.ts`)
- Service logic
- Utility functions
- Validators
- **Coverage Target**: > 80%

**2. Integration Tests** (`*.integration.test.ts`)
- API endpoints
- Database operations
- External service mocks
- **Coverage Target**: All critical paths

**3. E2E Tests** (`*.e2e.test.ts`)
- Complete user journeys
- Booking flow
- Payment flow
- **Coverage Target**: Main user flows

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.ts

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Test Data Management

**Factory Pattern:**
```typescript
// tests/factories/booking.factory.ts
export function createTestBooking(overrides = {}) {
  return {
    business_id: 'biz_123',
    service_id: 'svc_456',
    customer_id: 'cust_789',
    start_at: new Date('2024-12-25T14:00:00Z'),
    end_at: new Date('2024-12-25T15:00:00Z'),
    status: BookingStatus.PENDING,
    ...overrides
  };
}
```

## Code Quality

### Linting

**ESLint Configuration:**
- TypeScript strict rules
- Import ordering
- Unused variable detection
- Code style enforcement

**Running Linter:**
```bash
npm run lint
npm run lint:fix
```

### Formatting

**Prettier Configuration:**
- 2 spaces indentation
- Single quotes
- Trailing commas
- Semicolons

**Running Formatter:**
```bash
npm run fmt
```

### Type Checking

**TypeScript Configuration:**
- Strict mode enabled
- No implicit any
- Strict null checks
- No unused locals

**Running Type Check:**
```bash
npm run tsc
```

## Feature Flag Management

### Naming Convention

**Format:**
- `enable_<feature_name>` (boolean)
- `<feature>_rollout` (percentage)
- `<feature>_access` (user list)

**Examples:**
- `enable_new_payment_flow`
- `new_booking_ui_rollout`
- `advanced_analytics_access`

### Lifecycle

**1. Create Flag (Disabled)**
```typescript
// Create feature flag
await createFeatureFlag({
  name: 'enable_new_payment_flow',
  is_enabled: false,
  rollout_percent: 0
});
```

**2. Internal Testing**
```typescript
// Enable for specific users
await updateFeatureFlag(flagId, {
  target_user_ids: [internalUserId1, internalUserId2]
});
```

**3. Gradual Rollout**
```typescript
// 10% rollout
await updateFeatureFlag(flagId, {
  rollout_percent: 10
});

// Monitor metrics for 24 hours

// 25% rollout
await updateFeatureFlag(flagId, {
  rollout_percent: 25
});

// Monitor metrics for 24 hours

// 50% rollout
await updateFeatureFlag(flagId, {
  rollout_percent: 50
});

// Monitor metrics for 24 hours

// 100% rollout
await updateFeatureFlag(flagId, {
  rollout_percent: 100
});
```

**4. Monitor Metrics**
- Error rates
- Performance impact
- User feedback
- Business metrics

**5. Remove Flag**
- After 30 days at 100%
- Remove from code
- Delete from database

### Cleanup

**Weekly Review:**
- Review active flags
- Remove flags older than 90 days
- Archive unused flags

**Best Practices:**
- Document flag purpose
- Set expiration date
- Monitor flag usage
- Remove after feature is stable

## Performance Testing

### Load Testing

**Tools:**
- **k6**: Load testing framework
- **Artillery**: Performance testing
- **Apache Bench**: Simple load testing

**Targets:**
- **Concurrent Users**: 1000+
- **Requests per Second**: 500+
- **Response Time**: p95 < 500ms
- **Error Rate**: < 0.1%

**Test Scenarios:**
1. Booking creation flow
2. Payment processing
3. Availability checking
4. List endpoints
5. Search operations

**Example k6 Script:**
```javascript
import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '2m', target: 0 },
  ],
};

export default function () {
  const res = http.get('https://api.example.com/api/v1/bookings');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

## Deployment Process

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code review approved
- [ ] Documentation updated
- [ ] Migration scripts tested
- [ ] Environment variables configured
- [ ] Backup verified
- [ ] Rollback plan ready

### Deployment Steps

1. **Create Release Branch**
   ```bash
   git checkout -b release/v1.2.0 develop
   ```

2. **Final Testing**
   ```bash
   npm test
   npm run build
   ```

3. **Create Release Tag**
   ```bash
   git tag -a v1.2.0 -m "Release v1.2.0"
   git push origin v1.2.0
   ```

4. **Deploy to Staging**
   - CI/CD pipeline triggers
   - Deploy to staging environment
   - Run smoke tests
   - Verify functionality

5. **Deploy to Production**
   - Manual approval required
   - Gradual rollout (10% → 50% → 100%)
   - Monitor metrics
   - Verify health

6. **Post-Deployment**
   - Monitor for 1 hour
   - Verify metrics
   - Check error logs
   - Update documentation

### Rollback Procedure

**If Issues Detected:**
1. **Immediate Rollback**
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Database Rollback**
   ```bash
   npm run migrate:undo
   ```

3. **Verify Rollback**
   - Check application health
   - Verify functionality
   - Monitor metrics

## Documentation Standards

### Code Documentation

**Function Documentation:**
```typescript
/**
 * Create a new booking
 * 
 * @param data - Booking creation data
 * @param userId - User ID creating the booking
 * @param source - Booking source (web, owner_portal, etc.)
 * @returns Created booking
 * @throws NotFoundError if business/service not found
 * @throws ConflictError if time slot not available
 */
export async function createBooking(
  data: CreateBookingRequest,
  userId?: string,
  source: BookingSource = BookingSource.WEB
): Promise<Booking> {
  // Implementation
}
```

### API Documentation

**Endpoint Documentation:**
- Request/response examples
- Error responses
- Authentication requirements
- Rate limiting
- Query parameters

### README Updates

**When to Update:**
- New features added
- Breaking changes
- Configuration changes
- Deployment changes

## Best Practices

### Code Organization

1. **Single Responsibility**: Each function does one thing
2. **DRY Principle**: Don't repeat yourself
3. **Separation of Concerns**: Clear layer separation
4. **Dependency Injection**: Avoid hard dependencies

### Error Handling

1. **Use Custom Errors**: Specific error types
2. **Log Errors**: Always log errors with context
3. **User-Friendly Messages**: Clear error messages
4. **Error Recovery**: Handle errors gracefully

### Security

1. **Never Trust Input**: Always validate
2. **Principle of Least Privilege**: Minimum permissions
3. **Defense in Depth**: Multiple security layers
4. **Regular Updates**: Keep dependencies updated

### Performance

1. **Optimize Queries**: Use indexes, avoid N+1
2. **Cache Aggressively**: Cache frequently accessed data
3. **Monitor Performance**: Track metrics
4. **Load Test**: Regular load testing

---

**Last Updated**: 2024
**Version**: 1.0.0

