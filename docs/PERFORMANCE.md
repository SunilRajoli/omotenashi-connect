# Performance & Scalability Documentation

## Performance Overview

Omotenashi Connect is designed for high performance and scalability, handling thousands of concurrent requests with sub-second response times.

## Database Performance

### Indexing Strategy

**Critical Indexes:**

```sql
-- Booking queries (most common)
CREATE INDEX idx_bookings_business_date ON bookings(business_id, booking_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_customer ON bookings(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_status ON bookings(status, created_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_service ON bookings(service_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bookings_resource ON bookings(resource_id) WHERE deleted_at IS NULL;

-- Payment queries
CREATE INDEX idx_payments_booking ON booking_payments(booking_id);
CREATE INDEX idx_payments_status ON booking_payments(status, created_at);
CREATE INDEX idx_payments_provider ON booking_payments(provider, created_at);

-- Customer queries
CREATE INDEX idx_customers_business ON customers(business_id, deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_user ON customers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_email ON customers(email) WHERE deleted_at IS NULL;

-- Service queries
CREATE INDEX idx_services_business ON services(business_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_services_category ON services(category) WHERE deleted_at IS NULL;

-- Review queries
CREATE INDEX idx_reviews_business ON reviews(business_id, is_visible) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_customer ON reviews(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_reviews_rating ON reviews(rating, created_at) WHERE deleted_at IS NULL;

-- Analytics queries
CREATE INDEX idx_analytics_business_date ON analytics_daily(business_id, date DESC);
CREATE INDEX idx_analytics_date ON analytics_daily(date DESC);

-- Staff queries
CREATE INDEX idx_staff_business ON staff_assignments(business_id, is_active) WHERE terminated_at IS NULL;
CREATE INDEX idx_staff_user ON staff_assignments(user_id) WHERE terminated_at IS NULL;

-- Audit log queries
CREATE INDEX idx_audit_entity ON audit_logs(entity, entity_id, created_at DESC);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id, created_at DESC);
CREATE INDEX idx_audit_action ON audit_logs(action, created_at DESC);
```

**Composite Indexes:**
- Business + Date for booking queries
- Business + Status for filtering
- Customer + Business for multi-tenant queries

**Partial Indexes:**
- Only index non-deleted records (`WHERE deleted_at IS NULL`)
- Reduces index size and improves performance

### Query Optimization

**Best Practices:**
1. **Use Indexes**: Always query on indexed fields
2. **Limit Results**: Use `LIMIT` and `OFFSET` for pagination
3. **Select Specific Fields**: Avoid `SELECT *`
4. **Use Transactions**: For multi-step operations
5. **Batch Operations**: Group similar queries
6. **Avoid N+1 Queries**: Use eager loading with `include`

**Example:**
```typescript
// Bad: N+1 query
const bookings = await Booking.findAll();
for (const booking of bookings) {
  const customer = await Customer.findByPk(booking.customer_id);
}

// Good: Eager loading
const bookings = await Booking.findAll({
  include: [{ model: Customer, as: 'customer' }]
});
```

### Connection Pooling

**Sequelize Configuration:**
```typescript
{
  pool: {
    min: 5,        // Minimum connections
    max: 30,       // Maximum connections
    idle: 10000,   // Idle timeout (ms)
    acquire: 30000 // Connection acquire timeout (ms)
  }
}
```

**Pool Sizing:**
- **Development**: min 2, max 10
- **Staging**: min 5, max 20
- **Production**: min 10, max 50

**Monitoring:**
- Track pool usage
- Alert on pool exhaustion
- Monitor connection wait times

### Read Replicas

**Configuration:**
- **Primary**: Write operations
- **Replicas**: Read operations (reporting, analytics)

**Use Cases:**
- Analytics queries
- Reporting endpoints
- Dashboard data
- Read-heavy operations

**Implementation:**
```typescript
// Read from replica
const stats = await sequelize.readReplica.query(analyticsQuery);

// Write to primary
await sequelize.writeReplica.transaction(async (t) => {
  await Booking.create(data, { transaction: t });
});
```

## Caching Strategy

### Redis Caching

**Cache Layers:**

1. **Business Data** (5 min TTL)
   - Business profiles
   - Business settings
   - Business hours

2. **Availability Checks** (1 min TTL)
   - Time slot availability
   - Resource availability
   - Business hours for date

3. **User Sessions** (Token expiry TTL)
   - User data
   - Permissions
   - Business associations

4. **Service Catalog** (10 min TTL)
   - Service listings
   - Service details
   - Resource listings

5. **Analytics** (15 min TTL)
   - Dashboard statistics
   - Business summaries
   - Daily aggregates

**Cache Keys:**
```
business:{id}
business:{id}:settings
business:{id}:hours
availability:{businessId}:{date}
service:{id}
analytics:{businessId}:{date}
```

