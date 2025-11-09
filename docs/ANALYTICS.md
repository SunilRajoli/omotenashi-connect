# Analytics & Reporting

## Analytics Overview

Omotenashi Connect provides comprehensive analytics and reporting capabilities for businesses to track performance, revenue, and customer metrics.

## Analytics Metrics Tracked Daily

### Booking Metrics

**Daily Aggregates:**
- **Total Bookings**: Count of all bookings
- **Confirmed Bookings**: Count of confirmed bookings
- **Pending Bookings**: Count of pending bookings
- **Cancelled Bookings**: Count of cancelled bookings
- **No-Show Bookings**: Count of no-show bookings

**Revenue Metrics:**
- **Gross Revenue**: Total revenue (in cents)
- **Net Revenue**: Revenue after refunds
- **Refund Amount**: Total refunds (in cents)
- **Average Booking Value**: Average booking amount

**Booking Trends:**
- **Booking Growth**: Day-over-day growth
- **Cancellation Rate**: Percentage of cancelled bookings
- **No-Show Rate**: Percentage of no-show bookings
- **Booking Source**: Web, owner portal, API

### Customer Metrics

**Customer Statistics:**
- **New Customers**: Count of new customers
- **Returning Customers**: Count of returning customers
- **Total Customers**: Total customer count
- **Active Customers**: Customers with bookings in period

**Customer Behavior:**
- **Average Bookings per Customer**: Booking frequency
- **Customer Lifetime Value**: Total revenue per customer
- **Customer Retention Rate**: Percentage of returning customers

### Service Metrics

**Service Performance:**
- **Service Popularity**: Bookings per service
- **Service Revenue**: Revenue per service
- **Average Service Price**: Average price per service
- **Service Utilization**: Bookings vs. availability

### Resource Metrics

**Resource Utilization:**
- **Resource Usage**: Bookings per resource
- **Resource Availability**: Available vs. booked time
- **Peak Hours**: Most popular booking times
- **Resource Efficiency**: Utilization percentage

### Review Metrics

**Review Statistics:**
- **Total Reviews**: Count of all reviews
- **Average Rating**: Average review rating
- **Review Distribution**: Rating distribution (1-5 stars)
- **Review Response Rate**: Percentage of reviews with business responses

**Review Trends:**
- **Review Growth**: New reviews per day
- **Rating Trends**: Rating changes over time
- **Moderation Rate**: Percentage of moderated reviews

### Payment Metrics

**Payment Statistics:**
- **Payment Success Rate**: Successful payments / total payments
- **Payment Failure Rate**: Failed payments / total payments
- **Average Payment Amount**: Average payment value
- **Payment Method Distribution**: Card, bank transfer, etc.

**Payment Trends:**
- **Payment Growth**: Revenue growth over time
- **Refund Rate**: Percentage of refunds
- **Payment Processing Time**: Average processing time

## Analytics Data Structure

### AnalyticsDaily Model

**Fields:**
- `id`: UUID primary key
- `business_id`: Business reference
- `date`: Date of analytics (DATEONLY)
- `total_bookings`: Total bookings count
- `confirmed_bookings`: Confirmed bookings count
- `pending_bookings`: Pending bookings count
- `cancelled_bookings`: Cancelled bookings count
- `no_show_bookings`: No-show bookings count
- `gross_revenue_cents`: Gross revenue in cents
- `net_revenue_cents`: Net revenue in cents
- `refund_amount_cents`: Refund amount in cents
- `new_customers`: New customers count
- `returning_customers`: Returning customers count
- `total_reviews`: Total reviews count
- `average_rating`: Average review rating
- `created_at`: Record creation timestamp

**Indexes:**
- `business_id, date` (unique composite)
- `date` (for global analytics)

## Analytics Aggregation

### Daily Aggregation Worker

**Schedule:** Daily at 2:00 AM JST (configurable via cron)

**Process:**
1. Calculate metrics for previous day
2. Aggregate booking data
3. Aggregate revenue data
4. Aggregate customer data
5. Aggregate review data
6. Store in `analytics_daily` table

**Implementation:**
- See `src/jobs/analytics.worker.ts`
- Runs via BullMQ scheduled job
- Handles timezone conversion
- Excludes soft-deleted records

## Analytics Endpoints

### List Analytics

**Endpoint:** `GET /api/v1/analytics`

**Query Parameters:**
- `business_id`: Filter by business
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)
- `page`: Page number
- `limit`: Items per page

**Response:**
```json
{
  "status": "success",
  "message": "Analytics retrieved successfully",
  "data": {
    "analytics": [
      {
        "id": "anal_123",
        "business_id": "biz_456",
        "date": "2024-12-25",
        "total_bookings": 50,
        "confirmed_bookings": 45,
        "pending_bookings": 3,
        "cancelled_bookings": 2,
        "gross_revenue_cents": 250000,
        "net_revenue_cents": 240000,
        "new_customers": 10,
        "returning_customers": 35,
        "average_rating": 4.5
      }
    ],
    "pagination": {
      "total": 100,
      "page": 1,
      "limit": 20
    }
  }
}
```

