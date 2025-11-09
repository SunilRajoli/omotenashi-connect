# Omotenashi Connect Documentation

Welcome to the Omotenashi Connect documentation. This folder contains comprehensive documentation for the entire platform.

## 📚 Documentation Index

### Getting Started
- **[README.md](../README.md)** - Project overview and quick start guide
- **[DOCUMENTATION.md](../DOCUMENTATION.md)** - Complete technical documentation

### Architecture & Design
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and design patterns
- **[BACKEND_OVERVIEW.md](./BACKEND_OVERVIEW.md)** - Backend system overview
- **[SEQUELIZE_ASSOCIATIONS.md](./SEQUELIZE_ASSOCIATIONS.md)** - Database model associations

### API Documentation
- **[API_CONVENTIONS.md](./API_CONVENTIONS.md)** - API design conventions and standards
- **[openapi.yaml](./openapi.yaml)** - OpenAPI specification (main file)
- **[openapi/](./openapi/)** - OpenAPI specification files by resource

### Database
- **[DATABASE_SCHEMA_FINAL.md](./DATABASE_SCHEMA_FINAL.md)** - Complete database schema documentation

### Deployment & Operations
- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Production deployment guide
- **[MONITORING_SETUP.md](./MONITORING_SETUP.md)** - Monitoring and observability setup
- **[RUNBOOKS.md](./RUNBOOKS.md)** - Operational runbooks
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

### Security & Compliance
- **[SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md)** - Security features and compliance

### Localization
- **[JAPAN_LOCALIZATION_GUIDE.md](./JAPAN_LOCALIZATION_GUIDE.md)** - Japanese localization guide

### Testing
- **[TEST_PLAN.md](./TEST_PLAN.md)** - Testing strategy and test plan

## 🚀 Quick Links

### For Developers
1. Start with [README.md](../README.md) for setup
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
3. Check [API_CONVENTIONS.md](./API_CONVENTIONS.md) for API standards
4. Review [DATABASE_SCHEMA_FINAL.md](./DATABASE_SCHEMA_FINAL.md) for data models
5. Follow [DEVELOPMENT_WORKFLOW.md](./DEVELOPMENT_WORKFLOW.md) for development process
6. See [INTERNATIONALIZATION.md](./INTERNATIONALIZATION.md) for i18n guide

### For DevOps
1. Follow [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment
2. Set up [MONITORING_SETUP.md](./MONITORING_SETUP.md) for monitoring
3. Configure [BACKUP_RECOVERY.md](./BACKUP_RECOVERY.md) for backups
4. Review [PERFORMANCE.md](./PERFORMANCE.md) for performance tuning
5. Keep [RUNBOOKS.md](./RUNBOOKS.md) handy for operations
6. Refer to [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for issues

### For Security Team
1. Review [SECURITY.md](./SECURITY.md) for security details
2. Check [SECURITY_COMPLIANCE.md](./SECURITY_COMPLIANCE.md) for compliance
3. Follow security best practices

### For API Consumers
1. Check [openapi.yaml](./openapi.yaml) for API specification
2. Review [API_CONVENTIONS.md](./API_CONVENTIONS.md) for conventions
3. See [DOCUMENTATION.md](../DOCUMENTATION.md) for detailed API docs

## 📖 Documentation Structure

```
docs/
├── README.md                    # This file - documentation index
├── ARCHITECTURE.md              # System architecture
├── BACKEND_OVERVIEW.md          # Backend overview
├── API_CONVENTIONS.md           # API design conventions
├── DATABASE_SCHEMA_FINAL.md     # Database schema
├── DEPLOYMENT_GUIDE.md          # Deployment instructions
├── MONITORING_SETUP.md          # Monitoring setup
├── RUNBOOKS.md                  # Operational runbooks
├── TROUBLESHOOTING.md           # Troubleshooting guide
├── SECURITY_COMPLIANCE.md       # Security documentation
├── JAPAN_LOCALIZATION_GUIDE.md  # Localization guide
├── TEST_PLAN.md                 # Testing strategy
├── SEQUELIZE_ASSOCIATIONS.md    # Model associations
├── openapi.yaml                 # OpenAPI main spec
└── openapi/                     # OpenAPI specs by resource
    ├── auth.yaml
    ├── businesses.yaml
    ├── services.yaml
    ├── bookings.yaml
    ├── payments.yaml
    ├── customers.yaml
    ├── staff.yaml
    ├── reviews.yaml
    ├── media.yaml
    ├── analytics.yaml
    ├── notifications.yaml
    ├── policies.yaml
    ├── feature-flags.yaml
    ├── audit.yaml
    ├── admin.yaml
    ├── schemas.yaml
    └── errors.yaml
```

## 🔄 Documentation Updates

This documentation is maintained alongside the codebase. When adding new features:

1. Update relevant documentation files
2. Add OpenAPI specifications for new endpoints
3. Update database schema documentation if models change
4. Add troubleshooting entries for new features
5. Update deployment guide if infrastructure changes

## 📝 Contributing to Documentation

When contributing:

1. Follow the existing documentation style
2. Use clear, concise language
3. Include code examples where helpful
4. Keep documentation up-to-date with code changes
5. Add diagrams for complex concepts

## 🆘 Need Help?

- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
- Review [RUNBOOKS.md](./RUNBOOKS.md) for operational procedures
- See [DOCUMENTATION.md](../DOCUMENTATION.md) for detailed technical docs

---

**Last Updated**: 2024
**Version**: 0.1.0

