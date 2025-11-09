# Omotenashi Connect

A comprehensive booking and business management platform built with Node.js, TypeScript, Express, and PostgreSQL. Omotenashi Connect provides a complete solution for businesses to manage their services, bookings, customers, staff, payments, and more.

## 🌟 Features

### Core Features
- **Authentication & Authorization**: JWT-based authentication with refresh tokens, role-based access control (Admin, Owner, Staff, Customer)
- **Business Management**: Complete CRUD operations for businesses, settings, hours, holidays, and media
- **Service Catalog**: Manage services with pricing, duration, resources, and cancellation policies
- **Resource Management**: Manage staff, equipment, and other resources
- **Booking System**: Advanced booking system with availability checking, waitlist, and booking history
- **Payment Processing**: Integration with Stripe and PayJP for payment processing, webhooks, and refunds
- **Customer Management**: Complete CRM with customer profiles, notes, and history tracking
- **Staff Management**: Staff assignments, working hours, exceptions, and booking assignments
- **Reviews & Moderation**: Review system with moderation and business responses
- **Media Management**: File uploads to S3 with presigned URLs for secure access
- **Analytics**: Daily analytics aggregation with dashboard statistics
- **Notifications**: Email notifications with SendGrid integration and notification preferences
- **Audit Logging**: Comprehensive audit trail for compliance and tracking
- **Feature Flags**: Feature flag management for gradual rollouts
- **Cancellation Policies**: Flexible cancellation policies with penalties

### Technical Features
- **TypeScript**: Full type safety throughout the codebase
- **PostgreSQL**: Robust relational database with proper associations
- **Redis**: Caching and rate limiting
- **BullMQ**: Job queue system for asynchronous processing
- **Sequelize ORM**: Database abstraction layer
- **Zod Validation**: Runtime type validation for API requests
- **Swagger Documentation**: Auto-generated API documentation
- **Rate Limiting**: Redis-based rate limiting for API protection
- **Email Templates**: Beautiful HTML email templates in Japanese and English
- **Multi-tenancy**: Business isolation and access control
- **Soft Deletes**: Audit trail preservation
- **Transaction Support**: Database transactions for data consistency

## 📋 Prerequisites

- **Node.js**: v18.x or higher
- **PostgreSQL**: v14.x or higher
- **Redis**: v5.0 or higher (for queue and rate limiting)
- **npm**: v9.x or higher

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd omotenashi-connect
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the `.env.example` file to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Server
NODE_ENV=development
PORT=4000
CORS_ORIGIN=http://localhost:3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=omotenashi_connect
DB_USER=postgres
DB_PASSWORD=your_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_ACCESS_SECRET=your_access_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@omotenashi-connect.com
FROM_NAME=Omotenashi Connect
APP_URL=http://localhost:4000

# Payment Gateways
PAY_PROVIDER=payjp  # or 'stripe'
PAYJP_SECRET=your_payjp_secret_key
STRIPE_SECRET=your_stripe_secret_key

# AWS S3 (for media storage)
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET=omotenashi-media
MAX_UPLOAD_SIZE_MB=10

