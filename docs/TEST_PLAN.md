# Test Plan

## Test Coverage

### Unit Tests
- **Service Layer**: Business logic testing
  - Authentication service
  - Business service
  - Booking service
  - Payment service
  - Customer service
  - Staff service
  - Review service
  - Media service
  - Analytics service
  - Notification service
  - Audit service
  - Policy service
  - Feature flag service

- **Utility Functions**: Helper function testing
  - Crypto utilities
  - Date utilities
  - Validators
  - HTTP error handling
  - Message localization

- **Validators**: Schema validation testing
  - Request validation
  - Type checking
  - Constraint validation

### Integration Tests
- **API Endpoints**: Full request/response testing
  - Authentication endpoints
  - Business endpoints
  - Service endpoints
  - Booking endpoints
  - Payment endpoints
  - Customer endpoints
  - Staff endpoints
  - Review endpoints
  - Media endpoints
  - Analytics endpoints
  - Notification endpoints
  - Admin endpoints

- **Database Operations**: Database integration testing
  - Model associations
  - Transaction handling
  - Query operations
  - Soft deletes
  - Data integrity

- **External Service Integrations**: Third-party service testing
  - SendGrid email service
  - AWS S3 storage
  - Payment gateways (PayJP, Stripe)
  - Redis caching/queuing

### Test Files

#### Authentication Tests (`auth.test.ts`)
- User registration
- User login
- Token refresh
- Password reset
- Email verification
- Token rotation
- Logout functionality

#### Booking Tests (`booking.test.ts`)
- Booking creation
- Booking updates
- Booking cancellation
- Availability checking
- Waitlist management
- Booking history

#### Payment Tests (`payments.test.ts`)
- Payment intent creation
- Payment confirmation
- Payment refunds
- Webhook processing
- Idempotency handling

#### Availability Tests (`availability.test.ts`)
- Time slot availability
- Resource availability
- Business hours checking
- Holiday checking
- Conflict detection

#### Owner Portal Tests (`owner-portal.test.ts`)
- Business creation
- Service management
- Resource management
- Business settings
- Business hours

#### Admin Tests (`admin.test.ts`)
- Business approval
- Business rejection
- Business suspension
- Verification management

### Test Setup

The test setup (`tests/setup.ts`) includes:
- Database connection and cleanup
- PostgreSQL extensions setup
- Model initialization
- Association setup
- Redis connection (mocked in tests)
- Test data cleanup

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

### Test Environment

Tests run in a separate test environment:
- Separate test database
- Mocked Redis connection
- Isolated test data
- Automatic cleanup after tests

### Test Data

Test data is created fresh for each test:
- Users with different roles
- Businesses
- Services
- Resources
- Bookings
- Payments

### Coverage Goals

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: All critical paths
- **API Tests**: All endpoints
- **Service Tests**: All business logic

### Continuous Integration

Tests should run:
- On every commit
- Before merging PRs
- In CI/CD pipeline
- Before deployment

### Test Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Clean up test data after each test
3. **Assertions**: Use clear, descriptive assertions
4. **Mocking**: Mock external services appropriately
5. **Coverage**: Aim for high coverage of critical paths
6. **Performance**: Keep tests fast and efficient

