# Security Documentation

## Security Overview

Omotenashi Connect implements multiple layers of security to protect user data, payment information, and system integrity.

## Authentication & Authorization

### JWT Token System

**Access Tokens:**
- **Lifetime**: 15 minutes (configurable)
- **Algorithm**: HS256 (HMAC-SHA256)
- **Storage**: Client-side only (never stored in database)
- **Rotation**: Automatic on refresh

**Refresh Tokens:**
- **Lifetime**: 7 days (configurable)
- **Storage**: Database (hashed)
- **Rotation**: Enabled by default
- **Revocation**: Automatic on logout or rotation

### Token Rotation Strategy

**Rotation Process:**
1. Client sends refresh token
2. Server validates token and checks database
3. Server generates new access token
4. Server generates new refresh token with unique `jti`
5. Old refresh token is revoked
6. New tokens are returned to client

**Rotation Frequency:**
- Every refresh request
- On password change
- On logout

**Secret Rotation:**
- **Frequency**: Every 90 days
- **Procedure**:
  1. Generate new secrets
  2. Update environment variables
  3. Deploy with both old and new secrets
  4. Tokens signed with new secret
  5. Tokens verified with both secrets (grace period)
  6. Remove old secrets after 7 days

### Password Security

- **Hashing**: Bcrypt with 12 salt rounds
- **Minimum Length**: 8 characters
- **Requirements**: 
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Password Reset**: 
  - Token expires in 1 hour
  - Single-use tokens
  - Rate limited: 3 requests per hour per email

## API Security

### Rate Limiting

**Default Limits:**
- **Standard Endpoints**: 100 requests per 15 minutes per IP/user
- **Authentication Endpoints**: 10 requests per 15 minutes per IP
- **Payment Endpoints**: 20 requests per 15 minutes per user
- **Webhook Endpoints**: 1000 requests per hour per IP

**Implementation:**
- Redis-based rate limiting
- Sliding window algorithm
- Per-endpoint configuration
- User-based and IP-based limits

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1638360000
```

### Webhook Signature Verification

**PayJP:**
- **Algorithm**: HMAC-SHA256
- **Header**: `X-Payjp-Signature`
- **Verification**: Compare computed HMAC with header value
- **Secret**: PayJP webhook secret from environment

**Stripe:**
- **Algorithm**: HMAC-SHA256
- **Header**: `Stripe-Signature`
- **Verification**: Stripe SDK signature verification
- **Secret**: Stripe webhook secret from environment

**Implementation:**
```typescript
// Webhook signature verification
const signature = req.headers['x-payjp-signature'];
const computedSignature = createHmac('sha256', webhookSecret)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (signature !== computedSignature) {
  throw new UnauthorizedError('Invalid webhook signature');
}
```

### CORS Configuration

**Production:**
- **Allowed Origins**: Specific domains only
- **Credentials**: Enabled
- **Methods**: GET, POST, PUT, DELETE, PATCH
- **Headers**: Authorization, Content-Type, Accept-Language

**Development:**
- **Allowed Origins**: `http://localhost:3000`
- **Credentials**: Enabled

### Helmet Security Headers

**Enabled Headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- `Content-Security-Policy: default-src 'self'`

## Data Security

### Encryption

**At Rest:**
- **Database**: PostgreSQL encryption at rest (if enabled)
- **S3 Media**: Server-side encryption (SSE-S3)
- **Sensitive Fields**: Encrypted using application-level encryption

**In Transit:**
- **HTTPS**: Enforced in production
- **TLS Version**: 1.2 minimum
- **Certificate**: Valid SSL/TLS certificate required

### Data Retention

**Customer Data:**
- **Retention Period**: 7 years (Japan standard)
- **Deletion**: Soft delete with `deleted_at` timestamp
- **Hard Delete**: After retention period + 30 days grace period

**Payment Data:**
- **Retention**: 7 years (compliance requirement)
- **PCI DSS**: No full card numbers stored
- **Tokenization**: Payment gateway tokens only

**Audit Logs:**
- **Retention**: 5 years
- **Archival**: After 1 year, move to cold storage
- **Deletion**: After retention period

### PII (Personally Identifiable Information)

**PII Fields:**
- Email addresses
- Phone numbers
- Names
- Addresses
- Payment information

**Protection:**
- Access control (role-based)
- Audit logging for access
- Encryption at rest
- Secure transmission (HTTPS)

## Compliance

### GDPR Compliance

**For EU Customers:**
- **Right to Access**: API endpoint for data export
- **Right to Deletion**: Soft delete with data anonymization
- **Right to Rectification**: Update endpoints available
- **Data Portability**: JSON export format
- **Consent Management**: Explicit consent for data processing