# Logging
LOG_LEVEL=info
```

### 4. Set up the database

Create a PostgreSQL database:

```bash
createdb omotenashi_connect
```

Or using psql:

```sql
CREATE DATABASE omotenashi_connect;
```

### 5. Run database migrations

```bash
npm run migrate
```

### 6. Start the development server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## 📚 API Documentation

Once the server is running, you can access the Swagger API documentation at:

```
http://localhost:4000/docs
```

## 🏗️ Project Structure

```
omotenashi-connect/
├── src/
│   ├── config/          # Configuration files (database, Redis, env, etc.)
│   ├── controllers/     # HTTP request handlers
│   ├── jobs/            # Background job workers (BullMQ)
│   ├── middleware/      # Express middleware (auth, validation, rate limiting)
│   ├── models/          # Sequelize models
│   ├── routes/          # Express route definitions
│   ├── services/        # Business logic services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   ├── validators/      # Zod validation schemas
│   ├── app.ts           # Express app setup
│   └── server.ts         # Server entry point
├── tests/               # Test files
├── migrations/          # Database migrations
├── scripts/             # Utility scripts
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md            # This file
```

## 🔧 Available Scripts

### Development
```bash
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript to JavaScript
npm run start        # Start production server
```

### Database
```bash
npm run migrate      # Run database migrations
npm run migrate:undo # Rollback last migration
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run format       # Format code with Prettier
```

### Email Testing
```bash
npm run test:email   # Test email sending (bypasses queue)
```

## 🔐 Authentication

### Register a new user

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "display_name": "John Doe",
  "role": "customer"
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response includes `accessToken` and `refreshToken`:

```json
{
  "status": "success",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Using the access token

Include the token in the Authorization header:

```bash
Authorization: Bearer <accessToken>
```

### Refresh token

```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "<refreshToken>"
}
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password
- `POST /api/v1/auth/change-password` - Change password
- `POST /api/v1/auth/verify-email` - Verify email address
- `POST /api/v1/auth/resend-verification` - Resend verification email
- `GET /api/v1/auth/me` - Get current user

### Businesses
- `GET /api/v1/businesses` - List businesses
- `POST /api/v1/owner/businesses` - Create business
- `GET /api/v1/businesses/:id` - Get business
- `PUT /api/v1/owner/businesses/:id` - Update business
- `DELETE /api/v1/owner/businesses/:id` - Delete business
- `GET /api/v1/businesses/:id/services` - Get business services

### Services
- `GET /api/v1/services` - List services
- `POST /api/v1/owner/services` - Create service
- `GET /api/v1/services/:id` - Get service
- `PUT /api/v1/owner/services/:id` - Update service
- `DELETE /api/v1/owner/services/:id` - Delete service

### Resources
- `GET /api/v1/resources` - List resources
- `POST /api/v1/owner/resources` - Create resource
- `GET /api/v1/resources/:id` - Get resource
- `PUT /api/v1/owner/resources/:id` - Update resource
- `DELETE /api/v1/owner/resources/:id` - Delete resource

### Bookings
- `GET /api/v1/bookings` - List bookings
- `POST /api/v1/bookings` - Create booking
- `GET /api/v1/bookings/:id` - Get booking
- `PUT /api/v1/bookings/:id` - Update booking
- `DELETE /api/v1/bookings/:id/cancel` - Cancel booking
- `GET /api/v1/availability` - Check availability
- `GET /api/v1/availability/resources` - Get available resources
- `POST /api/v1/waitlist` - Add to waitlist

### Payments
- `POST /api/v1/payments/intent` - Create payment intent
- `POST /api/v1/payments/confirm` - Confirm payment
- `POST /api/v1/payments/:id/refund` - Refund payment
- `GET /api/v1/payments` - List payments
- `GET /api/v1/payments/:id` - Get payment
- `POST /api/v1/payments/webhook/:provider` - Payment webhook

### Customers
- `GET /api/v1/customers` - List customers
- `POST /api/v1/customers` - Create customer
- `GET /api/v1/customers/:id` - Get customer
- `PUT /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer
- `GET /api/v1/customers/:id/history` - Get customer history
- `POST /api/v1/customers/notes` - Create customer note
- `GET /api/v1/customers/notes` - List customer notes
- `GET /api/v1/customers/notes/:id` - Get customer note
- `PUT /api/v1/customers/notes/:id` - Update customer note
- `DELETE /api/v1/customers/notes/:id` - Delete customer note

### Staff
- `GET /api/v1/staff/assignments` - List staff assignments
- `POST /api/v1/staff/assignments` - Create staff assignment
- `GET /api/v1/staff/assignments/:id` - Get staff assignment
- `PUT /api/v1/staff/assignments/:id` - Update staff assignment
- `DELETE /api/v1/staff/assignments/:id/terminate` - Terminate staff assignment
- `PUT /api/v1/staff/working-hours` - Update staff working hours
- `GET /api/v1/staff/working-hours/:resourceId` - Get staff working hours
- `POST /api/v1/staff/exceptions` - Create staff exception
- `GET /api/v1/staff/exceptions` - List staff exceptions
- `GET /api/v1/staff/exceptions/:id` - Get staff exception
- `PUT /api/v1/staff/exceptions/:id` - Update staff exception
- `DELETE /api/v1/staff/exceptions/:id` - Delete staff exception
- `POST /api/v1/staff/assign-to-booking` - Assign staff to booking

### Reviews
- `GET /api/v1/reviews` - List reviews
- `POST /api/v1/reviews` - Create review
- `GET /api/v1/reviews/:id` - Get review
- `PUT /api/v1/reviews/:id` - Update review
- `POST /api/v1/reviews/:id/moderate` - Moderate review
- `POST /api/v1/reviews/:id/respond` - Respond to review
- `DELETE /api/v1/reviews/:id/delete` - Delete review
- `GET /api/v1/businesses/:businessId/reviews/stats` - Get review statistics

### Media
- `GET /api/v1/media` - List media
- `POST /api/v1/media` - Upload media
- `GET /api/v1/media/:id` - Get media
- `PUT /api/v1/media/:id` - Update media
- `DELETE /api/v1/media/:id` - Delete media
- `POST /api/v1/media/reorder` - Reorder media

### Analytics
- `GET /api/v1/analytics` - List analytics
- `GET /api/v1/analytics/:id` - Get analytics
- `GET /api/v1/analytics/dashboard` - Get dashboard statistics
- `GET /api/v1/businesses/:businessId/analytics` - Get business analytics summary

### Notifications
- `GET /api/v1/notifications` - List notifications
- `POST /api/v1/notifications` - Create notification
- `GET /api/v1/notifications/:id` - Get notification
- `PUT /api/v1/notifications/:id` - Update notification
- `POST /api/v1/notifications/:id/retry` - Retry notification
- `GET /api/v1/notifications/preferences` - Get notification preferences
- `PUT /api/v1/notifications/preferences` - Update notification preferences
- `GET /api/v1/notifications/stats` - Get notification statistics

### Policies
- `GET /api/v1/policies` - List cancellation policies
- `POST /api/v1/policies` - Create cancellation policy
- `GET /api/v1/policies/:id` - Get cancellation policy
- `PUT /api/v1/policies/:id` - Update cancellation policy
- `DELETE /api/v1/policies/:id` - Delete cancellation policy

### Feature Flags
- `GET /api/v1/feature-flags` - List feature flags (Admin only)
- `POST /api/v1/feature-flags` - Create feature flag (Admin only)
- `GET /api/v1/feature-flags/:id` - Get feature flag (Admin only)
- `GET /api/v1/feature-flags/check/:name` - Check feature flag
- `PUT /api/v1/feature-flags/:id` - Update feature flag (Admin only)
- `DELETE /api/v1/feature-flags/:id` - Delete feature flag (Admin only)

### Audit Logs
- `GET /api/v1/audit` - List audit logs
- `GET /api/v1/audit/:id` - Get audit log
- `GET /api/v1/audit/entity/:entity/:entityId` - Get entity audit logs

### Admin
- `GET /api/v1/admin/businesses` - List businesses for review (Admin only)
- `GET /api/v1/admin/businesses/:id` - Get business for review (Admin only)
- `POST /api/v1/admin/businesses/:id/approve` - Approve business (Admin only)
- `POST /api/v1/admin/businesses/:id/reject` - Reject business (Admin only)
- `POST /api/v1/admin/businesses/:id/suspend` - Suspend business (Admin only)
- `PUT /api/v1/admin/verifications/:id` - Update verification (Admin only)

## 🗄️ Database Schema

The database uses PostgreSQL with the following main entities:

- **Users**: User accounts with roles (admin, owner, staff, customer)
- **Businesses**: Business profiles with settings, hours, holidays, and media
- **Services**: Service catalog with pricing, duration, and resources
- **Resources**: Staff, equipment, and other bookable resources
- **Bookings**: Booking records with status, history, and reminders
- **Customers**: Customer profiles with notes and preferences
- **Payments**: Payment records with webhook tracking
- **Reviews**: Customer reviews with moderation
- **Staff**: Staff assignments, working hours, and exceptions
- **Analytics**: Daily aggregated analytics data
- **Notifications**: Notification outbox and preferences
- **Audit Logs**: Audit trail for compliance

See `docs/DATABASE_SCHEMA_FINAL.md` for detailed schema documentation.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: Redis-based rate limiting to prevent abuse
- **CORS**: Configurable CORS for API protection
- **Helmet**: Security headers middleware
- **Input Validation**: Zod schema validation for all inputs
- **SQL Injection Protection**: Sequelize ORM with parameterized queries
- **XSS Protection**: Input sanitization and validation
- **Role-Based Access Control**: Fine-grained permissions
- **Audit Logging**: Complete audit trail for compliance

## 📧 Email Configuration

The system uses SendGrid for email delivery. Configure your SendGrid API key in `.env`:

```env
SENDGRID_API_KEY=your_api_key
FROM_EMAIL=noreply@omotenashi-connect.com
FROM_NAME=Omotenashi Connect
```

**Important**: Verify your sender email address in the SendGrid dashboard before sending emails.

Email templates are available in both Japanese and English and include:
- Email verification
- Password reset
- Booking confirmation
- Booking reminders
- Payment received
- Business approval
- Service creation notifications

## 💳 Payment Configuration

The system supports both PayJP and Stripe payment gateways. Configure in `.env`:

```env
PAY_PROVIDER=payjp  # or 'stripe'
PAYJP_SECRET=your_payjp_secret_key
STRIPE_SECRET=your_stripe_secret_key
```

Webhook endpoints are available at:
- `POST /api/v1/payments/webhook/payjp`
- `POST /api/v1/payments/webhook/stripe`

Configure webhook URLs in your payment gateway dashboard.

## 📦 Media Storage (S3)

The system uses AWS S3 for media storage. Configure in `.env`:

```env
AWS_REGION=ap-northeast-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET=omotenashi-media
MAX_UPLOAD_SIZE_MB=10
```

## 🧪 Testing

Run the test suite:

```bash
npm test
```

Run tests with coverage:

```bash
npm run test:coverage
```

Test email sending (bypasses queue):

```bash
npm run test:email
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Ensure all production environment variables are set:
- Database connection strings
- JWT secrets (use strong, random secrets)
- SendGrid API key
- Payment gateway secrets
- AWS S3 credentials
- Redis connection details

### Database Migrations

Run migrations in production:

```bash
npm run migrate
```

### Health Check

The health check endpoint is available at:

```
GET /health

---

Built with ❤️ using Node.js, TypeScript, Express, PostgreSQL, and Redis.