**Cache Invalidation:**
- On data updates
- On business changes
- On service updates
- TTL-based expiration

### Application-Level Caching

**In-Memory Cache:**
- Feature flags
- Configuration data
- Static reference data

**Cache Warming:**
- Pre-load frequently accessed data
- Background cache refresh
- Scheduled cache updates

## API Performance

### Response Time Targets

**Target Response Times:**
- **p50**: < 200ms
- **p95**: < 500ms
- **p99**: < 1000ms

**By Endpoint Type:**
- **Simple GET**: < 100ms
- **List Endpoints**: < 300ms
- **Create Endpoints**: < 500ms
- **Complex Queries**: < 1000ms

### Performance Optimization

**Techniques:**
1. **Pagination**: Limit result sets
2. **Field Selection**: Return only needed fields
3. **Eager Loading**: Reduce database queries
4. **Caching**: Cache frequently accessed data
5. **Compression**: Gzip response compression
6. **CDN**: Static asset delivery

**Example:**
```typescript
// Optimized query
const businesses = await Business.findAll({
  attributes: ['id', 'display_name_ja', 'display_name_en', 'slug'],
  where: { deleted_at: null },
  include: [
    { 
      model: Service, 
      as: 'services',
      attributes: ['id', 'name_ja', 'name_en', 'price_cents'],
      where: { is_active: true, deleted_at: null },
      required: false
    }
  ],
  limit: 20,
  offset: 0
});
```

## Background Job Performance

### Queue Configuration

**BullMQ Settings:**
```typescript
{
  removeOnComplete: 1000,  // Keep last 1000 completed jobs
  removeOnFail: 5000,      // Keep last 5000 failed jobs
  attempts: 3,             // Retry failed jobs 3 times
  backoff: {
    type: 'exponential',
    delay: 1000            // Start with 1s delay
  }
}
```

**Worker Configuration:**
- **Concurrency**: 5 workers per queue
- **Rate Limiting**: 100 jobs per second
- **Priority**: High priority jobs processed first

### Job Processing Times

**Target Processing Times:**
- **Email Jobs**: < 2 seconds
- **Analytics Jobs**: < 30 seconds
- **Webhook Jobs**: < 1 second
- **Reminder Jobs**: < 1 second

**Monitoring:**
- Track job processing times
- Alert on job backlog
- Monitor failed jobs

## Scalability

### Horizontal Scaling

**Application Servers:**
- Stateless design (no session storage)
- Load balancer distribution
- Auto-scaling based on CPU/memory

**Database:**
- Read replicas for read scaling
- Connection pooling per instance
- Query optimization

**Redis:**
- Redis Cluster for high availability
- Sharding for large datasets
- Replication for redundancy

### Vertical Scaling

**Database:**
- Increase connection pool size
- Add more memory for caching
- Upgrade CPU for complex queries

**Application:**
- Increase Node.js memory limit
- Add more CPU cores
- Optimize code for performance

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

## Monitoring Performance

### Key Metrics

**Application Metrics:**
- Request rate (req/s)
- Response times (p50, p95, p99)
- Error rate
- Active connections

**Database Metrics:**
- Query execution time
- Connection pool usage
- Slow query count
- Lock wait time

**Redis Metrics:**
- Cache hit rate
- Memory usage
- Command execution time
- Connection count

**Queue Metrics:**
- Job processing rate
- Queue length
- Failed job count
- Processing time

### Performance Alerts

**Critical Alerts:**
- Response time p95 > 1000ms
- Error rate > 1%
- Database connection pool > 80%
- Queue backlog > 1000 jobs
- Cache hit rate < 70%

**Warning Alerts:**
- Response time p95 > 500ms
- Error rate > 0.5%
- Database slow queries > 10/min
- Queue backlog > 500 jobs

## Performance Best Practices

### Development

1. **Profile Code**: Identify bottlenecks
2. **Use Indexes**: Always index foreign keys
3. **Optimize Queries**: Avoid N+1 queries
4. **Cache Aggressively**: Cache frequently accessed data
5. **Monitor Performance**: Track metrics in development

### Production

1. **Monitor Metrics**: Track all performance metrics
2. **Set Alerts**: Alert on performance degradation
3. **Regular Optimization**: Review and optimize slow queries
4. **Load Testing**: Regular load testing
5. **Capacity Planning**: Plan for growth

## Performance Checklist

### Pre-Deployment

- [ ] All indexes created
- [ ] Query optimization reviewed
- [ ] Caching strategy implemented
- [ ] Connection pooling configured
- [ ] Load testing completed
- [ ] Performance targets met

### Post-Deployment

- [ ] Performance monitoring enabled
- [ ] Alerts configured
- [ ] Metrics dashboard set up
- [ ] Baseline metrics recorded
- [ ] Performance regression tests

---

**Last Updated**: 2024
**Version**: 1.0.0

