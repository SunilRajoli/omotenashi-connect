# API Conventions

## Endpoint Structure

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Businesses
- `GET /api/businesses` - List businesses
- `POST /api/businesses` - Create business
- `GET /api/businesses/:id` - Get business
- `PUT /api/businesses/:id` - Update business

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking
- `PUT /api/bookings/:id` - Update booking
- `DELETE /api/bookings/:id` - Cancel booking

### CRM Endpoints
- `GET /api/owner/crm/customers` - List customers
- `GET /api/owner/crm/customers/:id` - Get customer details
- `POST /api/owner/crm/customers/:id/notes` - Add customer note

### Reports Endpoints
- `GET /api/owner/reports/summary` - Business summary
- `GET /api/owner/reports/bookings` - Booking reports
- `GET /api/owner/reports/revenue` - Revenue reports

### Feature Flags
- `GET /api/admin/feature-flags` - List feature flags
- `POST /api/admin/feature-flags` - Create feature flag
- `PUT /api/admin/feature-flags/:id` - Update feature flag

## Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Success message"
}
```

## Error Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message"
  }
}
```

