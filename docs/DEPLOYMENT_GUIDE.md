# Deployment Guide

## Prerequisites

- **Node.js**: v22.x
- **PostgreSQL**: v14.x+
- **Redis**: v5.0+
- **Docker**: (optional, for containerized deployment)

## Environment Variables

See `.env.example` for the complete list of required environment variables.

**Required Variables:**
- Database configuration (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASS)
- Redis configuration (REDIS_HOST, REDIS_PORT)
- JWT secrets (JWT_ACCESS_SECRET, JWT_REFRESH_SECRET)
- Payment gateway credentials (PAYJP_SECRET, STRIPE_SECRET)
- Email settings (SENDGRID_API_KEY, FROM_EMAIL, FROM_NAME)
- Storage configuration (AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_BUCKET)

**Production Variables:**
- Use strong, random secrets
- Use environment-specific values
- Never commit `.env` file

## Deployment Steps

### 1. Prepare Environment

```bash
# Clone repository
git clone <repository-url>
cd omotenashi-connect

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env with production values
# Use strong secrets
# Configure all services
```

### 3. Database Setup

```bash
# Create database
createdb omotenashi_connect

# Run migrations
npm run migrate

# (Optional) Run seeders
npm run seed
```

### 4. Build Application

```bash
# Build TypeScript
npm run build

# Verify build
ls -la dist/
```

### 5. Start Application

```bash
# Production start
npm start

# Or with PM2
pm2 start dist/server.js --name omotenashi-connect
```

## Docker Deployment

### Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: omotenashi_connect
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASS}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### Deployment

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Production Considerations

### Environment Configuration

- **Separate Environments**: Development, staging, production
- **Environment Variables**: Use secure secret management
- **Configuration Validation**: Validate all required variables

### SSL/TLS

- **HTTPS Required**: Enforce HTTPS in production
- **Valid Certificate**: Use valid SSL/TLS certificate
- **Certificate Renewal**: Set up automatic renewal

### Logging and Monitoring

- **Structured Logging**: JSON format for production
- **Log Aggregation**: CloudWatch, ELK, or similar
- **APM Tool**: Datadog, New Relic, or AppSignal
- **Health Checks**: `/health` endpoint for monitoring

### Backup Strategies

- **Database Backups**: Daily full, hourly incremental
- **S3 Backups**: Cross-region replication
- **Redis Backups**: RDB snapshots every 6 hours
- **Backup Testing**: Weekly restore tests

See [BACKUP_RECOVERY.md](./BACKUP_RECOVERY.md) for detailed backup procedures.

### CI/CD Pipelines

**Staging Deployment:**
- Automatic on merge to `staging` branch
- Run migrations
- Run smoke tests
- Verify health

**Production Deployment:**
- Manual approval required
- Run migrations
- Gradual rollout (10% → 50% → 100%)
- Monitor metrics
- Verify health

### Scaling

**Horizontal Scaling:**
- Multiple application instances
- Load balancer distribution
- Stateless design

**Vertical Scaling:**
- Increase database resources
- Increase Redis memory
- Increase application memory

### Security

- **Secrets Management**: Use secure secret storage
- **HTTPS Only**: Enforce HTTPS
- **Rate Limiting**: Configure rate limits
- **Security Headers**: Helmet middleware
- **Regular Updates**: Keep dependencies updated

See [SECURITY.md](./SECURITY.md) for detailed security documentation.

## Post-Deployment

### Verification

1. **Health Check**
   ```bash
   curl https://api.example.com/health
   ```

2. **Smoke Tests**
   - Test authentication
   - Test booking creation
   - Test payment processing
   - Test email sending

3. **Monitoring**
   - Check application logs
   - Monitor error rates
   - Monitor response times
   - Monitor queue processing

### Rollback Procedure

**If Issues Detected:**
1. **Immediate Rollback**
   ```bash
   git revert <commit-hash>
   npm run build
   npm start
   ```

2. **Database Rollback**
   ```bash
   npm run migrate:undo
   ```

3. **Verify Rollback**
   - Check application health
   - Verify functionality
   - Monitor metrics

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code review approved
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] Backup verified
- [ ] Rollback plan ready
- [ ] Monitoring configured
- [ ] Alerts configured

### Deployment

- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Verify functionality
- [ ] Deploy to production
- [ ] Gradual rollout
- [ ] Monitor metrics

### Post-Deployment

- [ ] Health checks passing
- [ ] Error rates normal
- [ ] Response times acceptable
- [ ] Queue processing normal
- [ ] Monitor for 1 hour
- [ ] Update documentation

---

**Last Updated**: 2024
**Version**: 1.0.0