**Data Processing:**
- Lawful basis documented
- Data minimization practiced
- Purpose limitation enforced
- Storage limitation (retention policies)

### PCI DSS Compliance

**Payment Card Industry Data Security Standard:**

**Requirements:**
- ✅ No full card numbers stored
- ✅ Payment gateway tokenization
- ✅ Secure transmission (HTTPS)
- ✅ Access control and authentication
- ✅ Network security
- ✅ Regular security testing
- ✅ Security policies and procedures

**Scope:**
- Payment processing endpoints
- Webhook handlers
- Payment data storage
- Network infrastructure

**Validation:**
- Annual PCI DSS assessment
- Quarterly vulnerability scans
- Penetration testing

### Japan Privacy Law Compliance

**Personal Information Protection Act (PIPA):**

**Requirements:**
- **Consent**: Explicit consent for data collection
- **Purpose**: Clear purpose specification
- **Retention**: 7-year retention for business records
- **Security**: Appropriate security measures
- **Disclosure**: Right to request data disclosure
- **Correction**: Right to request data correction
- **Deletion**: Right to request data deletion

**Implementation:**
- Privacy policy available
- Consent management system
- Data retention policies
- Security measures documented
- User rights endpoints

## Security Best Practices

### Development

1. **Never commit secrets** to version control
2. **Use environment variables** for all secrets
3. **Validate all inputs** using Zod schemas
4. **Sanitize user inputs** to prevent XSS
5. **Use parameterized queries** (Sequelize ORM)
6. **Implement proper error handling** (no sensitive data in errors)
7. **Regular dependency updates** (security patches)
8. **Code reviews** for security issues

### Production

1. **Rotate secrets** every 90 days
2. **Monitor security logs** daily
3. **Regular security audits** (quarterly)
4. **Penetration testing** (annually)
5. **Vulnerability scanning** (monthly)
6. **Keep dependencies updated**
7. **Use HTTPS only**
8. **Implement WAF** (Web Application Firewall)

### Secrets Management

**Environment Variables:**
- Never hardcode secrets
- Use `.env` file (not committed)
- Rotate secrets regularly
- Use different secrets per environment

**Secret Rotation:**
1. Generate new secret
2. Update environment variable
3. Deploy with grace period (both secrets valid)
4. Remove old secret after 7 days

**Secrets to Rotate:**
- JWT access secret
- JWT refresh secret
- Database password
- Redis password
- SendGrid API key
- Payment gateway secrets
- AWS access keys

## Security Monitoring

### Security Events to Monitor

1. **Failed Authentication Attempts**
   - Threshold: 5 failures in 15 minutes
   - Action: Temporary account lockout

2. **Suspicious Activity**
   - Multiple IP addresses for same user
   - Unusual access patterns
   - High API request rates

3. **Payment Anomalies**
   - Failed payment attempts
   - Unusual payment amounts
   - Multiple payment methods

4. **Data Access**
   - Unauthorized access attempts
   - Bulk data exports
   - Unusual query patterns

### Security Alerts

**Critical Alerts:**
- Multiple failed login attempts
- Payment gateway failures
- Database connection failures
- Unauthorized access attempts
- Security policy violations

**Alert Channels:**
- Email notifications
- Slack integration
- PagerDuty for critical issues

## Incident Response

### Security Incident Procedure

1. **Identify**: Detect and confirm security incident
2. **Contain**: Isolate affected systems
3. **Eradicate**: Remove threat and vulnerabilities
4. **Recover**: Restore systems to normal operation
5. **Document**: Record incident details and response
6. **Review**: Post-incident review and improvements

### Incident Response Team

- **Security Lead**: Incident response coordination
- **DevOps**: System isolation and recovery
- **Backend Team**: Code fixes and patches
- **Management**: Communication and escalation

### Breach Notification

**Requirements:**
- Notify affected users within 72 hours
- Report to relevant authorities
- Document breach details
- Implement preventive measures

## Security Checklist

### Pre-Deployment

- [ ] All secrets in environment variables
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Input validation implemented
- [ ] Error handling secure (no sensitive data)
- [ ] Dependencies updated
- [ ] Security audit passed

### Post-Deployment

- [ ] Security monitoring enabled
- [ ] Alerts configured
- [ ] Logs reviewed
- [ ] Backup verified
- [ ] Disaster recovery tested
- [ ] Security documentation updated

## Security Resources

- **OWASP Top 10**: Common security vulnerabilities
- **CWE Top 25**: Common weakness enumeration
- **NIST Cybersecurity Framework**: Security best practices
- **PCI DSS Requirements**: Payment security standards
- **GDPR Guidelines**: Data protection regulations

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready

