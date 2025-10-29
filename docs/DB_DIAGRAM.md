# DB Diagram Notes

Core: users, roles, businesses, services, staff, bookings, payments, customers, coupons, reviews.
Use tstzrange generated column on bookings + EXCLUDE constraint for anti-double-booking.
