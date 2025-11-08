# Troubleshooting Guide

## Common Issues

### Database Connection Errors
- Check database credentials in `.env`
- Verify PostgreSQL is running
- Check network connectivity

### Redis Connection Errors
- Verify Redis is running
- Check Redis connection settings
- Test Redis connection manually

### Migration Errors
- Ensure database exists
- Check migration order
- Verify database user permissions

### Authentication Issues
- Verify JWT_SECRET is set
- Check token expiration settings
- Review refresh token configuration

## Debug Mode

Enable debug logging by setting:
```
NODE_ENV=development
LOG_LEVEL=debug
```

