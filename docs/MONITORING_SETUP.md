# Monitoring & Observability

## Monitoring Overview

Comprehensive monitoring and observability setup for Omotenashi Connect to ensure system health, performance, and reliability.

## Metrics to Track

### Application Metrics

**Request Metrics:**
- **Request Rate**: Requests per second by endpoint
- **Response Times**: p50, p95, p99 percentiles
- **Error Rate**: Errors per second by endpoint
- **Status Codes**: Distribution of HTTP status codes
- **Active Connections**: Current active connections

**Business Metrics:**
- **Booking Creation Rate**: Bookings created per hour
- **Payment Success Rate**: Successful payments / total payments
- **Email Delivery Rate**: Emails delivered / emails sent
- **Customer Registration Rate**: New customers per day
- **Service Booking Rate**: Services booked per day

### Database Metrics

**Performance Metrics:**
- **Query Execution Time**: Average query time
- **Slow Queries**: Queries taking > 1 second
- **Connection Pool Usage**: Active / max connections
- **Lock Wait Time**: Time waiting for locks
- **Transaction Rate**: Transactions per second

**Health Metrics:**
- **Connection Count**: Active database connections
- **Replication Lag**: Read replica lag (if applicable)
- **Database Size**: Database and table sizes
- **Index Usage**: Index hit rate

### Redis Metrics

**Performance Metrics:**
- **Cache Hit Rate**: Cache hits / total requests
- **Memory Usage**: Redis memory consumption
- **Command Execution Time**: Average command time
- **Connection Count**: Active Redis connections

**Queue Metrics:**
- **Queue Length**: Jobs waiting in queue
- **Job Processing Rate**: Jobs processed per second
- **Failed Job Count**: Failed jobs in queue
- **Job Processing Time**: Average job processing time

### External Service Metrics

**Payment Gateways:**
- **PayJP**: API response time, success rate
- **Stripe**: API response time, success rate
- **Webhook Processing**: Webhook processing time

**Email Service:**
- **SendGrid**: API response time, delivery rate
- **Email Queue**: Queue length, processing time

**Storage:**
- **S3**: Upload/download times, error rate
- **Storage Usage**: Total storage used

## Recommended Tools

### APM (Application Performance Monitoring)

**Options:**
- **New Relic**: Full-stack APM
- **Datadog**: Infrastructure and APM
- **AppSignal**: Simple APM for Node.js
- **Sentry**: Error tracking and performance

**Recommended: Datadog**
- Comprehensive monitoring
- Easy integration
- Good Node.js support
- Reasonable pricing

### Logging

**Current Setup:**
- **Pino**: Fast JSON logger
- **Log Levels**: debug, info, warn, error
- **Output**: Console (dev), JSON (prod)

**Production Setup:**
- **CloudWatch**: AWS CloudWatch Logs
- **Elasticsearch**: ELK stack
- **Loggly**: Cloud logging service

**Log Structure:**
```json
{
  "level": "info",
  "time": "2024-12-25T10:00:00.000Z",
  "requestId": "req_abc123",
  "userId": "user_123",
  "businessId": "biz_456",
  "message": "Booking created",
  "data": {
    "bookingId": "bkg_789",
    "amount": 5000
  }
}
```

### Alerts

**PagerDuty Integration:**
- Critical alerts → PagerDuty
- On-call rotation
- Escalation policies
- Incident management

**Alert Channels:**
- **Email**: Non-critical alerts
- **Slack**: Team notifications
- **PagerDuty**: Critical incidents
- **SMS**: Emergency alerts

### Health Checks

**Health Check Endpoint:**
```
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-12-25T10:00:00.000Z",
  "uptime": 86400,
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "s3": "healthy",
    "sendgrid": "healthy"
  }
}
```

**Use Cases:**
- Load balancer health checks
- Kubernetes liveness probes
- Monitoring system checks

## Critical Alerts

### Payment Gateway Failures

**Alert Conditions:**
- Payment gateway API errors > 5% in 5 minutes
- Webhook processing failures > 10 in 5 minutes
- Payment success rate < 95% in 1 hour

**Actions:**
1. Alert DevOps team immediately
2. Check payment gateway status
3. Review webhook logs
4. Escalate if unresolved in 15 minutes

### Email Delivery Failures

**Alert Conditions:**
- Email delivery rate < 95% in 1 hour
- SendGrid API errors > 10 in 5 minutes
- Email queue backlog > 1000 jobs

**Actions:**
1. Check SendGrid status
2. Review email queue
3. Verify sender authentication
4. Retry failed emails

### Database Connection Failures

**Alert Conditions:**
- Database connection errors > 5 in 5 minutes
- Connection pool exhaustion
- Database response time > 5 seconds

**Actions:**
1. Check database server status
2. Review connection pool configuration
3. Check for long-running queries
4. Scale database if needed

### Queue Backlog

**Alert Conditions:**
- Queue backlog > 1000 jobs
- Job processing rate < 10 jobs/second
- Failed jobs > 100 in queue

**Actions:**
1. Check worker status
2. Review failed jobs
3. Scale workers if needed
4. Investigate job failures

### API Error Rate

**Alert Conditions:**
- API error rate > 1% in 5 minutes
- 5xx errors > 10 in 5 minutes
- Response time p95 > 1000ms

**Actions:**
1. Check application logs
2. Review error patterns
3. Check database performance
4. Scale application if needed

## Monitoring Dashboard

### Key Dashboards

**1. System Health Dashboard**
- Request rate
- Error rate
- Response times
- Service health status

**2. Business Metrics Dashboard**
- Bookings created
- Payments processed
- Customer registrations
- Revenue metrics

**3. Performance Dashboard**
- Database performance
- Cache hit rates
- Queue processing
- API response times

**4. Error Dashboard**
- Error rate by endpoint
- Error types distribution
- Failed jobs
- Payment failures

## Logging Strategy

### Log Levels

**Debug:**
- Detailed request/response data
- SQL queries
- Cache operations
- Development only

**Info:**
- Business events (bookings, payments)
- User actions
- System events
- Production default

**Warn:**
- Non-critical errors
- Deprecated API usage
- Performance warnings
- Rate limit warnings

**Error:**
- Application errors
- Database errors
- External service errors
- Critical failures

### Log Retention

**Development:**
- 7 days retention
- Console output

**Production:**
- 30 days hot storage
- 1 year cold storage
- Compliance logs: 5 years

### Structured Logging

**Log Format:**
```json
{
  "level": "info",
  "time": "2024-12-25T10:00:00.000Z",
  "requestId": "req_abc123",
  "userId": "user_123",
  "businessId": "biz_456",
  "endpoint": "/api/v1/bookings",
  "method": "POST",
  "statusCode": 201,
  "duration": 245,
  "message": "Booking created successfully"
}
```

## Alert Configuration

### Alert Severity Levels

**Critical (PagerDuty):**
- Payment gateway failures
- Database connection failures
- Application crashes
- Security incidents

**High (Slack + Email):**
- High error rates
- Queue backlog
- Performance degradation
- Email delivery issues

**Medium (Email):**
- Warning thresholds
- Non-critical errors
- Performance warnings

**Low (Dashboard Only):**
- Informational alerts
- Trend warnings
- Capacity planning

### Alert Rules

**Example Alert Rule:**
```yaml
name: High Error Rate
condition: error_rate > 0.01
duration: 5 minutes
severity: high
channels:
  - slack
  - email
actions:
  - check_logs
  - review_errors
```

## Monitoring Setup

### Step 1: Install Monitoring Tools

```bash
# Install APM agent
npm install @datadog/agent

# Configure environment
export DD_API_KEY=your_api_key
export DD_SERVICE=omotenashi-connect
export DD_ENV=production
```

### Step 2: Configure Logging

```typescript
// Production logging
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-cloudwatch',
    options: {
      awsRegion: 'ap-northeast-1',
      logGroupName: 'omotenashi-connect',
      logStreamName: 'api'
    }
  }
});
```

### Step 3: Set Up Health Checks

```typescript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      s3: await checkS3(),
      sendgrid: await checkSendGrid()
    }
  };
  
  const allHealthy = Object.values(health.services).every(s => s === 'healthy');
  res.status(allHealthy ? 200 : 503).json(health);
});
```

### Step 4: Configure Alerts

1. Set up PagerDuty integration
2. Configure alert rules
3. Set up Slack notifications
4. Configure email alerts
5. Test alert delivery

## Monitoring Best Practices

1. **Monitor Everything**: Track all critical metrics
2. **Set Baselines**: Establish normal operating ranges
3. **Alert on Trends**: Alert before problems occur
4. **Review Regularly**: Weekly metric reviews
5. **Optimize Alerts**: Reduce alert fatigue
6. **Document Runbooks**: Document response procedures

## Monitoring Checklist

### Pre-Production

- [ ] APM tool configured
- [ ] Logging set up
- [ ] Health checks implemented
- [ ] Alerts configured
- [ ] Dashboards created
- [ ] Runbooks documented

### Post-Deployment

- [ ] Metrics baseline established
- [ ] Alerts tested
- [ ] Dashboards reviewed
- [ ] Log retention verified
- [ ] Monitoring team trained

---

**Last Updated**: 2024
**Version**: 1.0.0

## Monitoring Components

### Application Monitoring
- Request/response logging
- Error tracking
- Performance metrics

### Database Monitoring
- Query performance
- Connection pool status
- Slow query detection

### Infrastructure Monitoring
- Server resource usage
- Redis performance
- Queue processing status

## Logging

- Structured logging with JSON format
- Log levels: error, warn, info, debug
- Centralized log aggregation

## Metrics

- Request rates
- Response times
- Error rates
- Business metrics (bookings, revenue)