### Get Dashboard Statistics

**Endpoint:** `GET /api/v1/analytics/dashboard`

**Query Parameters:**
- `business_id`: Filter by business
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)

**Response:**
```json
{
  "status": "success",
  "message": "Dashboard statistics retrieved",
  "data": {
    "summary": {
      "total_bookings": 1500,
      "confirmed_bookings": 1350,
      "cancelled_bookings": 100,
      "no_show_bookings": 50,
      "gross_revenue_cents": 7500000,
      "net_revenue_cents": 7200000,
      "average_booking_value_cents": 5000,
      "cancellation_rate": 6.67,
      "no_show_rate": 3.33
    },
    "trends": {
      "booking_growth": 5.2,
      "revenue_growth": 8.5,
      "customer_growth": 12.3
    },
    "top_services": [
      {
        "service_id": "svc_123",
        "name": "Premium Massage",
        "bookings": 200,
        "revenue_cents": 1000000
      }
    ],
    "top_resources": [
      {
        "resource_id": "res_456",
        "name": "Room A",
        "bookings": 150,
        "utilization": 75.5
      }
    ]
  }
}
```

### Get Business Analytics Summary

**Endpoint:** `GET /api/v1/businesses/:businessId/analytics`

**Query Parameters:**
- `start_date`: Start date (YYYY-MM-DD)
- `end_date`: End date (YYYY-MM-DD)

**Response:**
```json
{
  "status": "success",
  "message": "Business analytics summary retrieved",
  "data": {
    "business_id": "biz_123",
    "period": {
      "start_date": "2024-12-01",
      "end_date": "2024-12-31"
    },
    "metrics": {
      "total_bookings": 500,
      "confirmed_bookings": 450,
      "cancelled_bookings": 30,
      "no_show_bookings": 20,
      "gross_revenue_cents": 2500000,
      "net_revenue_cents": 2400000,
      "average_booking_value_cents": 5000,
      "new_customers": 100,
      "returning_customers": 350,
      "total_reviews": 200,
      "average_rating": 4.5
    },
    "trends": {
      "booking_trend": "increasing",
      "revenue_trend": "increasing",
      "rating_trend": "stable"
    }
  }
}
```

## Analytics Queries

### Performance Optimization

**Indexes Used:**
- `business_id, date` for business-specific queries
- `date` for date range queries
- Composite indexes for filtering

**Query Optimization:**
- Use date range filters
- Limit result sets
- Use aggregation functions
- Cache frequently accessed data

### Example Queries

**Daily Revenue:**
```sql
SELECT 
  date,
  SUM(gross_revenue_cents) as total_revenue
FROM analytics_daily
WHERE business_id = $1
  AND date >= $2
  AND date <= $3
GROUP BY date
ORDER BY date DESC;
```

**Service Popularity:**
```sql
SELECT 
  s.id,
  s.name_ja,
  s.name_en,
  COUNT(b.id) as booking_count,
  SUM(b.total_amount_cents) as revenue
FROM services s
LEFT JOIN bookings b ON s.id = b.service_id
WHERE s.business_id = $1
  AND b.deleted_at IS NULL
GROUP BY s.id, s.name_ja, s.name_en
ORDER BY booking_count DESC
LIMIT 10;
```

## Reporting

### Report Types

**1. Revenue Reports**
- Daily, weekly, monthly revenue
- Revenue by service
- Revenue by resource
- Revenue trends

**2. Booking Reports**
- Booking volume trends
- Booking status distribution
- Booking source analysis
- Peak booking times

**3. Customer Reports**
- Customer acquisition
- Customer retention
- Customer lifetime value
- Customer segmentation

**4. Service Reports**
- Service popularity
- Service revenue
- Service utilization
- Service performance

**5. Review Reports**
- Review volume
- Rating distribution
- Review trends
- Response rate

## Analytics Best Practices

### Data Collection

1. **Daily Aggregation**: Run daily at consistent time
2. **Data Accuracy**: Verify calculations
3. **Data Retention**: Keep historical data
4. **Data Privacy**: Anonymize sensitive data

### Performance

1. **Use Indexes**: Query on indexed fields
2. **Cache Results**: Cache frequently accessed data
3. **Limit Date Ranges**: Use reasonable date ranges
4. **Aggregate Data**: Use pre-calculated aggregates

### Reporting

1. **Regular Reports**: Generate regular reports
2. **Trend Analysis**: Track trends over time
3. **Comparative Analysis**: Compare periods
4. **Visualization**: Use charts and graphs

---

**Last Updated**: 2024
**Version**: 1.0.0

