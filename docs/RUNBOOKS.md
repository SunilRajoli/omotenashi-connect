# Operational Runbooks

## Overview

This document provides step-by-step procedures for common operational tasks in Omotenashi Connect.

## Database Operations

### Run Migrations

**Purpose**: Apply database schema changes

**Command:**
```bash
npm run migrate
```

**Steps:**
1. Ensure database connection is configured
2. Verify no pending migrations
3. Run migration command
4. Verify migration success
5. Check for errors in logs

**Rollback:**
```bash
npm run migrate:undo
```

### Rollback Migration

**Purpose**: Undo last migration

**Command:**
```bash
npm run migrate:undo
```

**Steps:**
1. Identify migration to rollback
2. Backup database (if needed)
3. Run rollback command
4. Verify rollback success
5. Check data integrity

### Seed Database

**Purpose**: Populate database with initial data

**Command:**
```bash
npm run seed
```

**Steps:**
1. Ensure migrations are up to date
2. Run seed command
3. Verify seed data created
4. Check for errors

**Note**: Only run in development/staging environments

### Create Admin User

**Purpose**: Create initial admin user

**Command:**
```bash
npm run script:create-admin
```

**Steps:**
1. Run script
2. Enter email and password
3. Verify user created
4. Test login

### Reindex Data

**Purpose**: Rebuild database indexes

**Command:**
```bash
npm run script:reindex
```

**Steps:**
1. Check database connection
2. Run reindex command
3. Monitor progress
4. Verify indexes created
5. Check query performance

## Application Operations

### Start Application

**Purpose**: Start production server

**Command:**
```bash
npm start
```

**Or with PM2:**
```bash
pm2 start dist/server.js --name omotenashi-connect
```

**Steps:**
1. Verify environment variables set
2. Check database connection
3. Check Redis connection
4. Start application
5. Verify health check endpoint

### Stop Application

**Purpose**: Gracefully stop application

**Command:**
```bash
pm2 stop omotenashi-connect
```

**Or:**
```bash
# Send SIGTERM signal
kill -TERM <pid>
```

**Steps:**
1. Check active connections
2. Wait for requests to complete
3. Stop application
4. Verify shutdown

### Restart Application

**Purpose**: Restart application with zero downtime

**Command:**
```bash
pm2 restart omotenashi-connect
```

**Steps:**
1. Verify new code deployed
2. Restart application
3. Verify health check
4. Monitor logs for errors

### View Application Logs

**Purpose**: Monitor application logs

**Command:**
```bash
pm2 logs omotenashi-connect
```

**Or:**
```bash
tail -f logs/app.log
```

**Steps:**
1. Open log viewer
2. Filter by log level
3. Search for errors
4. Monitor real-time logs

## Queue Operations

### Check Queue Status

**Purpose**: Monitor job queue status

**Command:**
```bash
# Via Redis CLI
redis-cli
> LLEN bull:email:wait
> LLEN bull:analytics:wait
```

**Steps:**
1. Connect to Redis
2. Check queue lengths
3. Monitor failed jobs
4. Check processing rate

### Retry Failed Jobs

**Purpose**: Retry failed queue jobs

**Command:**
```bash
# Via Redis CLI
redis-cli
> LRANGE bull:email:failed 0 -1
```

**Steps:**
1. Identify failed jobs
2. Check error messages
3. Retry jobs manually
4. Monitor retry success

### Clear Queue

**Purpose**: Clear all jobs from queue

**Command:**
```bash
# Via Redis CLI
redis-cli
> DEL bull:email:*
```

**Warning**: Only use in emergency situations

**Steps:**
1. Verify queue needs clearing
2. Backup queue data (if needed)
3. Clear queue
4. Restart workers

## Backup Operations

### Create Database Backup

**Purpose**: Create database backup

**Command:**
```bash
pg_dump -h localhost -U postgres -d omotenashi_connect > backup_$(date +%Y%m%d).sql
```

**Steps:**
1. Verify database connection
2. Run backup command
3. Verify backup file created
4. Test backup restore

### Restore Database Backup

**Purpose**: Restore from backup

**Command:**
```bash
psql -h localhost -U postgres -d omotenashi_connect < backup_20241225.sql
```

**Steps:**
1. Verify backup file exists
2. Stop application
3. Restore backup
4. Verify data integrity
5. Restart application

### Backup S3 Media

**Purpose**: Backup media files

**Command:**
```bash
aws s3 sync s3://omotenashi-media s3://omotenashi-media-backup
```

**Steps:**
1. Verify S3 credentials
2. Run sync command
3. Monitor sync progress
4. Verify backup complete

## Monitoring Operations

### Check Application Health

**Purpose**: Verify application health

**Command:**
```bash
curl https://api.example.com/health
```

**Expected Response:**
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

**Steps:**
1. Call health endpoint
2. Verify all services healthy
3. Check response time
4. Monitor for issues

### Check Database Performance

**Purpose**: Monitor database performance

**Command:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_time DESC 
LIMIT 10;

-- Check index usage
SELECT * FROM pg_stat_user_indexes 
WHERE idx_scan = 0;
```

**Steps:**
1. Connect to database
2. Run performance queries
3. Identify bottlenecks
4. Optimize queries

### Check Redis Performance

**Purpose**: Monitor Redis performance

**Command:**
```bash
redis-cli
> INFO stats
> INFO memory
> SLOWLOG GET 10
```

**Steps:**
1. Connect to Redis
2. Check statistics
3. Monitor memory usage
4. Review slow commands

## Incident Response

### Application Crash

**Symptoms:**
- Application not responding
- Health check failing
- Error logs showing crashes

**Steps:**
1. Check application logs
2. Identify error cause
3. Restart application
4. Monitor for recurrence
5. Investigate root cause

### Database Connection Failure

**Symptoms:**
- Database connection errors
- Health check showing database unhealthy
- Application errors

**Steps:**
1. Check database server status
2. Verify network connectivity
3. Check connection pool
4. Restart database if needed
5. Restart application

### Redis Connection Failure

**Symptoms:**
- Redis connection errors
- Queue not processing
- Cache not working

**Steps:**
1. Check Redis server status
2. Verify network connectivity
3. Check Redis configuration
4. Restart Redis if needed
5. Restart application

### Payment Gateway Failure

**Symptoms:**
- Payment processing errors
- Webhook failures
- Payment gateway errors

**Steps:**
1. Check payment gateway status
2. Verify API credentials
3. Check webhook configuration
4. Review payment logs
5. Contact payment gateway support

### Email Delivery Failure

**Symptoms:**
- Emails not sending
- SendGrid errors
- Email queue backlog

**Steps:**
1. Check SendGrid status
2. Verify API key
3. Check sender authentication
4. Review email logs
5. Retry failed emails

## Maintenance Operations

### Scheduled Maintenance

**Purpose**: Perform scheduled maintenance

**Steps:**
1. Enable maintenance mode
2. Notify users (if needed)
3. Perform maintenance tasks
4. Verify functionality
5. Disable maintenance mode

### Database Maintenance

**Purpose**: Optimize database

**Command:**
```sql
-- Vacuum tables
VACUUM ANALYZE bookings;
VACUUM ANALYZE customers;
VACUUM ANALYZE services;

-- Reindex if needed
REINDEX TABLE bookings;
```

**Steps:**
1. Schedule maintenance window
2. Run vacuum commands
3. Reindex if needed
4. Monitor performance
5. Verify improvements

### Cache Clear

**Purpose**: Clear application cache

**Command:**
```bash
redis-cli
> FLUSHDB
```

**Steps:**
1. Verify cache needs clearing
2. Clear cache
3. Monitor application performance
4. Verify cache rebuilding

## Emergency Procedures

### Emergency Rollback

**Purpose**: Rollback to previous version

**Steps:**
1. Identify rollback commit
2. Stop application
3. Revert code changes
4. Revert database migrations (if needed)
5. Restart application
6. Verify functionality

### Emergency Shutdown

**Purpose**: Emergency application shutdown

**Steps:**
1. Stop accepting new requests
2. Wait for active requests to complete
3. Stop application
4. Document shutdown reason
5. Investigate issue

### Data Recovery

**Purpose**: Recover lost data

**Steps:**
1. Identify data loss scope
2. Locate backup
3. Restore from backup
4. Verify data integrity
5. Resume operations

## Troubleshooting

### Common Issues

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed troubleshooting guides.

### Getting Help

1. Check application logs
2. Review error messages
3. Check monitoring dashboards
4. Consult troubleshooting guide
5. Contact support team

---

**Last Updated**: 2024
**Version**: 1.0.0
