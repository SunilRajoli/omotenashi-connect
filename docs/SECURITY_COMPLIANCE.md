# Security & Compliance

> **Note**: For detailed security documentation, see [SECURITY.md](./SECURITY.md)

## Security Measures

### Authentication
- JWT token-based authentication
- Refresh token rotation
- Password hashing with bcrypt
- Session management

### Data Protection
- Input validation and sanitization
- SQL injection prevention (via Sequelize ORM)
- XSS protection
- CSRF protection

### API Security
- Rate limiting
- Request logging
- Idempotency keys for critical operations
- API key management

### Compliance
- GDPR considerations
- Data retention policies
- Audit logging
- Privacy controls

## Best Practices

- Regular security audits
- Dependency vulnerability scanning
- Secure secret management
- HTTPS enforcement in production

## Compliance Standards

### GDPR (General Data Protection Regulation)

**For EU Customers:**
- Right to access data
- Right to deletion
- Right to rectification
- Data portability
- Consent management

### PCI DSS (Payment Card Industry Data Security Standard)

**Requirements:**
- No full card numbers stored
- Payment gateway tokenization
- Secure transmission (HTTPS)
- Access control and authentication
- Network security
- Regular security testing

### Japan Privacy Law (Personal Information Protection Act)

**Requirements:**
- Explicit consent for data collection
- Clear purpose specification
- 7-year retention for business records
- Appropriate security measures
- User rights (disclosure, correction, deletion)

---

**For detailed security documentation, see [SECURITY.md](./SECURITY.md)**

