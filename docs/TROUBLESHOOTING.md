# Troubleshooting Guide

## Common Issues

### Database Connection Errors

**Symptoms:**
- `ECONNREFUSED` errors
- `Connection timeout` errors
- `Database does not exist` errors

**Solutions:**
1. Check database credentials in `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=omotenashi_connect
   DB_USER=postgres
   DB_PASS=your_password
   ```

2. Verify PostgreSQL is running:
   ```bash
   # Windows
   Get-Service postgresql*
   
   # Linux/Mac
   sudo systemctl status postgresql
   ```

3. Check network connectivity:
   ```bash
   psql -h localhost -U postgres -d omotenashi_connect
   ```

4. Verify database exists:
   ```sql
   SELECT datname FROM pg_database WHERE datname = 'omotenashi_connect';
   ```

### Redis Connection Errors

**Symptoms:**
- `Redis connection failed` errors
- `Redis version needs to be greater or equal than 5.0.0` errors
- Queue processing not working

**Solutions:**
1. Verify Redis is running:
   ```bash
   # Windows
   redis-cli ping
   
   # Linux/Mac
   sudo systemctl status redis
   ```

2. Check Redis connection settings in `.env`:
   ```env
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

3. Test Redis connection manually:
   ```bash
   redis-cli -h localhost -p 6379 ping
   ```

4. **Note**: In test mode, Redis is mocked to avoid connection issues during testing.

### Migration Errors

**Symptoms:**
- `Migration failed` errors
- `Table already exists` errors
- `ENUM type already exists` errors

**Solutions:**
1. Ensure database exists:
   ```bash
   createdb omotenashi_connect
   ```

2. Check migration order:
   ```bash
   npm run migrate
   ```

3. Verify database user permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE omotenashi_connect TO postgres;
   ```

4. If migrations fail, check for existing tables:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

5. For ENUM type conflicts, drop and recreate:
   ```sql
   DROP TYPE IF EXISTS user_role CASCADE;
   -- Then run migrations again
   ```

### Authentication Issues

**Symptoms:**
- `Invalid token` errors
- `Token expired` errors
- `Unauthorized` errors

**Solutions:**
1. Verify JWT secrets are set in `.env`:
   ```env
   JWT_ACCESS_SECRET=your_access_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret_key
   ```

2. Check token expiration settings:
   ```env
   JWT_ACCESS_EXPIRES=15m
   JWT_REFRESH_EXPIRES=7d
   ```

3. Review refresh token configuration:
   - Refresh tokens are stored in database
   - Token rotation is enabled by default
   - Old refresh tokens are revoked on rotation

4. Clear expired tokens:
   ```sql
   DELETE FROM refresh_tokens WHERE expires_at < NOW();
   ```

### Email Sending Issues

**Symptoms:**
- `403 Forbidden` from SendGrid
- `The from address does not match a verified Sender Identity`
- Emails not being sent

**Solutions:**
1. Verify SendGrid API key in `.env`:
   ```env
   SENDGRID_API_KEY=your_api_key
   ```

2. **Important**: Verify sender email in SendGrid dashboard:
   - Go to SendGrid Dashboard → Settings → Sender Authentication
   - Verify your `FROM_EMAIL` address
   - Update `.env` if needed:
     ```env
     FROM_EMAIL=verified@yourdomain.com
     FROM_NAME=Omotenashi Connect
     ```

3. Check email queue status:
   - Emails are queued via BullMQ
   - Check Redis connection for queue processing
   - Review email worker logs

4. Test email sending:
   ```bash
   npm run test:email
   ```

### Payment Processing Issues

**Symptoms:**
- Payment webhooks not received
- `Invalid webhook signature` errors
- Payment status not updating

**Solutions:**
1. Verify payment gateway secrets:
   ```env
   PAY_PROVIDER=payjp  # or 'stripe'
   PAYJP_SECRET=your_payjp_secret
   STRIPE_SECRET=your_stripe_secret
   ```

2. Configure webhook URLs in payment gateway dashboard:
   - PayJP: `https://yourdomain.com/api/v1/payments/webhook/payjp`
   - Stripe: `https://yourdomain.com/api/v1/payments/webhook/stripe`

3. Verify webhook signature validation:
   - Webhooks are validated for security
   - Check webhook worker logs for errors

4. Check idempotency keys:
   - Payments use idempotency to prevent duplicates
   - Check `idempotency_keys` table for conflicts

### Media Upload Issues

**Symptoms:**
- `S3 upload failed` errors
- `Invalid file type` errors
- `File too large` errors

**Solutions:**
1. Verify AWS S3 credentials:
   ```env
   AWS_REGION=ap-northeast-1
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   S3_BUCKET=omotenashi-media
   ```

2. Check file size limits:
   ```env
   MAX_UPLOAD_SIZE_MB=10
   ```

3. Verify file types:
   - Images: JPEG, PNG, GIF, WebP
   - Videos: MP4, WebM

4. Check S3 bucket permissions:
   - Ensure IAM user has `PutObject`, `GetObject`, `DeleteObject` permissions
   - Verify bucket exists and is accessible

### Rate Limiting Issues

**Symptoms:**
- `Too many requests` errors
- API calls being blocked

**Solutions:**
1. Check rate limit configuration:
   - Default: 100 requests per 15 minutes
   - Can be adjusted per endpoint

2. Verify Redis connection:
   - Rate limiting uses Redis
   - Check Redis connection status

3. Review rate limit keys:
   - Keys are based on user ID or IP address
   - Check Redis for rate limit entries

### Build and TypeScript Errors

**Symptoms:**
- `TypeScript compilation errors`
- `Module not found` errors
- `Unexpected any` lint errors

**Solutions:**
1. Clean and rebuild:
   ```bash
   rm -rf dist node_modules
   npm install
   npm run build
   ```

2. Check TypeScript configuration:
   - Verify `tsconfig.json` settings
   - Ensure all type definitions are included

3. Fix lint errors:
   ```bash
   npm run lint
   npm run lint:fix
   ```

4. Verify all imports:
   - Check import paths are correct
   - Ensure all dependencies are installed

## Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

This will:
- Enable detailed request logging
- Show SQL queries
- Log all service operations
- Show detailed error stacks

## Getting Help

If you encounter issues not covered here:

1. Check application logs:
   ```bash
   # Logs are output to console in development
   # Check logs directory in production
   ```

2. Review error messages:
   - Error messages include context
   - Check error codes and messages

3. Check database state:
   ```sql
   -- Check for orphaned records
   -- Verify foreign key constraints
   -- Review recent data changes
   ```

4. Review Redis state:
   ```bash
   redis-cli
   KEYS *
   # Check queue status
   # Review rate limit keys
   ```

## Common Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 400 | Bad Request | Check request body and parameters |
| 401 | Unauthorized | Verify authentication token |
| 403 | Forbidden | Check user permissions |
| 404 | Not Found | Verify resource exists |
| 409 | Conflict | Check for duplicate resources |
| 429 | Too Many Requests | Wait and retry, check rate limits |
| 500 | Internal Server Error | Check server logs, database connection |
| 503 | Service Unavailable | Check external services (Redis, S3, etc.) |

